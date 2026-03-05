/**
 * OSM Overpass API ingestion script.
 * Fetches geolocated infrastructure from OpenStreetMap and upserts into Supabase.
 *
 * Usage:
 *   npx tsx scripts/ingest-osm.ts                  # all regions
 *   npx tsx scripts/ingest-osm.ts --region Kyiv     # single region
 *   npx tsx scripts/ingest-osm.ts --dry-run         # preview without writing
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { REGIONS, type Region } from './regions.js';

// ---------------------------------------------------------------------------
// Load .env.local (same pattern as seed.ts)
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx > 0) {
    process.env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// ---------------------------------------------------------------------------
// OSM tag → resource type mapping
// ---------------------------------------------------------------------------
type ResourceType = 'shelter' | 'water' | 'food' | 'medical' | 'wifi' | 'transport';

interface TagRule {
  key: string;
  value: string;
  type: ResourceType;
}

const TAG_RULES: TagRule[] = [
  { key: 'amenity', value: 'shelter', type: 'shelter' },
  { key: 'social_facility', value: 'shelter', type: 'shelter' },
  { key: 'amenity', value: 'drinking_water', type: 'water' },
  { key: 'man_made', value: 'water_well', type: 'water' },
  { key: 'amenity', value: 'food_court', type: 'food' },
  { key: 'social_facility', value: 'food_bank', type: 'food' },
  { key: 'amenity', value: 'hospital', type: 'medical' },
  { key: 'amenity', value: 'clinic', type: 'medical' },
  { key: 'amenity', value: 'doctors', type: 'medical' },
  { key: 'internet_access', value: 'wlan', type: 'wifi' },
  { key: 'amenity', value: 'bus_station', type: 'transport' },
  { key: 'public_transport', value: 'station', type: 'transport' },
  { key: 'railway', value: 'station', type: 'transport' },
];

// Types that require a name to be useful
const REQUIRE_NAME: Set<ResourceType> = new Set(['medical', 'transport']);

// ---------------------------------------------------------------------------
// Build Overpass QL query for a bounding box
// ---------------------------------------------------------------------------
function buildOverpassQuery(bbox: [number, number, number, number]): string {
  const [south, west, north, east] = bbox;
  const bboxStr = `${south},${west},${north},${east}`;

  const filters = TAG_RULES.map(
    (r) => `  node["${r.key}"="${r.value}"](${bboxStr});`
  ).join('\n');

  return `[out:json][timeout:90];
(
${filters}
);
out body;`;
}

// ---------------------------------------------------------------------------
// Classify an OSM element by its tags
// ---------------------------------------------------------------------------
function classify(tags: Record<string, string>): ResourceType | null {
  for (const rule of TAG_RULES) {
    if (tags[rule.key] === rule.value) {
      return rule.type;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Build a human-readable description from OSM tags
// ---------------------------------------------------------------------------
function buildDescription(tags: Record<string, string>, type: ResourceType): string {
  const parts: string[] = [];

  if (tags.description) parts.push(tags.description);

  if (tags.operator) parts.push(`Operated by ${tags.operator}`);
  if (tags.capacity) parts.push(`Capacity: ${tags.capacity}`);
  if (tags.opening_hours) parts.push(`Hours: ${tags.opening_hours}`);
  if (tags.emergency === 'yes') parts.push('Emergency services available');
  if (tags.wheelchair === 'yes') parts.push('Wheelchair accessible');

  if (parts.length === 0) {
    const typeLabels: Record<ResourceType, string> = {
      shelter: 'Shelter location',
      water: 'Water access point',
      food: 'Food distribution point',
      medical: 'Medical facility',
      wifi: 'WiFi access point',
      transport: 'Transport hub',
    };
    parts.push(`${typeLabels[type]} (via OpenStreetMap)`);
  }

  return parts.join('. ') + '.';
}

// ---------------------------------------------------------------------------
// Transform OSM element → Supabase resource row
// ---------------------------------------------------------------------------
interface OsmElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

interface ResourceRow {
  type: ResourceType;
  title: string;
  description: string;
  lat: number;
  lng: number;
  contact_info: string | null;
  source: string;
  source_id: string;
  updated_at: string;
}

function transform(el: OsmElement): ResourceRow | null {
  const resourceType = classify(el.tags);
  if (!resourceType) return null;

  const name = el.tags['name:en'] || el.tags.name;
  if (!name && REQUIRE_NAME.has(resourceType)) return null;

  const title = name || buildFallbackTitle(resourceType);

  return {
    type: resourceType,
    title: title.slice(0, 200),
    description: buildDescription(el.tags, resourceType),
    lat: el.lat,
    lng: el.lon,
    contact_info: el.tags.phone || el.tags['contact:phone'] || null,
    source: 'osm',
    source_id: `${el.type}/${el.id}`,
    updated_at: new Date().toISOString(),
  };
}

function buildFallbackTitle(type: ResourceType): string {
  const fallbacks: Record<ResourceType, string> = {
    shelter: 'Shelter',
    water: 'Water Point',
    food: 'Food Distribution',
    medical: 'Medical Facility',
    wifi: 'WiFi Access',
    transport: 'Transport Station',
  };
  return fallbacks[type];
}

// ---------------------------------------------------------------------------
// Fetch from Overpass API
// ---------------------------------------------------------------------------
async function fetchOverpass(query: string, retries = 3): Promise<OsmElement[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (res.ok) {
      const json = await res.json();
      return json.elements || [];
    }

    if ((res.status === 429 || res.status === 504) && attempt < retries) {
      const wait = attempt * 5;
      console.log(`  Overpass ${res.status}, retrying in ${wait}s (attempt ${attempt}/${retries})...`);
      await new Promise((resolve) => setTimeout(resolve, wait * 1000));
      continue;
    }

    const text = await res.text();
    throw new Error(`Overpass API error ${res.status}: ${text.slice(0, 200)}`);
  }

  return [];
}

// ---------------------------------------------------------------------------
// Upsert batch into Supabase
// ---------------------------------------------------------------------------
async function upsertBatch(rows: ResourceRow[]): Promise<{ ok: number; failed: number }> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/resources?on_conflict=source,source_id`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(rows),
    }
  );

  if (res.ok) {
    const data = await res.json();
    return { ok: data.length, failed: 0 };
  } else {
    const err = await res.text();
    console.error(`  Upsert failed: ${err}`);
    return { ok: 0, failed: rows.length };
  }
}

// ---------------------------------------------------------------------------
// Process a single region
// ---------------------------------------------------------------------------
async function processRegion(
  region: Region,
  dryRun: boolean
): Promise<{ fetched: number; inserted: number; failed: number }> {
  console.log(`\n--- ${region.name} ---`);

  const query = buildOverpassQuery(region.bbox);
  const elements = await fetchOverpass(query);
  console.log(`  Fetched ${elements.length} OSM elements`);

  const rows = elements
    .map(transform)
    .filter((r): r is ResourceRow => r !== null);
  console.log(`  Mapped to ${rows.length} resources (${elements.length - rows.length} skipped)`);

  if (dryRun) {
    const typeCounts: Record<string, number> = {};
    for (const r of rows) {
      typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    }
    console.log('  Types:', typeCounts);
    return { fetched: elements.length, inserted: rows.length, failed: 0 };
  }

  let totalOk = 0;
  let totalFailed = 0;

  for (let i = 0; i < rows.length; i += 20) {
    const batch = rows.slice(i, i + 20);
    const result = await upsertBatch(batch);
    totalOk += result.ok;
    totalFailed += result.failed;
    console.log(`  Batch ${Math.floor(i / 20) + 1}: upserted ${result.ok}, failed ${result.failed}`);
  }

  return { fetched: elements.length, inserted: totalOk, failed: totalFailed };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('your-project')) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const regionIdx = args.indexOf('--region');
  const regionName = regionIdx !== -1 ? args[regionIdx + 1] : null;

  if (dryRun) console.log('** DRY RUN — no data will be written **\n');

  let regions = REGIONS;
  if (regionName) {
    const match = REGIONS.filter(
      (r) => r.name.toLowerCase() === regionName.toLowerCase()
    );
    if (match.length === 0) {
      console.error(`Unknown region "${regionName}". Available: ${REGIONS.map((r) => r.name).join(', ')}`);
      process.exit(1);
    }
    regions = match;
  }

  console.log(`Processing ${regions.length} region(s)...`);

  let totalFetched = 0;
  let totalInserted = 0;
  let totalFailed = 0;

  let skippedRegions = 0;

  for (let i = 0; i < regions.length; i++) {
    try {
      const result = await processRegion(regions[i], dryRun);
      totalFetched += result.fetched;
      totalInserted += result.inserted;
      totalFailed += result.failed;
    } catch (err) {
      console.error(`  SKIPPED ${regions[i].name}: ${err instanceof Error ? err.message : err}`);
      skippedRegions++;
    }

    // Rate limit courtesy: 5s delay between regions
    if (i < regions.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`Regions:  ${regions.length} (${skippedRegions} skipped)`);
  console.log(`Fetched:  ${totalFetched} OSM elements`);
  console.log(`Upserted: ${totalInserted} resources`);
  console.log(`Failed:   ${totalFailed}`);
  if (dryRun) console.log('(dry run — nothing was written)');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

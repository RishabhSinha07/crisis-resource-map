/**
 * Pre-fetches OSM tiles for a given map bounds at multiple zoom levels
 * so they're available offline via the service worker's CacheFirst strategy.
 */

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

function getCartoStyle(): 'dark_all' | 'rastertiles/voyager' {
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    return stored === 'light' ? 'rastertiles/voyager' : 'dark_all';
  } catch {
    return 'dark_all';
  }
}

function getTileUrls(bounds: Bounds, zoom: number): string[] {
  const servers = ['a', 'b', 'c'];
  const style = getCartoStyle();
  const min = latLngToTile(bounds.north, bounds.west, zoom);
  const max = latLngToTile(bounds.south, bounds.east, zoom);

  const urls: string[] = [];
  for (let x = min.x; x <= max.x; x++) {
    for (let y = min.y; y <= max.y; y++) {
      const server = servers[(x + y) % 3];
      urls.push(`https://${server}.basemaps.cartocdn.com/${style}/${zoom}/${x}/${y}.png`);
    }
  }
  return urls;
}

export interface CacheProgress {
  total: number;
  done: number;
  failed: number;
}

export async function cacheTilesForArea(
  bounds: Bounds,
  currentZoom: number,
  onProgress?: (progress: CacheProgress) => void
): Promise<CacheProgress> {
  // Cache tiles from current zoom down to zoom+3 (4 zoom levels)
  const minZoom = Math.max(currentZoom - 2, 1);
  const maxZoom = Math.min(currentZoom + 2, 18);

  const allUrls: string[] = [];
  for (let z = minZoom; z <= maxZoom; z++) {
    allUrls.push(...getTileUrls(bounds, z));
  }

  // Cap at 500 tiles to avoid excessive downloads
  const urls = allUrls.slice(0, 500);

  const progress: CacheProgress = { total: urls.length, done: 0, failed: 0 };
  onProgress?.(progress);

  // Fetch in batches of 10
  const batchSize = 10;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((url) => fetch(url, { mode: 'cors' }))
    );
    for (const result of results) {
      if (result.status === 'fulfilled') {
        progress.done++;
      } else {
        progress.failed++;
      }
    }
    onProgress?.({ ...progress });
  }

  return progress;
}

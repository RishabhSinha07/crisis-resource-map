'use client';

import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useMapStore } from '@/stores/map-store';
import { useTranslations } from 'next-intl';

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function SearchBar() {
  const t = useTranslations('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const flyTo = useMapStore((s) => s.flyTo);
  const debounce = useRef<ReturnType<typeof setTimeout>>(null);

  function handleSearch(value: string) {
    setQuery(value);
    if (debounce.current) clearTimeout(debounce.current);

    if (value.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`,
          { headers: { 'User-Agent': 'CrisisResourceMap/1.0' } }
        );
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }

  function selectResult(result: NominatimResult) {
    flyTo([parseFloat(result.lat), parseFloat(result.lon)], 13);
    setQuery(result.display_name.split(',')[0]);
    setShowResults(false);
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-dim)' }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={t('placeholder')}
          className="tac-input w-full pl-9 pr-8"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setShowResults(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-sm hover:bg-white/5"
          >
            <X size={12} style={{ color: 'var(--text-dim)' }} />
          </button>
        )}
      </div>

      {showResults && (
        <div
          className="absolute top-full mt-1 inset-x-0 z-50 overflow-hidden"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: '2px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          {loading && (
            <div
              className="px-4 py-3 text-xs"
              style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}
            >
              SEARCHING...
            </div>
          )}
          {!loading && results.length === 0 && query.length >= 3 && (
            <div
              className="px-4 py-3 text-xs"
              style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}
            >
              {t('noResults')}
            </div>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => selectResult(r)}
              className="w-full text-left px-4 py-2.5 text-xs truncate transition-colors hover:bg-white/5"
              style={{
                color: 'var(--text-secondary)',
                borderBottom: '1px solid var(--border-dim)',
              }}
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

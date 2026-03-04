'use client';

import { useState } from 'react';
import { Download, Check, X } from 'lucide-react';
import { useMapStore } from '@/stores/map-store';
import { cacheTilesForArea, type CacheProgress } from '@/lib/tile-cache';
import { useTranslations } from 'next-intl';

export function SaveOfflineButton() {
  const t = useTranslations('offline');
  const { center, zoom } = useMapStore();
  const [state, setState] = useState<'idle' | 'downloading' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState<CacheProgress | null>(null);

  async function handleSave() {
    setState('downloading');

    const latRange = 180 / Math.pow(2, zoom);
    const lngRange = 360 / Math.pow(2, zoom);
    const bounds = {
      north: center[0] + latRange,
      south: center[0] - latRange,
      east: center[1] + lngRange,
      west: center[1] - lngRange,
    };

    try {
      const result = await cacheTilesForArea(bounds, zoom, (p) => setProgress(p));
      setState(result.failed > result.done ? 'error' : 'done');
      setTimeout(() => setState('idle'), 3000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }

  const baseStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-medium)',
    borderRadius: '2px',
    fontFamily: 'var(--font-mono)',
  };

  if (state === 'downloading' && progress) {
    const pct = Math.round((progress.done / progress.total) * 100);
    return (
      <div
        className="fixed bottom-20 left-4 z-[1000] flex items-center gap-3 px-4 py-2.5"
        style={baseStyle}
      >
        <div className="relative w-7 h-7">
          <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border-medium)" strokeWidth="2.5" />
            <circle
              cx="18" cy="18" r="14" fill="none" stroke="var(--accent-amber)" strokeWidth="2.5"
              strokeDasharray={`${pct * 0.88} 88`}
              strokeLinecap="round"
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
            style={{ color: 'var(--accent-amber)' }}
          >
            {pct}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
          {t('savingArea')}
        </span>
      </div>
    );
  }

  if (state === 'done') {
    return (
      <div
        className="fixed bottom-20 left-4 z-[1000] flex items-center gap-2 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
        style={{ ...baseStyle, borderColor: 'rgba(0, 210, 106, 0.3)', color: 'var(--accent-green)' }}
      >
        <Check size={12} />
        {t('areaSaved')}
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div
        className="fixed bottom-20 left-4 z-[1000] flex items-center gap-2 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
        style={{ ...baseStyle, borderColor: 'rgba(255, 71, 87, 0.3)', color: 'var(--accent-red)' }}
      >
        <X size={12} />
        {t('saveFailed')}
      </div>
    );
  }

  return (
    <button
      onClick={handleSave}
      className="fixed bottom-20 left-4 z-[1000] flex items-center gap-2 tac-btn"
      style={{
        ...baseStyle,
        color: 'var(--text-secondary)',
        padding: '10px 14px',
      }}
      title={t('saveArea')}
    >
      <Download size={14} style={{ color: 'var(--accent-amber)' }} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">
        {t('saveArea')}
      </span>
    </button>
  );
}

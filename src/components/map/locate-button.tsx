'use client';

import { useState } from 'react';
import { Navigation } from 'lucide-react';
import { useMapStore } from '@/stores/map-store';
import { useTranslations } from 'next-intl';

export function LocateButton() {
  const t = useTranslations('search');
  const flyTo = useMapStore((s) => s.flyTo);
  const setUserLocation = useMapStore((s) => s.setUserLocation);
  const [locating, setLocating] = useState(false);

  function locateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc, pos.coords.accuracy);
        flyTo(loc, 15);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <button
      onClick={locateMe}
      disabled={locating}
      className="fixed bottom-[72px] right-6 z-[1000] flex items-center justify-center w-11 h-11"
      style={{
        background: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: '2px',
      }}
      title={t('locateMe')}
    >
      <Navigation
        size={16}
        className={locating ? 'animate-pulse' : ''}
        style={{ color: 'var(--accent-cyan)' }}
      />
    </button>
  );
}

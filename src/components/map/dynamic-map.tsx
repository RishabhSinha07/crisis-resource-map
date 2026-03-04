'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./map-view'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.2em] animate-pulse"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
      >
        Initializing map...
      </span>
    </div>
  ),
});

export default MapView;

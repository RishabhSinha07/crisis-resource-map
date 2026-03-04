'use client';

import { WifiOff } from 'lucide-react';
import { useResourceStore } from '@/stores/resource-store';
import { useTranslations } from 'next-intl';

export function OfflineBanner() {
  const t = useTranslations('offline');
  const isOffline = useResourceStore((s) => s.isOffline);

  if (!isOffline) return null;

  return (
    <div
      className="px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2"
      style={{
        background: 'var(--accent-red-dim)',
        color: 'var(--accent-red)',
        fontFamily: 'var(--font-mono)',
        borderBottom: '1px solid rgba(255, 71, 87, 0.2)',
      }}
    >
      <WifiOff size={12} />
      {t('banner')}
    </div>
  );
}

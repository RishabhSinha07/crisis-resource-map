'use client';

import DynamicMap from '@/components/map/dynamic-map';
import { FilterBar } from '@/components/filters/filter-bar';
import { SearchBar } from '@/components/filters/search-bar';
import { AddResourceDrawer } from '@/components/resources/add-resource-drawer';
import { LocateButton } from '@/components/map/locate-button';
import { SaveOfflineButton } from '@/components/map/save-offline-button';
import { LanguagePicker } from '@/components/ui/language-picker';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { useResources } from '@/hooks/use-resources';
import { useResourceStore } from '@/stores/resource-store';
import { useTranslations } from 'next-intl';
import { Shield, Star, Github } from 'lucide-react';
import type { Resource } from '@/lib/types';

interface MapPageClientProps {
  initialResources: Resource[];
}

export function MapPageClient({ initialResources }: MapPageClientProps) {
  const t = useTranslations('app');
  useResources(initialResources);
  const resources = useResourceStore((s) => s.resources);

  return (
    <div className="h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <OfflineBanner />

      {/* Header — tactical ops bar */}
      <header
        className="z-[500] px-4 py-2.5"
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-dim)',
        }}
      >
        {/* Top row: branding + language */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 flex items-center justify-center"
              style={{
                background: 'var(--accent-amber-dim)',
                border: '1px solid rgba(240, 165, 0, 0.3)',
                borderRadius: '2px',
              }}
            >
              <Shield size={16} style={{ color: 'var(--accent-amber)' }} />
            </div>
            <div>
              <h1
                className="text-xs font-bold tracking-[0.15em] uppercase"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
              >
                {t('title')}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="status-dot" style={{ background: 'var(--accent-green)' }} />
                <span
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}
                >
                  {resources.length} {t('subtitle')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/RishabhSinha07/crisis-resource-map"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] uppercase tracking-wider transition-colors hover:opacity-80"
              style={{
                color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
                border: '1px solid var(--border-dim)',
                borderRadius: '2px',
              }}
            >
              <Github size={13} />
              <Star size={11} />
              <span>Star</span>
            </a>
            <ThemeToggle />
            <LanguagePicker />
          </div>
        </div>

        {/* Search */}
        <div className="mb-2.5">
          <SearchBar />
        </div>

        {/* Filters */}
        <FilterBar />
      </header>

      {/* Map */}
      <main className="flex-1 relative">
        <DynamicMap />
        <LocateButton />
        <SaveOfflineButton />
        <AddResourceDrawer />
      </main>
    </div>
  );
}

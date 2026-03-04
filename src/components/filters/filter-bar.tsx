'use client';

import { useResourceStore } from '@/stores/resource-store';
import { RESOURCE_TYPES } from '@/lib/constants';
import { useTranslations } from 'next-intl';

export function FilterBar() {
  const t = useTranslations();
  const { activeFilters, toggleFilter, clearFilters } = useResourceStore();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
      <button
        onClick={clearFilters}
        className="shrink-0 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-all"
        style={{
          fontFamily: 'var(--font-mono)',
          borderRadius: '2px',
          border: '1px solid',
          ...(activeFilters.size === 0
            ? {
                background: 'var(--accent-amber)',
                color: 'var(--bg-primary)',
                borderColor: 'var(--accent-amber)',
              }
            : {
                background: 'transparent',
                color: 'var(--text-dim)',
                borderColor: 'var(--border-medium)',
              }),
        }}
      >
        {t('filters.all')}
      </button>
      {RESOURCE_TYPES.map((rt) => {
        const active = activeFilters.has(rt.value);
        return (
          <button
            key={rt.value}
            onClick={() => toggleFilter(rt.value)}
            className="shrink-0 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-all flex items-center gap-1.5"
            style={{
              fontFamily: 'var(--font-mono)',
              borderRadius: '2px',
              border: '1px solid',
              ...(active
                ? {
                    background: rt.color,
                    color: '#fff',
                    borderColor: rt.color,
                    boxShadow: `0 0 12px ${rt.color}40`,
                  }
                : {
                    background: 'transparent',
                    color: 'var(--text-dim)',
                    borderColor: 'var(--border-medium)',
                  }),
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: active ? '#fff' : rt.color }}
            />
            {t(`resources.${rt.value}`)}
          </button>
        );
      })}
    </div>
  );
}

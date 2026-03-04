'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { LOCALES, LOCALE_NAMES } from '@/lib/constants';
import type { Locale } from '@/lib/constants';

export function LanguagePicker() {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: Locale) {
    const segments = pathname.split('/');
    if (LOCALES.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/'));
  }

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors"
        style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-dim)',
          border: '1px solid var(--border-medium)',
          borderRadius: '2px',
          background: 'transparent',
        }}
        title={t('label')}
      >
        <Globe size={12} />
        <span>{LOCALE_NAMES[locale as Locale]}</span>
      </button>
      <div
        className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-1 py-1 hidden group-hover:block z-50 min-w-[140px]"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          borderRadius: '2px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        {LOCALES.map((loc) => (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            className="w-full text-left rtl:text-right px-4 py-2 text-xs transition-colors hover:bg-white/5"
            style={{
              fontFamily: loc === locale ? 'var(--font-mono)' : 'var(--font-sans)',
              color: loc === locale ? 'var(--accent-amber)' : 'var(--text-secondary)',
              fontWeight: loc === locale ? 600 : 400,
            }}
          >
            {LOCALE_NAMES[loc]}
          </button>
        ))}
      </div>
    </div>
  );
}

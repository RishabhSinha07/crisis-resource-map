'use client';

import { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore, hydrateTheme } from '@/stores/theme-store';
import { useTranslations } from 'next-intl';

export function ThemeToggle() {
  const t = useTranslations('theme');
  const { theme, toggleTheme, setTheme } = useThemeStore();

  useEffect(() => {
    hydrateTheme();

    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e: MediaQueryListEvent) => {
      // Only follow system if no stored preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setTheme]);

  const label = theme === 'dark' ? t('switchToLight') : t('switchToDark');

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors"
      style={{
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-dim)',
        border: '1px solid var(--border-medium)',
        borderRadius: '2px',
        background: 'transparent',
      }}
      title={label}
      aria-label={label}
    >
      {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
    </button>
  );
}

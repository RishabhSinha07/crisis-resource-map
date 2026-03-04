import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // localStorage unavailable
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },
}));

/** Call on mount to sync store with DOM (in case script ran before store init). */
export function hydrateTheme() {
  const el = document.documentElement.dataset.theme as Theme | undefined;
  if (el === 'dark' || el === 'light') {
    useThemeStore.setState({ theme: el });
  }
}

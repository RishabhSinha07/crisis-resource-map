import type { ResourceType } from './types';

export const RESOURCE_TYPES: { value: ResourceType; label: string; color: string; icon: string }[] = [
  { value: 'shelter', label: 'Shelter', color: '#3b82f6', icon: 'Home' },
  { value: 'water', label: 'Water', color: '#06b6d4', icon: 'Droplets' },
  { value: 'food', label: 'Food', color: '#22c55e', icon: 'UtensilsCrossed' },
  { value: 'medical', label: 'Medical', color: '#ef4444', icon: 'Heart' },
  { value: 'wifi', label: 'WiFi', color: '#a855f7', icon: 'Wifi' },
  { value: 'transport', label: 'Transport', color: '#f59e0b', icon: 'Bus' },
];

export const RESOURCE_TYPE_MAP = Object.fromEntries(
  RESOURCE_TYPES.map((rt) => [rt.value, rt])
) as Record<ResourceType, (typeof RESOURCE_TYPES)[number]>;

export const DEFAULT_CENTER: [number, number] = [34.0, 36.0]; // Middle East region
export const DEFAULT_ZOOM = 6;

export const LOCALES = ['en', 'ar', 'uk', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  uk: 'Українська',
  fr: 'Français',
};

export const RTL_LOCALES: Locale[] = ['ar'];

export const DOWNVOTE_FLAG_RATIO = 0.6;

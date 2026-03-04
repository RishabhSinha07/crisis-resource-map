import L from 'leaflet';
import type { ResourceType } from './types';
import { RESOURCE_TYPE_MAP } from './constants';

const svgIcon = (color: string, symbol: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40" width="28" height="40">
    <polygon points="14,40 0,14 4,4 24,4 28,14" fill="${color}" opacity="0.9" stroke="#0c0f14" stroke-width="1"/>
    <rect x="6" y="6" width="16" height="16" rx="1" fill="#0c0f14" opacity="0.85"/>
    <text x="14" y="18" text-anchor="middle" font-size="11" font-family="monospace" font-weight="bold" fill="${color}">${symbol}</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });
};

const SYMBOLS: Record<ResourceType, string> = {
  shelter: 'S',
  water: 'W',
  food: 'F',
  medical: '+',
  wifi: '@',
  transport: 'T',
};

export function getMarkerIcon(type: ResourceType) {
  const config = RESOURCE_TYPE_MAP[type];
  return svgIcon(config.color, SYMBOLS[type]);
}

export const pinIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40" width="28" height="40">
    <polygon points="14,40 0,14 4,4 24,4 28,14" fill="#f0a500" opacity="0.9" stroke="#0c0f14" stroke-width="1"/>
    <circle cx="14" cy="13" r="4" fill="#0c0f14"/>
    <circle cx="14" cy="13" r="2" fill="#f0a500"/>
  </svg>`,
  className: 'custom-marker',
  iconSize: [28, 40],
  iconAnchor: [14, 40],
});

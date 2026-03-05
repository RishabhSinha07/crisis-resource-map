/**
 * Crisis region bounding boxes for OSM Overpass API queries.
 * Each bbox: [south, west, north, east] (latitude, longitude).
 */

export interface Region {
  name: string;
  bbox: [number, number, number, number];
}

export const REGIONS: Region[] = [
  // Ukraine
  { name: 'Kyiv', bbox: [50.35, 30.35, 50.55, 30.65] },
  { name: 'Lviv', bbox: [49.79, 23.95, 49.89, 24.10] },
  { name: 'Kharkiv', bbox: [49.93, 36.15, 50.05, 36.35] },
  { name: 'Odesa', bbox: [46.40, 30.65, 46.55, 30.80] },

  // Syria
  { name: 'Damascus', bbox: [33.45, 36.22, 33.56, 36.35] },
  { name: 'Aleppo', bbox: [36.15, 37.10, 36.25, 37.22] },

  // Lebanon
  { name: 'Beirut', bbox: [33.83, 35.45, 33.92, 35.55] },

  // Palestine / Gaza
  { name: 'Gaza', bbox: [31.22, 34.20, 31.60, 34.56] },
  { name: 'Ramallah', bbox: [31.87, 35.17, 31.93, 35.23] },

  // Yemen
  { name: 'Sanaa', bbox: [15.30, 44.15, 15.40, 44.25] },
  { name: 'Aden', bbox: [12.75, 44.97, 12.83, 45.07] },

  // Sudan
  { name: 'Khartoum', bbox: [15.53, 32.47, 15.65, 32.60] },
  { name: 'Port Sudan', bbox: [19.58, 37.18, 19.65, 37.26] },

  // DR Congo
  { name: 'Goma', bbox: [-1.72, 29.19, -1.64, 29.27] },

  // Afghanistan
  { name: 'Kabul', bbox: [34.48, 69.10, 34.58, 69.22] },

  // Myanmar
  { name: 'Sittwe', bbox: [20.12, 92.86, 20.17, 92.93] },

  // Ethiopia
  { name: 'Mekelle', bbox: [13.46, 39.43, 13.53, 39.51] },

  // Somalia
  { name: 'Mogadishu', bbox: [2.00, 45.28, 2.08, 45.38] },

  // Poland (refugee support)
  { name: 'Warsaw', bbox: [52.17, 20.90, 52.30, 21.10] },
  { name: 'Przemysl', bbox: [49.75, 22.73, 49.81, 22.80] },

  // Turkey
  { name: 'Gaziantep', bbox: [37.02, 37.32, 37.10, 37.42] },

  // Jordan
  { name: 'Zaatari', bbox: [32.27, 36.30, 32.32, 36.35] },

  // USA — Disaster-prone areas
  // Gulf Coast (hurricanes, flooding)
  { name: 'Houston', bbox: [29.55, -95.60, 29.90, -95.15] },
  { name: 'New Orleans', bbox: [29.87, -90.14, 30.05, -89.87] },
  { name: 'Miami', bbox: [25.70, -80.35, 25.86, -80.13] },
  { name: 'Tampa', bbox: [27.87, -82.55, 28.00, -82.40] },
  // Tornado Alley
  { name: 'Oklahoma City', bbox: [35.35, -97.65, 35.55, -97.40] },
  { name: 'Dallas', bbox: [32.65, -96.95, 32.90, -96.65] },
  // Earthquake zones
  { name: 'Los Angeles', bbox: [33.90, -118.40, 34.10, -118.15] },
  { name: 'San Francisco', bbox: [37.70, -122.52, 37.82, -122.35] },
  { name: 'Seattle', bbox: [47.50, -122.40, 47.70, -122.25] },
  // Wildfire-prone areas
  { name: 'Denver', bbox: [39.63, -105.05, 39.80, -104.85] },
  { name: 'Sacramento', bbox: [38.50, -121.55, 38.62, -121.40] },
];

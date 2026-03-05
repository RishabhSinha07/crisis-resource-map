import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/constants';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface MapState {
  center: [number, number];
  zoom: number;
  bounds: MapBounds | null;
  placingPin: boolean;
  pinnedLocation: [number, number] | null;
  userLocation: [number, number] | null;
  userAccuracy: number;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setBounds: (bounds: MapBounds) => void;
  setPlacingPin: (placing: boolean) => void;
  setPinnedLocation: (loc: [number, number] | null) => void;
  setUserLocation: (loc: [number, number] | null, accuracy?: number) => void;
  flyTo: (center: [number, number], zoom?: number) => void;
}

export const useMapStore = create<MapState>()(subscribeWithSelector((set) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  bounds: null,
  placingPin: false,
  pinnedLocation: null,
  userLocation: null,
  userAccuracy: 0,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setBounds: (bounds) => set({ bounds }),
  setPlacingPin: (placing) => set(placing ? { placingPin: true, pinnedLocation: null } : { placingPin: false }),
  setPinnedLocation: (loc) => set({ pinnedLocation: loc }),
  setUserLocation: (loc, accuracy) => set({ userLocation: loc, userAccuracy: accuracy ?? 0 }),
  flyTo: (center, zoom) => set({ center, zoom: zoom ?? DEFAULT_ZOOM }),
})));

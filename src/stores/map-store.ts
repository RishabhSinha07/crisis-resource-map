import { create } from 'zustand';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/constants';

interface MapState {
  center: [number, number];
  zoom: number;
  placingPin: boolean;
  pinnedLocation: [number, number] | null;
  userLocation: [number, number] | null;
  userAccuracy: number;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setPlacingPin: (placing: boolean) => void;
  setPinnedLocation: (loc: [number, number] | null) => void;
  setUserLocation: (loc: [number, number] | null, accuracy?: number) => void;
  flyTo: (center: [number, number], zoom?: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  placingPin: false,
  pinnedLocation: null,
  userLocation: null,
  userAccuracy: 0,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setPlacingPin: (placing) => set(placing ? { placingPin: true, pinnedLocation: null } : { placingPin: false }),
  setPinnedLocation: (loc) => set({ pinnedLocation: loc }),
  setUserLocation: (loc, accuracy) => set({ userLocation: loc, userAccuracy: accuracy ?? 0 }),
  flyTo: (center, zoom) => set({ center, zoom: zoom ?? DEFAULT_ZOOM }),
}));

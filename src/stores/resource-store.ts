import { create } from 'zustand';
import type { Resource, ResourceType } from '@/lib/types';

interface ResourceState {
  resources: Resource[];
  activeFilters: Set<ResourceType>;
  isOffline: boolean;
  setResources: (resources: Resource[]) => void;
  mergeResources: (resources: Resource[]) => void;
  addResource: (resource: Resource) => void;
  updateResource: (resource: Resource) => void;
  toggleFilter: (type: ResourceType) => void;
  clearFilters: () => void;
  setOffline: (offline: boolean) => void;
  filteredResources: () => Resource[];
}

export const useResourceStore = create<ResourceState>((set, get) => ({
  resources: [],
  activeFilters: new Set<ResourceType>(),
  isOffline: false,

  setResources: (resources) => set({ resources }),

  mergeResources: (incoming) =>
    set((state) => {
      const map = new Map(state.resources.map((r) => [r.id, r]));
      for (const r of incoming) {
        map.set(r.id, r);
      }
      return { resources: Array.from(map.values()) };
    }),

  addResource: (resource) =>
    set((state) => ({
      resources: state.resources.some((r) => r.id === resource.id)
        ? state.resources
        : [resource, ...state.resources],
    })),

  updateResource: (resource) =>
    set((state) => ({
      resources: state.resources.map((r) =>
        r.id === resource.id ? resource : r
      ),
    })),

  toggleFilter: (type) =>
    set((state) => {
      const next = new Set(state.activeFilters);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return { activeFilters: next };
    }),

  clearFilters: () => set({ activeFilters: new Set() }),

  setOffline: (offline) => set({ isOffline: offline }),

  filteredResources: () => {
    const { resources, activeFilters } = get();
    if (activeFilters.size === 0) return resources.filter((r) => r.status === 'active');
    return resources.filter(
      (r) => r.status === 'active' && activeFilters.has(r.type)
    );
  },
}));

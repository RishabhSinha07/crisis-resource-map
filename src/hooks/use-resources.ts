'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useResourceStore } from '@/stores/resource-store';
import { useMapStore, type MapBounds } from '@/stores/map-store';
import { cacheResources, mergeCacheResources, getCachedResources } from '@/lib/offline-cache';
import { syncPendingResources } from '@/lib/offline-queue';
import type { Resource } from '@/lib/types';

function bufferBounds(bounds: MapBounds, factor = 0.2): MapBounds {
  const latSpan = bounds.north - bounds.south;
  const lngSpan = bounds.east - bounds.west;
  return {
    north: bounds.north + latSpan * factor,
    south: bounds.south - latSpan * factor,
    east: bounds.east + lngSpan * factor,
    west: bounds.west - lngSpan * factor,
  };
}

export function useResources(initialResources?: Resource[]) {
  const { setResources, mergeResources, addResource, updateResource, setOffline } =
    useResourceStore();
  const initialized = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchViewport = useCallback(
    async (bounds: MapBounds) => {
      const b = bufferBounds(bounds);
      try {
        const res = await fetch(
          `/api/resources?north=${b.north}&south=${b.south}&east=${b.east}&west=${b.west}`
        );
        if (!res.ok) return;
        const data: Resource[] = await res.json();
        mergeResources(data);
        mergeCacheResources(data);
        setOffline(false);
      } catch {
        // Network failed — stay with what we have
      }
    },
    [mergeResources, setOffline]
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Initial load: use SSR data or fetch all
    async function loadResources() {
      if (initialResources && initialResources.length > 0) {
        setResources(initialResources);
        cacheResources(initialResources);
        return;
      }

      try {
        const res = await fetch('/api/resources');
        const data: Resource[] = await res.json();
        setResources(data);
        cacheResources(data);
        setOffline(false);
      } catch {
        const cached = await getCachedResources();
        setResources(cached);
        setOffline(true);
      }
    }

    loadResources();

    // Online/offline detection + sync queued resources
    const handleOnline = async () => {
      setOffline(false);
      const synced = await syncPendingResources();
      for (const resource of synced) {
        addResource(resource);
      }
      // Re-fetch current viewport after coming online
      const bounds = useMapStore.getState().bounds;
      if (bounds) fetchViewport(bounds);
    };
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (!navigator.onLine) setOffline(true);

    // Realtime subscription
    const channel = supabase
      .channel('resources-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'resources' },
        (payload) => {
          addResource(payload.new as Resource);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'resources' },
        (payload) => {
          updateResource(payload.new as Resource);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [initialResources, setResources, mergeResources, addResource, updateResource, setOffline, fetchViewport]);

  // Subscribe to bounds changes for viewport-based fetching
  useEffect(() => {
    const unsub = useMapStore.subscribe(
      (state) => state.bounds,
      (bounds) => {
        if (!bounds) return;
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          fetchViewport(bounds);
        }, 300);
      }
    );

    return () => {
      unsub();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [fetchViewport]);
}

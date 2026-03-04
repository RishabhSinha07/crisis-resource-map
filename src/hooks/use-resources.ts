'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useResourceStore } from '@/stores/resource-store';
import { cacheResources, getCachedResources } from '@/lib/offline-cache';
import { syncPendingResources } from '@/lib/offline-queue';
import type { Resource } from '@/lib/types';

export function useResources(initialResources?: Resource[]) {
  const { setResources, addResource, updateResource, setOffline } = useResourceStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Fetch resources: try network first, fall back to cache
    async function loadResources() {
      // Use SSR data if available
      if (initialResources && initialResources.length > 0) {
        setResources(initialResources);
        cacheResources(initialResources);
        return;
      }

      // Try fetching from API
      try {
        const res = await fetch('/api/resources');
        const data: Resource[] = await res.json();
        setResources(data);
        cacheResources(data);
        setOffline(false);
      } catch {
        // Network failed — load from IndexedDB cache
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
  }, [initialResources, setResources, addResource, updateResource, setOffline]);
}

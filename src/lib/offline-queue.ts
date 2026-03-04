import type { NewResource, Resource } from './types';

const DB_NAME = 'crisis-resource-map';
const QUEUE_STORE = 'pending-resources';
const DB_VERSION = 2;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('resources')) {
        db.createObjectStore('resources', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'localId', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueResource(resource: NewResource): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, 'readwrite');
  tx.objectStore(QUEUE_STORE).add({ ...resource, queuedAt: new Date().toISOString() });
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingResources(): Promise<(NewResource & { localId: number })[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(QUEUE_STORE, 'readonly');
    const request = tx.objectStore(QUEUE_STORE).getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

async function removePending(localId: number): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, 'readwrite');
  tx.objectStore(QUEUE_STORE).delete(localId);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function syncPendingResources(): Promise<Resource[]> {
  const pending = await getPendingResources();
  const synced: Resource[] = [];

  for (const item of pending) {
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: item.type,
          title: item.title,
          description: item.description,
          lat: item.lat,
          lng: item.lng,
          contact_info: item.contact_info,
        }),
      });
      if (res.ok) {
        const resource = await res.json();
        synced.push(resource);
        await removePending(item.localId);
      }
    } catch {
      // Still offline, stop trying
      break;
    }
  }

  return synced;
}

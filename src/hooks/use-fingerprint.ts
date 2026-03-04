'use client';

import { useEffect, useState } from 'react';

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        // Hash the visitor ID with SHA-256
        const encoder = new TextEncoder();
        const data = encoder.encode(result.visitorId);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        setFingerprint(hashHex);
      } catch {
        // Fallback: random ID stored in localStorage
        const stored = localStorage.getItem('crisis-map-fp');
        if (stored) {
          setFingerprint(stored);
        } else {
          const id = crypto.randomUUID();
          localStorage.setItem('crisis-map-fp', id);
          setFingerprint(id);
        }
      }
    }
    load();
  }, []);

  return fingerprint;
}

'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useFingerprint } from '@/hooks/use-fingerprint';
import { useResourceStore } from '@/stores/resource-store';
import type { Resource } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface VoteButtonsProps {
  resource: Resource;
}

export function VoteButtons({ resource }: VoteButtonsProps) {
  const t = useTranslations('resources');
  const fingerprint = useFingerprint();
  const updateResource = useResourceStore((s) => s.updateResource);
  const [voting, setVoting] = useState(false);

  async function handleVote(voteType: 'up' | 'down') {
    if (!fingerprint || voting) return;

    setVoting(true);

    const prev = { ...resource };
    const optimistic = { ...resource };
    if (voteType === 'up') {
      optimistic.upvotes += 1;
    } else {
      optimistic.downvotes += 1;
    }
    updateResource(optimistic);

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource_id: resource.id,
          vote_type: voteType,
          voter_fingerprint: fingerprint,
        }),
      });

      if (!res.ok) {
        updateResource(prev);
      }
    } catch {
      updateResource(prev);
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid var(--border-dim)', marginTop: '8px' }}>
      <button
        onClick={() => handleVote('up')}
        disabled={voting || !fingerprint}
        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 transition-all disabled:opacity-40"
        style={{
          fontFamily: 'var(--font-mono)',
          background: 'var(--accent-green-dim)',
          color: 'var(--accent-green)',
          borderRadius: '2px',
          border: '1px solid rgba(0, 210, 106, 0.15)',
        }}
        title={t('upvote')}
      >
        <ChevronUp size={12} strokeWidth={3} />
        <span>{resource.upvotes}</span>
      </button>
      <button
        onClick={() => handleVote('down')}
        disabled={voting || !fingerprint}
        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 transition-all disabled:opacity-40"
        style={{
          fontFamily: 'var(--font-mono)',
          background: 'var(--accent-red-dim)',
          color: 'var(--accent-red)',
          borderRadius: '2px',
          border: '1px solid rgba(255, 71, 87, 0.15)',
        }}
        title={t('downvote')}
      >
        <ChevronDown size={12} strokeWidth={3} />
        <span>{resource.downvotes}</span>
      </button>
    </div>
  );
}

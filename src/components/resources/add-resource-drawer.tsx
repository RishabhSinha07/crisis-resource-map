'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Plus, Crosshair } from 'lucide-react';
import { useMapStore } from '@/stores/map-store';
import { useResourceStore } from '@/stores/resource-store';
import { RESOURCE_TYPES } from '@/lib/constants';
import { queueResource } from '@/lib/offline-queue';
import type { ResourceType, Resource } from '@/lib/types';
import { useTranslations } from 'next-intl';

export function AddResourceDrawer() {
  const t = useTranslations('resources');
  const [step, setStep] = useState<'idle' | 'placing' | 'form'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const { pinnedLocation, setPlacingPin, setPinnedLocation } = useMapStore();
  const addResource = useResourceStore((s) => s.addResource);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ResourceType>('shelter');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  useEffect(() => {
    if (step === 'placing' && pinnedLocation) {
      setStep('form');
      setPlacingPin(false);
    } else if (step === 'form' && !pinnedLocation) {
      setStep('placing');
      setPlacingPin(true);
    }
  }, [pinnedLocation, step, setPlacingPin]);

  function reset() {
    setTitle('');
    setType('shelter');
    setDescription('');
    setContactInfo('');
    setPlacingPin(false);
    setPinnedLocation(null);
  }

  function handleStartPlacing() {
    setPinnedLocation(null);
    setPlacingPin(true);
    setStep('placing');
  }

  function handleClose() {
    setStep('idle');
    reset();
  }

  function handleReplacePin() {
    setPinnedLocation(null);
    setPlacingPin(true);
    setStep('placing');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pinnedLocation || !title.trim()) return;

    setSubmitting(true);
    const payload = {
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      lat: pinnedLocation[0],
      lng: pinnedLocation[1],
      contact_info: contactInfo.trim() || undefined,
    };

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resource = await res.json();
        addResource(resource);
        handleClose();
      }
    } catch {
      await queueResource(payload);
      const localResource: Resource = {
        id: `local-${Date.now()}`,
        ...payload,
        description: payload.description ?? null,
        contact_info: payload.contact_info ?? null,
        upvotes: 0,
        downvotes: 0,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      addResource(localResource);
      handleClose();
    } finally {
      setSubmitting(false);
    }
  }

  // Idle: show FAB
  if (step === 'idle') {
    return (
      <button
        onClick={handleStartPlacing}
        className="fixed bottom-6 right-6 z-[1000] flex items-center justify-center w-11 h-11 tac-btn tac-btn-primary animate-pulse-ring"
        style={{ padding: 0 }}
        title={t('addResource')}
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    );
  }

  // Placing mode
  if (step === 'placing') {
    return (
      <div
        className="fixed top-0 inset-x-0 z-[1000] flex items-center justify-center pointer-events-none"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div
          className="mt-3 pointer-events-auto flex items-center gap-3 px-5 py-3 animate-bounce-slow"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent-amber)',
            borderRadius: '2px',
            boxShadow: '0 0 20px rgba(240, 165, 0, 0.2)',
          }}
        >
          <Crosshair size={16} style={{ color: 'var(--accent-amber)' }} />
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}
          >
            {t('tapMap')}
          </span>
          <button
            onClick={handleClose}
            className="ml-2 p-1 transition-colors hover:bg-white/10"
            style={{ borderRadius: '2px' }}
          >
            <X size={14} style={{ color: 'var(--text-dim)' }} />
          </button>
        </div>
      </div>
    );
  }

  if (!pinnedLocation) {
    return null;
  }

  // Form drawer
  return (
    <>
      <div
        className="fixed inset-0 z-[1001]"
        style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(2px)' }}
        onClick={handleClose}
      />

      <div
        className="fixed bottom-0 inset-x-0 sm:inset-auto sm:right-4 sm:bottom-4 sm:w-[400px] z-[1002] max-h-[85vh] overflow-y-auto"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '2px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Header bar */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid var(--border-dim)' }}
        >
          <h2
            className="text-[11px] font-bold uppercase tracking-[0.15em]"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}
          >
            {t('addTitle')}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 transition-colors hover:bg-white/5"
            style={{ borderRadius: '2px' }}
          >
            <X size={14} style={{ color: 'var(--text-dim)' }} />
          </button>
        </div>

        <div className="p-5">
          {/* Pin status */}
          <button
            type="button"
            onClick={handleReplacePin}
            className="flex items-center gap-2 mb-5 px-3 py-2.5 w-full transition-colors hover:bg-white/5"
            style={{
              background: 'var(--accent-green-dim)',
              border: '1px solid rgba(0, 210, 106, 0.2)',
              borderRadius: '2px',
            }}
          >
            <MapPin size={14} style={{ color: 'var(--accent-green)' }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}
            >
              {pinnedLocation[0].toFixed(4)}, {pinnedLocation[1].toFixed(4)}
            </span>
            <span
              className="ml-auto text-[9px] uppercase tracking-wider"
              style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}
            >
              change
            </span>
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-[10px] font-semibold uppercase tracking-[0.1em] mb-1.5"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
              >
                {t('name')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('namePlaceholder')}
                required
                maxLength={200}
                className="tac-input w-full"
              />
            </div>

            <div>
              <label
                className="block text-[10px] font-semibold uppercase tracking-[0.1em] mb-1.5"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
              >
                {t('type')}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ResourceType)}
                className="tac-input w-full"
              >
                {RESOURCE_TYPES.map((rt) => (
                  <option key={rt.value} value={rt.value}>
                    {t(rt.value)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-[10px] font-semibold uppercase tracking-[0.1em] mb-1.5"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
              >
                {t('description')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={3}
                className="tac-input w-full resize-none"
              />
            </div>

            <div>
              <label
                className="block text-[10px] font-semibold uppercase tracking-[0.1em] mb-1.5"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
              >
                {t('contactInfo')}
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder={t('contactPlaceholder')}
                maxLength={500}
                className="tac-input w-full"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button type="button" onClick={handleClose} className="flex-1 tac-btn tac-btn-ghost">
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={!title.trim() || submitting}
                className="flex-1 tac-btn tac-btn-primary"
              >
                {submitting ? '...' : t('submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

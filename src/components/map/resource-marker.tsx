'use client';

import { Marker, Popup } from 'react-leaflet';
import type { Resource } from '@/lib/types';
import { getMarkerIcon } from '@/lib/marker-icons';
import { RESOURCE_TYPE_MAP } from '@/lib/constants';
import { VoteButtons } from '@/components/resources/vote-buttons';
import { useTranslations } from 'next-intl';

interface ResourceMarkerProps {
  resource: Resource;
}

export function ResourceMarker({ resource }: ResourceMarkerProps) {
  const t = useTranslations('resources');
  const config = RESOURCE_TYPE_MAP[resource.type];

  return (
    <Marker position={[resource.lat, resource.lng]} icon={getMarkerIcon(resource.type)}>
      <Popup maxWidth={280} minWidth={220}>
        <div className="py-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: config.color, boxShadow: `0 0 6px ${config.color}60` }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.12em]"
              style={{ color: config.color, fontFamily: 'var(--font-mono)' }}
            >
              {t(resource.type)}
            </span>
          </div>
          <h3
            className="font-semibold text-[13px] mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {resource.title}
          </h3>
          {resource.description && (
            <p className="text-[11px] mb-2" style={{ color: 'var(--text-secondary)' }}>
              {resource.description}
            </p>
          )}
          {resource.contact_info && (
            <p className="text-[10px] mb-2" style={{ color: 'var(--text-dim)' }}>
              <span
                className="font-semibold uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Contact:
              </span>{' '}
              {resource.contact_info}
            </p>
          )}
          <VoteButtons resource={resource} />
        </div>
      </Popup>
    </Marker>
  );
}

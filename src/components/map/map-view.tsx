'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap, Marker, Circle, CircleMarker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useResourceStore } from '@/stores/resource-store';
import { useMapStore } from '@/stores/map-store';
import { useThemeStore } from '@/stores/theme-store';
import { ResourceMarker } from './resource-marker';
import { getPinIcon } from '@/lib/marker-icons';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

const TILE_URLS = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
} as const;

const MAP_BG = {
  dark: '#2b2b2b',
  light: '#f2efe9',
} as const;

function MapEvents() {
  useMapEvents({
    click(e) {
      const { placingPin, setPinnedLocation } = useMapStore.getState();
      if (placingPin) {
        setPinnedLocation([e.latlng.lat, e.latlng.lng]);
      }
    },
    moveend(e) {
      const { setCenter, setZoom, setBounds } = useMapStore.getState();
      const map = e.target;
      const c = map.getCenter();
      setCenter([c.lat, c.lng]);
      setZoom(map.getZoom());
      const b = map.getBounds();
      setBounds({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    },
  });

  return null;
}

function FlyToHandler() {
  const map = useMap();
  const { center, zoom } = useMapStore();

  useEffect(() => {
    const currentCenter = map.getCenter();
    const dist = currentCenter.distanceTo(center);
    if (dist > 100) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);

  return null;
}

export default function MapView() {
  const filteredResources = useResourceStore((s) => s.filteredResources);
  const { center, zoom, pinnedLocation, placingPin, userLocation, userAccuracy } = useMapStore();
  const theme = useThemeStore((s) => s.theme);

  const resources = filteredResources();

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={3}
      maxBounds={[[-85, -180], [85, 180]]}
      maxBoundsViscosity={1.0}
      style={{ background: MAP_BG[theme] }}
      className={`w-full h-full ${placingPin ? 'cursor-crosshair' : ''}`}
      zoomControl={false}
    >
      <TileLayer
        key={theme}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url={TILE_URLS[theme]}
      />
      <MapEvents />
      <FlyToHandler />
      <MarkerClusterGroup key={`cluster-${theme}`} chunkedLoading maxClusterRadius={40} disableClusteringAtZoom={15}>
        {resources.map((resource) => (
          <ResourceMarker key={resource.id} resource={resource} />
        ))}
      </MarkerClusterGroup>
      {userLocation && (
        <>
          <Circle
            center={userLocation}
            radius={userAccuracy}
            pathOptions={{
              color: '#4f46e5',
              fillColor: '#818cf8',
              fillOpacity: 0.15,
              weight: 2,
              opacity: 0.4,
            }}
          />
          <CircleMarker
            center={userLocation}
            radius={8}
            pathOptions={{
              color: '#fff',
              fillColor: '#4f46e5',
              fillOpacity: 1,
              weight: 3,
            }}
          />
        </>
      )}
      {pinnedLocation && (
        <Marker position={pinnedLocation} icon={getPinIcon()} />
      )}
    </MapContainer>
  );
}

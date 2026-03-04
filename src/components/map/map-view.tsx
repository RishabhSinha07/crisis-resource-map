'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap, Marker, Circle, CircleMarker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useResourceStore } from '@/stores/resource-store';
import { useMapStore } from '@/stores/map-store';
import { ResourceMarker } from './resource-marker';
import { pinIcon } from '@/lib/marker-icons';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

function MapEvents() {
  useMapEvents({
    click(e) {
      const { placingPin, setPinnedLocation } = useMapStore.getState();
      if (placingPin) {
        setPinnedLocation([e.latlng.lat, e.latlng.lng]);
      }
    },
    moveend(e) {
      const { setCenter, setZoom } = useMapStore.getState();
      const map = e.target;
      const c = map.getCenter();
      setCenter([c.lat, c.lng]);
      setZoom(map.getZoom());
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

  const resources = filteredResources();

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`w-full h-full ${placingPin ? 'cursor-crosshair' : ''}`}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents />
      <FlyToHandler />
      <MarkerClusterGroup chunkedLoading maxClusterRadius={40} disableClusteringAtZoom={15}>
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
        <Marker position={pinnedLocation} icon={pinIcon} />
      )}
    </MapContainer>
  );
}

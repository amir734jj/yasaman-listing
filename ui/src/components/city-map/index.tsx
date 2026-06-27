import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './index.css';

interface CityMapProps {
  lat: number;
  lon: number;
  name: string;
}

// Use locally-bundled marker images instead of Leaflet's default CDN-relative URLs.
const icon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** Renders an OpenStreetMap view with a locally-bundled Leaflet library (no CDN JS/CSS/icons). */
export default function CityMap({ lat, lon, name }: CityMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lon],
      zoom: 12,
      scrollWheelZoom: false,
    });
    mapRef.current = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    L.marker([lat, lon], { icon, title: name }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lon, name]);

  return <div ref={containerRef} className="city-map" role="img" aria-label={name} />;
}

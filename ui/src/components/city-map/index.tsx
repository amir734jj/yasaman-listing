import { useTranslation } from 'react-i18next';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import './index.css';

interface CityMapProps {
  lat: number;
  lon: number;
  name: string;
}

/**
 * Shows an interactive OpenStreetMap tile view on desktop, and a lightweight local card (no remote
 * tiles) on mobile to save data on slow connections.
 */
export default function CityMap({ lat, lon, name }: CityMapProps) {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`;

  if (isDesktop) {
    const d = 0.05;
    const bbox = [lon - d, lat - d, lon + d, lat + d].map((n) => n.toFixed(5)).join('%2C');
    const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
    return (
      <iframe
        title={name}
        src={embed}
        className="city-map-osm"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <div className="city-map">
      <svg className="city-map-pin" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
      </svg>
      <div className="city-map-name">{name}</div>
      <div className="city-map-coords">
        {lat.toFixed(4)}, {lon.toFixed(4)}
      </div>
      <a className="city-map-link" href={osmUrl} target="_blank" rel="noreferrer noopener">
        {t('detail.openMap')}
      </a>
    </div>
  );
}

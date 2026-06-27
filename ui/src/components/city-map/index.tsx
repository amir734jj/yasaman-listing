import './index.css';

interface CityMapProps {
  lat: number;
  lon: number;
  name: string;
}

/** Embeds an OpenStreetMap view centered on the city, with a marker. No external JS library. */
export default function CityMap({ lat, lon, name }: CityMapProps) {
  const d = 0.08;
  const bbox = [lon - d, lat - d, lon + d, lat + d].map((n) => n.toFixed(5)).join('%2C');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <iframe
      title={name}
      src={src}
      className="city-map"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

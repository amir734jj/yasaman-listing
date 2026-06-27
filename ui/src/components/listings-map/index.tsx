import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type ListingDto } from '../../api/generated/Api';
import { useLanguageStore } from '../../store/languageStore';
import { formatPrice } from '../../utils/format';
import { findCity } from '../../data/iranCities';
import {
  iranOutline,
  projectToView,
  VIEW_WIDTH,
  VIEW_HEIGHT,
} from '../../data/iranOutline';
import './index.css';

interface CityGroup {
  key: string;
  name: string;
  x: number;
  y: number;
  listings: ListingDto[];
}

const outlinePath =
  iranOutline
    .map(([lon, lat], i) => {
      const { x, y } = projectToView(lon, lat);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ') + ' Z';

export default function ListingsMap({ listings }: { listings: ListingDto[] }) {
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const [selected, setSelected] = useState<string | null>(null);

  const { groups, hiddenCount } = useMemo(() => {
    const byCity = new Map<string, CityGroup>();
    let hidden = 0;
    for (const listing of listings) {
      const city = findCity(listing.location ?? '');
      if (!city) {
        hidden += 1;
        continue;
      }
      const key = `${city.lat},${city.lon}`;
      let group = byCity.get(key);
      if (!group) {
        const { x, y } = projectToView(city.lon, city.lat);
        const name = language === 'fa' ? city.fa : city.en;
        group = { key, name, x, y, listings: [] };
        byCity.set(key, group);
      }
      group.listings.push(listing);
    }
    return { groups: [...byCity.values()], hiddenCount: hidden };
  }, [listings, language]);

  const active = groups.find((g) => g.key === selected) ?? null;

  if (groups.length === 0) {
    return <p className="text-body-secondary">{t('listings.mapEmpty')}</p>;
  }

  return (
    <div>
      <div className="listings-map" dir="ltr">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="listings-map-svg"
          role="img"
          aria-label={t('listings.viewMap')}
        >
          <path d={outlinePath} className="listings-map-outline" />
          {groups.map((g) => (
            <g
              key={g.key}
              className={`listings-map-marker${active?.key === g.key ? ' is-active' : ''}`}
              transform={`translate(${g.x} ${g.y})`}
              onClick={() => setSelected(g.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelected(g.key);
                }
              }}
            >
              <circle r={18} />
              <text textAnchor="middle" dominantBaseline="central">
                {g.listings.length}
              </text>
            </g>
          ))}
        </svg>

        {active && (
          <div className="listings-map-panel" dir={language === 'fa' ? 'rtl' : 'ltr'}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>{active.name}</strong>
              <button
                type="button"
                className="btn-close"
                aria-label={t('detail.close')}
                onClick={() => setSelected(null)}
              />
            </div>
            <ul className="list-unstyled mb-0">
              {active.listings.map((l) => (
                <li key={l.id} className="mb-1">
                  <Link to={`/listings/${l.id}`} className="text-decoration-none">
                    {l.name}
                    <span className="text-body-secondary ms-2">
                      {formatPrice(l.price ?? '', language)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {hiddenCount > 0 && (
        <p className="text-body-secondary small mt-2 mb-0">
          {t('listings.mapHidden', { count: hiddenCount })}
        </p>
      )}
    </div>
  );
}

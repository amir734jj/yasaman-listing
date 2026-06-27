import { useEffect, useRef, useState } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { iranCities, normalizeCity, type IranCity } from '../../data/iranCities';
import './index.css';

interface CitySelectProps {
  value: string;
  onChange: (city: string) => void;
}

export default function CitySelect({ value, onChange }: CitySelectProps) {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';
  const label = (c: IranCity) => (isFa ? c.fa : c.en);

  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<number>();

  useEffect(() => setQuery(value), [value]);

  const q = normalizeCity(query);
  const matches = iranCities
    .filter((c) => !q || normalizeCity(c.en).includes(q) || normalizeCity(c.fa).includes(q))
    .slice(0, 25);

  const select = (c: IranCity) => {
    const name = label(c);
    setQuery(name);
    onChange(name);
    setOpen(false);
  };

  return (
    <div className="city-select position-relative">
      <Form.Control
        value={query}
        autoComplete="off"
        placeholder={t('create.locationPlaceholder')}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setOpen(false), 150);
        }}
        required
      />
      {open && matches.length > 0 && (
        <ListGroup className="city-select-menu shadow">
          {matches.map((c) => (
            <ListGroup.Item
              action
              type="button"
              key={c.en}
              onMouseDown={() => {
                window.clearTimeout(blurTimer.current);
                select(c);
              }}
            >
              {label(c)}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}

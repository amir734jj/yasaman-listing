import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Row, Col, Form, InputGroup, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { api } from '../../api/client';
import { type ListingDto, ListingSortBy } from '../../api/generated/Api';
import ListingCard from '../../components/listing-card';
import { useSeo } from '../../hooks/useSeo';
import { websiteJsonLd, listingsItemListJsonLd } from '../../hooks/structuredData';

export default function ListingsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const owner = searchParams.get('owner');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<ListingSortBy>(ListingSortBy.MostRecent);
  const [items, setItems] = useState<ListingDto[]>([]);
  const [loading, setLoading] = useState(true);

  const ownerName = owner ? items[0]?.ownerName : null;

  useSeo({
    title: t('listings.title'),
    description: t('seo.tagline'),
    jsonLd: items.length ? [websiteJsonLd(), listingsItemListJsonLd(items)] : websiteJsonLd(),
  });

  useEffect(() => {
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.listing.listingsList({
          search: search || undefined,
          ownerId: owner ?? undefined,
          sortBy,
          page: 1,
          pageSize: 50,
        });
        setItems(res.data.items ?? []);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [search, sortBy, owner]);

  return (
    <div>
      <h1 className="h3 mb-3">
        {owner ? t('listings.byOwner', { name: ownerName ?? '' }) : t('listings.title')}
      </h1>

      {owner && (
        <Link to="/" className="link-secondary d-inline-block mb-3">
          {t('listings.allListings')}
        </Link>
      )}

      <Row className="g-2 mb-4">
        <Col xs={12} md>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </InputGroup.Text>
            <Form.Control
              placeholder={t('listings.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col xs={12} md="auto">
          <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value as ListingSortBy)}>
            <option value={ListingSortBy.MostRecent}>{t('listings.mostRecent')}</option>
            <option value={ListingSortBy.PriceAsc}>{t('listings.priceLowHigh')}</option>
            <option value={ListingSortBy.PriceDesc}>{t('listings.priceHighLow')}</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center text-body-secondary py-5">
          <Spinner animation="border" size="sm" className="me-2" />
          {t('common.loading')}
        </div>
      ) : items.length === 0 ? (
        <p className="text-body-secondary">{t('listings.empty')}</p>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
          {items.map((listing) => (
            <Col key={listing.id}>
              <ListingCard listing={listing} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

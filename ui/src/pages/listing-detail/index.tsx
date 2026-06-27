import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import { api } from '../../api/client';
import { type ListingDto, ListingStatus } from '../../api/generated/Api';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { useSeo } from '../../hooks/useSeo';
import { listingJsonLd, breadcrumbJsonLd } from '../../hooks/structuredData';
import { formatPrice } from '../../utils/format';
import { findCity } from '../../data/iranCities';
import MediaView from '../../components/media-view';
import CityMap from '../../components/city-map';
import './index.css';

const statusVariant: Record<ListingStatus, string> = {
  [ListingStatus.Available]: 'success',
  [ListingStatus.Sold]: 'danger',
  [ListingStatus.Unavailable]: 'secondary',
};

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const userId = useAuthStore((s) => s.userId);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const token = useAuthStore((s) => s.token);

  const [listing, setListing] = useState<ListingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxFileId, setLightboxFileId] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.listing.listingsDetail(id);
      setListing(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useSeo({
    title: listing?.name ?? t('listings.title'),
    description: listing?.description?.slice(0, 160) || t('seo.tagline'),
    image: listing?.media?.[0] ? `/api/files/${listing.media[0]}` : undefined,
    type: 'article',
    jsonLd: listing
      ? [
          listingJsonLd(listing),
          breadcrumbJsonLd([
            { name: t('appName'), path: '/' },
            { name: listing.name ?? '', path: `/listings/${listing.id}` },
          ]),
        ]
      : undefined,
  });

  if (loading) {
    return (
      <div className="text-center text-body-secondary py-5">
        <Spinner animation="border" size="sm" className="me-2" />
        {t('common.loading')}
      </div>
    );
  }
  if (!listing) return <p className="text-body-secondary">{t('common.error')}</p>;

  const status = listing.status ?? ListingStatus.Available;
  const canManage = !!token && (isAdmin || listing.ownerId === userId);
  const locationCity = findCity(listing.location ?? '');

  const markSold = async () => {
    await api.listing.listingsSoldCreate(listing.id!);
    load();
  };
  const markAvailable = async () => {
    await api.listing.listingsAvailableCreate(listing.id!);
    load();
  };
  const delist = async () => {
    await api.listing.listingsUnavailableCreate(listing.id!);
    load();
  };
  const remove = async () => {
    if (!window.confirm(t('detail.confirmDelete'))) return;
    await api.listing.listingsDelete(listing.id!);
    navigate('/');
  };

  return (
    <div>
      <Link to="/" className="link-secondary text-decoration-none">
        <FontAwesomeIcon icon={language === 'fa' ? faArrowRight : faArrowLeft} style={{ marginInlineEnd: '0.4rem' }} />
        {t('detail.back')}
      </Link>

      <div className="d-flex align-items-center gap-2 mt-2">
        <h1 className="h3 mb-0">{listing.name}</h1>
        <Badge bg={statusVariant[status]}>{t(`status.${status}`)}</Badge>
      </div>

      <div className="d-flex flex-wrap gap-3 align-items-center mt-2">
        <span className="fs-4 fw-bold text-primary">{formatPrice(listing.price, language)}</span>
        <span className="text-body-secondary">
          {t('listings.location')}: {listing.location}
        </span>
        <span className="text-body-secondary">
          {t('listings.by')}{' '}
          {listing.ownerId ? (
            <Link to={`/?owner=${listing.ownerId}`} className="link-primary fw-medium">
              {listing.ownerName}
            </Link>
          ) : (
            listing.ownerName
          )}
        </span>
      </div>

      {status === ListingStatus.Sold && (
        <p className="text-body-secondary mt-2">{t('detail.soldNotice')}</p>
      )}

      {listing.tags && listing.tags.length > 0 && (
        <div className="d-flex flex-wrap gap-1 mt-2">
          {listing.tags.map((tag) => (
            <Badge key={tag} bg="secondary" className="fw-normal">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {listing.media && listing.media.length > 0 && (
        <Row className="g-2 my-3">
          {listing.media.map((fileId) => (
            <Col xs={12} sm={6} md={4} key={fileId}>
              <MediaView
                fileId={fileId}
                className="gallery-img gallery-img-clickable"
                alt={listing.name ?? ''}
                controls
                onClick={() => setLightboxFileId(fileId)}
              />
            </Col>
          ))}
        </Row>
      )}

      <h3 className="h5 mt-4">{t('detail.description')}</h3>
      <p style={{ whiteSpace: 'pre-wrap' }}>{listing.description}</p>

      {locationCity && (
        <div className="my-3">
          <h3 className="h5">{t('listings.location')}</h3>
          <CityMap lat={locationCity.lat} lon={locationCity.lon} name={listing.location ?? ''} />
        </div>
      )}

      {canManage && (
        <div className="d-flex flex-wrap gap-2 mt-4">
          <Link className="btn btn-outline-secondary" to={`/listings/${listing.id}/edit`}>
            {t('detail.edit')}
          </Link>
          {status === ListingStatus.Available ? (
            <Button variant="primary" onClick={markSold}>
              {t('detail.markSold')}
            </Button>
          ) : (
            <Button variant="outline-primary" onClick={markAvailable}>
              {t('detail.markAvailable')}
            </Button>
          )}
          {status !== ListingStatus.Unavailable && (
            <Button variant="outline-warning" onClick={delist}>
              {t('detail.delist')}
            </Button>
          )}
          <Button variant="danger" onClick={remove}>
            {t('detail.delete')}
          </Button>
        </div>
      )}

      <Modal
        show={!!lightboxFileId}
        onHide={() => setLightboxFileId(null)}
        size="xl"
        centered
        contentClassName="lightbox-content"
      >
        <Button
          variant="light"
          className="lightbox-close"
          aria-label={t('detail.close')}
          onClick={() => setLightboxFileId(null)}
        >
          <FontAwesomeIcon icon={faXmark} />
        </Button>
        {lightboxFileId && (
          <MediaView
            fileId={lightboxFileId}
            alt={listing.name ?? ''}
            className="lightbox-img"
            controls
          />
        )}
      </Modal>
    </div>
  );
}

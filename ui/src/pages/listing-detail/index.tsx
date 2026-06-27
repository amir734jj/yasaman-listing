import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import { api } from '../../api/client';
import { type ListingDto, ListingStatus, MediaType } from '../../api/generated/Api';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { useSeo } from '../../hooks/useSeo';
import { listingJsonLd, breadcrumbJsonLd } from '../../hooks/structuredData';
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
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

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
    image: listing?.media?.find((m) => m.type === MediaType.Image)?.url ?? undefined,
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
        <FontAwesomeIcon icon={language === 'fa' ? faArrowRight : faArrowLeft} className="me-1" />
        {t('detail.back')}
      </Link>

      <div className="d-flex align-items-center gap-2 mt-2">
        <h1 className="h3 mb-0">{listing.name}</h1>
        <Badge bg={statusVariant[status]}>{t(`status.${status}`)}</Badge>
      </div>

      <div className="d-flex flex-wrap gap-3 align-items-center mt-2">
        <span className="fs-4 fw-bold text-primary">${listing.price?.toLocaleString()}</span>
        <span className="text-body-secondary">
          {t('listings.location')}: {listing.location}
        </span>
        <span className="text-body-secondary">
          {t('listings.by')} {listing.ownerName}
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
          {listing.media.map((m) => (
            <Col xs={12} sm={6} md={4} key={m.id}>
              {m.type === MediaType.Video ? (
                <video src={m.url ?? undefined} controls className="gallery-img" preload="none" />
              ) : (
                <img
                  src={m.url ?? undefined}
                  alt={listing.name ?? ''}
                  className="gallery-img gallery-img-clickable"
                  loading="lazy"
                  decoding="async"
                  onClick={() => m.url && setLightboxUrl(m.url)}
                />
              )}
            </Col>
          ))}
        </Row>
      )}

      <h3 className="h5 mt-4">{t('detail.description')}</h3>
      <p style={{ whiteSpace: 'pre-wrap' }}>{listing.description}</p>

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
        show={!!lightboxUrl}
        onHide={() => setLightboxUrl(null)}
        size="xl"
        centered
        contentClassName="lightbox-content"
      >
        <Button
          variant="light"
          className="lightbox-close"
          aria-label={t('detail.close')}
          onClick={() => setLightboxUrl(null)}
        >
          <FontAwesomeIcon icon={faXmark} />
        </Button>
        {lightboxUrl && (
          <img src={lightboxUrl} alt={listing.name ?? ''} className="lightbox-img" />
        )}
      </Modal>
    </div>
  );
}

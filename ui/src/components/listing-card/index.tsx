import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { type ListingDto, ListingStatus } from '../../api/generated/Api';
import { useLanguageStore } from '../../store/languageStore';
import { formatPrice } from '../../utils/format';
import MediaView from '../media-view';
import './index.css';

const statusVariant: Record<ListingStatus, string> = {
  [ListingStatus.Available]: 'success',
  [ListingStatus.Sold]: 'danger',
  [ListingStatus.Unavailable]: 'secondary',
};

export default function ListingCard({ listing }: { listing: ListingDto }) {
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const cover = listing.media?.[0];
  const status = listing.status ?? ListingStatus.Available;

  return (
    <Card as={Link} to={`/listings/${listing.id}`} className="h-100 text-decoration-none shadow-sm">
      {cover ? (
        <MediaView fileId={cover} className="listing-card-img card-img-top" alt={listing.name ?? ''} muted />
      ) : (
        <div className="listing-card-img card-img-top" />
      )}
      <Card.Body>
        <Card.Title className="h6 mb-1">{listing.name}</Card.Title>
        <div className="fw-bold text-primary">{formatPrice(listing.price, language)}</div>
        <div className="text-body-secondary small">{listing.location}</div>
        <Badge bg={statusVariant[status]} className="mt-2">
          {t(`status.${status}`)}
        </Badge>
      </Card.Body>
    </Card>
  );
}

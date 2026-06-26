import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { type ListingDto, ListingStatus, MediaType } from '../../api/generated/Api';
import './index.css';

const statusVariant: Record<ListingStatus, string> = {
  [ListingStatus.Available]: 'success',
  [ListingStatus.Sold]: 'danger',
  [ListingStatus.Unavailable]: 'secondary',
};

export default function ListingCard({ listing }: { listing: ListingDto }) {
  const { t } = useTranslation();
  const cover = listing.media?.find((m) => m.type === MediaType.Image) ?? listing.media?.[0];
  const status = listing.status ?? ListingStatus.Available;

  return (
    <Card as={Link} to={`/listings/${listing.id}`} className="h-100 text-decoration-none shadow-sm">
      {cover ? (
        cover.type === MediaType.Video ? (
          <video
            className="listing-card-img card-img-top"
            src={cover.url ?? undefined}
            muted
            preload="none"
          />
        ) : (
          <img
            className="listing-card-img card-img-top"
            src={cover.url ?? undefined}
            alt={listing.name ?? ''}
            loading="lazy"
            decoding="async"
          />
        )
      ) : (
        <div className="listing-card-img card-img-top" />
      )}
      <Card.Body>
        <Card.Title className="h6 mb-1">{listing.name}</Card.Title>
        <div className="fw-bold text-primary">${listing.price?.toLocaleString()}</div>
        <div className="text-body-secondary small">{listing.location}</div>
        <Badge bg={statusVariant[status]} className="mt-2">
          {t(`status.${status}`)}
        </Badge>
      </Card.Body>
    </Card>
  );
}

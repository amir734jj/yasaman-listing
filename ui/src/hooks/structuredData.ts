import type { ListingDto } from '../api/generated/Api';
import { ListingStatus } from '../api/generated/Api';
import { SITE_NAME } from './useSeo';

const origin = () => (typeof window !== 'undefined' ? window.location.origin : '');

const absolute = (url: string) => {
  const base = origin();
  return base ? new URL(url, base).href : url;
};

const availabilityFor = (status?: ListingStatus) => {
  switch (status) {
    case ListingStatus.Sold:
      return 'https://schema.org/SoldOut';
    case ListingStatus.Unavailable:
      return 'https://schema.org/OutOfStock';
    default:
      return 'https://schema.org/InStock';
  }
};

/** WebSite schema for the home page. */
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${origin()}/`,
  };
}

/** ItemList of the currently shown listings, generated from live data. */
export function listingsItemListJsonLd(listings: ListingDto[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: listings.map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${origin()}/listings/${listing.id}`,
      name: listing.name ?? '',
    })),
  };
}

/** Product schema generated from a single listing. */
export function listingJsonLd(listing: ListingDto) {
  const images = (listing.media ?? []).map((id) => absolute(`/api/files/${id}`));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.name ?? '',
    description: listing.description ?? '',
    ...(images.length ? { image: images } : {}),
    ...(listing.tags?.length ? { keywords: listing.tags.join(', ') } : {}),
    offers: {
      '@type': 'Offer',
      price: listing.price ?? '',
      priceCurrency: 'USD',
      availability: availabilityFor(listing.status),
      ...(listing.id ? { url: `${origin()}/listings/${listing.id}` } : {}),
    },
    ...(listing.ownerName ? { seller: { '@type': 'Person', name: listing.ownerName } } : {}),
  };
}

/** BreadcrumbList from an ordered list of crumbs. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${origin()}${item.path}`,
    })),
  };
}

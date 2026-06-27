import { useEffect } from 'react';

export const SITE_NAME = 'Yasaman Listing';

export interface SeoOptions {
  /** Page-specific title; the site name is appended automatically. */
  title: string;
  description?: string;
  /** Image URL for social cards. Relative URLs are resolved against the current origin. */
  image?: string;
  /** Keep the page out of search indexes (e.g. auth/admin screens). */
  noindex?: boolean;
  type?: 'website' | 'article';
  /** One or more schema.org JSON-LD objects, generated from page data. */
  jsonLd?: object | object[];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function absoluteUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Lightweight, dependency-free document-head manager. Sets the title, description,
 * canonical URL, Open Graph / Twitter tags and JSON-LD structured data for the current route.
 */
export function useSeo({ title, description, image, noindex, type = 'website', jsonLd }: SeoOptions) {
  const serializedJsonLd = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} · ${SITE_NAME}`;
    document.title = fullTitle;

    const canonical = `${window.location.origin}${window.location.pathname}`;
    upsertLink('canonical', canonical);

    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    if (description) {
      upsertMeta('name', 'description', description);
    }

    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');

    if (description) {
      upsertMeta('property', 'og:description', description);
      upsertMeta('name', 'twitter:description', description);
    }

    if (image) {
      const abs = absoluteUrl(image);
      upsertMeta('property', 'og:image', abs);
      upsertMeta('name', 'twitter:image', abs);
    }

    // Structured data (JSON-LD), regenerated per route from page data.
    const scriptId = 'seo-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (serializedJsonLd) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = scriptId;
        document.head.appendChild(script);
      }
      script.textContent = serializedJsonLd;
    } else if (script) {
      script.remove();
    }
  }, [title, description, image, noindex, type, serializedJsonLd]);
}

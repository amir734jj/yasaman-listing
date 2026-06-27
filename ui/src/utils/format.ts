import type { Language } from '../store/languageStore';

/**
 * Formats a price for display in the active language. Purely numeric prices get thousands
 * separators and a currency (dollars for English, rial for Farsi); anything else (free-form
 * text) is shown as entered.
 */
export function formatPrice(price: string | null | undefined, language: Language): string {
  const value = (price ?? '').trim();
  if (!value) return '';

  const numericLike = /^[\d.,\u066b\u066c\s]+$/.test(value);
  const num = Number(value.replace(/[,\u066b\u066c\s]/g, ''));

  if (numericLike && !Number.isNaN(num)) {
    return language === 'fa'
      ? `${num.toLocaleString('fa-IR')} ریال`
      : `$${num.toLocaleString('en-US')}`;
  }

  return value;
}

/**
 * Formats a date in the active language. Farsi uses the Persian (Shamsi/Jalali) calendar
 * with Persian digits; English uses the Gregorian calendar.
 */
export function formatDate(date: string | null | undefined, language: Language): string {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat(language === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsed);
}

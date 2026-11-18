/**
 * Canonical website links used by the app.
 *
 * The marketing site is locale-prefixed (`/en/pricing`), so a bare
 * `https://blinkeye.app/pricing` returns "page not found". Every paywall CTA
 * must build its URL here instead of hard-coding it, so the locale can never
 * drift out of sync again.
 */

/** Marketing site origin (no trailing slash). */
export const WEBSITE_URL = "https://blinkeye.app";

/** Locale segment the site serves; English is the app's fallback language. */
export const WEBSITE_LOCALE = "en";

/** Pricing page, e.g. `https://blinkeye.app/en/pricing`. */
export const PRICING_URL = `${WEBSITE_URL}/${WEBSITE_LOCALE}/pricing`;

/** Attribution for an in-app paywall placement. */
export type PricingAttribution = {
  /** `utm_source` — which screen shows the CTA. */
  source: string;
  /** `utm_medium`; defaults to `cta`. */
  medium?: string;
  /** `utm_campaign`; defaults to `break_reminder`. */
  campaign?: string;
};

/**
 * Pricing page URL, optionally tagged with campaign attribution.
 *
 * @example pricingUrl({ source: "app_todo_page" })
 *   → "https://blinkeye.app/en/pricing?utm_source=app_todo_page&utm_medium=cta&utm_campaign=break_reminder"
 */
export function pricingUrl(attribution?: PricingAttribution): string {
  if (!attribution) return PRICING_URL;

  const params = new URLSearchParams({
    utm_source: attribution.source,
    utm_medium: attribution.medium ?? "cta",
    utm_campaign: attribution.campaign ?? "break_reminder",
  });
  return `${PRICING_URL}?${params.toString()}`;
}

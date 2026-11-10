// Current Steam deals from the public store endpoint (no key, no login).
// Prices come in euro cents because of cc=es.
export const STEAM_SPECIALS_URL = 'https://store.steampowered.com/api/featuredcategories?cc=es&l=spanish';

// Enough to fill the price list without turning it into a store.
const MAX_OFFERS = 6;

const isPrice = (v) => Number.isFinite(v) && v >= 0;

// Items that would not pass steamOffersSchema are left out one by one,
// so a single bad item does not throw away the whole batch.
const isValidItem = (item) =>
  Number.isInteger(item?.id) &&
  item.id > 0 &&
  typeof item.name === 'string' &&
  item.name.length > 0 &&
  typeof item.header_image === 'string' &&
  item.header_image.length > 0 &&
  Number.isInteger(item.discount_percent) &&
  item.discount_percent > 0 &&
  item.discount_percent <= 100 &&
  isPrice(item.original_price) &&
  isPrice(item.final_price);

// Valid discounted items only, unique by id, in Steam's order, at most MAX_OFFERS.
export function toSteamOffers(raw) {
  const items = raw?.specials?.items ?? [];
  const seen = new Set();
  const offers = [];
  for (const item of items) {
    if (!isValidItem(item) || seen.has(item.id)) continue;
    seen.add(item.id);
    offers.push({
      id: item.id,
      name: item.name,
      discountPercent: item.discount_percent,
      originalPrice: item.original_price / 100,
      finalPrice: item.final_price / 100,
      image: item.header_image,
      url: `https://store.steampowered.com/app/${item.id}/`,
      endsAt: item.discount_expiration ? new Date(item.discount_expiration * 1000).toISOString() : null,
    });
    if (offers.length === MAX_OFFERS) break;
  }
  return offers;
}

// Offers still running at `now`. Offers without an end date never expire.
export function activeOffers(offers, now = new Date()) {
  return offers.filter((o) => !o.endsAt || Date.parse(o.endsAt) > now.getTime());
}

const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
export const formatEuros = (value) => euros.format(value);

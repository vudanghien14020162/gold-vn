const SHOPEE_LINKS = [
  "https://s.shopee.vn/4qDTbqjnkY",
  "https://s.lazada.vn/s.nfRfX?c=r&t=p-i3TByO5-sGWBFMZ",
  "https://s.shopee.vn/4qDTbqjnkY",
];
export function handleAffiliateRedirect(rate = 0.4) {
  const random = Math.random();

  if (random > rate) {
    return false;
  }

  const link =
    SHOPEE_LINKS[Math.floor(Math.random() * SHOPEE_LINKS.length)];

  window.open(link, "_blank", "noopener,noreferrer");

  return true;
}
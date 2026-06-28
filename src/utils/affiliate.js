const SHOPEE_LINKS = [
  "https://s.shopee.vn/4qDTbqjnkY",
  // "https://s.lazada.vn/s.n1ShE?c=s&t=p-iEX1WQo-s236Nbes",
  "https://s.shopee.vn/4qDTbqjnkY",
];
export function handleAffiliateRedirect(rate = 0.2) {
  const random = Math.random();

  if (random > rate) {
    return false;
  }

  const link =
    SHOPEE_LINKS[Math.floor(Math.random() * SHOPEE_LINKS.length)];

  window.open(link, "_blank", "noopener,noreferrer");

  return true;
}
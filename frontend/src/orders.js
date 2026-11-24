export const services = {
  WASH_ONLY: 'Wash only',
  IRON_ONLY: 'Iron only',
  WASH_AND_IRON: 'Wash and iron',
};

export const statuses = {
  RECEIVED: 'Received',
  WASHING: 'Washing',
  READY: 'Ready',
  COLLECTED: 'Collected',
};

export const currency = import.meta.env.VITE_SHOP_CURRENCY || 'XAF';

export function formatPrice(value) {
  const [whole, decimals] = value.split('.');
  const grouped = new Intl.NumberFormat().format(BigInt(whole));
  const separator = new Intl.NumberFormat().formatToParts(0.1).find((part) => part.type === 'decimal').value;
  return `${grouped}${separator}${decimals} ${currency}`;
}

export function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

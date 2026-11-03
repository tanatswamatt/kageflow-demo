/** "R 679 900" — South African style, space as the thousands separator. */
export function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return 'POA';
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return 'POA';
  return 'R ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function formatKm(km: number | null | undefined) {
  if (km === null || km === undefined) return '—';
  return km.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' km';
}

/** Standard amortised instalment, with an optional balloon (residual) at the end. */
export function monthlyInstalment(price: number, depositPct: number, ratePct: number, months: number, balloonPct = 0) {
  const principal = price * (1 - depositPct / 100);
  const balloon = price * (balloonPct / 100);
  const r = ratePct / 100 / 12;
  if (months <= 0) return 0;
  if (r === 0) return (principal - balloon) / months;
  const pow = Math.pow(1 + r, months);
  return ((principal - balloon / pow) * r * pow) / (pow - 1);
}

export const PRICE_BANDS = [
  { value: '200000', label: 'Under R 200 000' },
  { value: '350000', label: 'Under R 350 000' },
  { value: '500000', label: 'Under R 500 000' },
  { value: '750000', label: 'Under R 750 000' },
];

// BC property transfer tax (PTT): 1% to $200k, 2% $200k-$2M, 3% above $2M,
// plus an extra 2% on the portion above $3M for residential property.
export function propertyTransferTax(price) {
  const band = (from, to, rate) => Math.max(0, Math.min(price, to) - from) * rate;
  return (
    band(0, 200000, 0.01) +
    band(200000, 2000000, 0.02) +
    band(2000000, Infinity, 0.03) +
    band(3000000, Infinity, 0.02)
  );
}

// BC first-time home buyers' exemption (registrations from April 1, 2024):
// full tax waived up to $500k; a flat $8,000 off from $500k to $835k;
// phased out ($320 less per $1,000) from $835k to $860k; none at $860k or more.
export function firstTimeBuyerExemption(price) {
  const tax = propertyTransferTax(price);
  if (price >= 860000) return 0;
  const full = Math.min(tax, 8000);
  return price <= 835000 ? full : full * ((860000 - price) / 25000);
}

// Estimate only: legal, inspection, appraisal and adjustments are typical ranges.
export function estimateClosingCosts({ price, legal = 1800, inspection = 500, appraisal = 400, firstTimeBuyer = false }) {
  const exemption = firstTimeBuyer ? firstTimeBuyerExemption(price) : 0;
  const items = [
    { label: 'Property transfer tax', amount: propertyTransferTax(price) },
    ...(firstTimeBuyer ? [{ label: 'First-time buyer exemption', amount: -exemption }] : []),
    { label: 'Legal fees & disbursements', amount: legal },
    { label: 'Home inspection', amount: inspection },
    { label: 'Appraisal', amount: appraisal },
  ];
  const closingTotal = items.reduce((s, i) => s + i.amount, 0);
  const note = firstTimeBuyer && exemption === 0 ? 'No exemption applies at $860,000 or more.' : null;
  return { items, closingTotal, total: price + closingTotal, note };
}

export const money = (n) =>
  (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-CA');

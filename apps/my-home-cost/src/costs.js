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

// Estimate only: legal, inspection, appraisal and adjustments are typical ranges.
export function estimateClosingCosts({ price, legal = 1800, inspection = 500, appraisal = 400, firstTimeBuyer = false }) {
  const ptt = firstTimeBuyer && price <= 835000 ? 0 : propertyTransferTax(price);
  const items = [
    { label: 'Property transfer tax', amount: ptt },
    { label: 'Legal fees & disbursements', amount: legal },
    { label: 'Home inspection', amount: inspection },
    { label: 'Appraisal', amount: appraisal },
  ];
  const closingTotal = items.reduce((s, i) => s + i.amount, 0);
  return { items, closingTotal, total: price + closingTotal };
}

export const money = (n) =>
  '$' + Math.round(n).toLocaleString('en-CA');

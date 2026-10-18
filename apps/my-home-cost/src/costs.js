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

// BC newly built home exemption (not limited to first-time buyers): the whole tax is
// waived up to $1,100,000, then phased out in proportion to $1,150,000. Cannot be
// combined with the first-time buyer exemption.
export function newBuildExemption(price) {
  const tax = propertyTransferTax(price);
  if (price >= 1150000) return 0;
  return price <= 1100000 ? tax : tax * ((1150000 - price) / 50000);
}

// Estimate only: legal, inspection, appraisal, first-year home insurance and adjustments are typical ranges.
export function estimateClosingCosts({ price, legal = 1800, inspection = 500, appraisal = 400, insurance = 1500, firstTimeBuyer = false, newBuild = false, gst = false }) {
  const claimed = firstTimeBuyer || newBuild;
  const exemption = firstTimeBuyer ? firstTimeBuyerExemption(price) : newBuild ? newBuildExemption(price) : 0;
  const items = [
    { label: 'Property transfer tax', amount: propertyTransferTax(price) },
    ...(claimed ? [{ label: firstTimeBuyer ? 'First-time buyer exemption' : 'Newly built home exemption', amount: -exemption }] : []),
    { label: 'Legal fees & disbursements', amount: legal },
    // Presales and new builds under construction (GST applies) need no home inspection.
    ...(gst || newBuild ? [] : [{ label: 'Home inspection', amount: inspection }]),
    { label: 'Appraisal', amount: appraisal },
    { label: 'Home insurance (first year)', amount: insurance },
  ];
  const closingTotal = items.reduce((s, i) => s + i.amount, 0);
  const note = claimed && exemption === 0
    ? `No exemption applies at ${firstTimeBuyer ? '$860,000' : '$1,150,000'} or more.`
    : null;
  // 5% GST on a newly built home, before any new housing rebate (not part of closing costs).
  const gstAmount = gst ? price * 0.05 : 0;
  return { items, closingTotal, gst: gstAmount, total: price + closingTotal + gstAmount, note };
}

export const money = (n) =>
  (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-CA');

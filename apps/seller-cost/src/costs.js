// Typical BC commission: 7% of the first $100,000 plus 3% of the balance (negotiable).
// Rates are parameters so the user can override them to match their listing agreement.
export function commission(price, { firstRate = 0.07, restRate = 0.03 } = {}) {
  const total = Math.min(price, 100000) * firstRate + Math.max(0, price - 100000) * restRate;
  return Math.round(total * 100) / 100; // whole cents, avoids float noise
}

export const GST = 0.05;

// Estimate only: legal, prep and mortgage figures are user-adjustable inputs.
export function estimateSellerCosts({
  price,
  mortgage = 0,
  penalty = 0,
  legal = 1500,
  prep = 1500,
  firstRate = 0.07,
  restRate = 0.03,
}) {
  const comm = commission(price, { firstRate, restRate });
  const items = [
    { label: 'Realtor commission', amount: comm },
    { label: 'GST on commission (5%)', amount: comm * GST },
    { label: 'Legal fees', amount: legal },
    { label: 'GST on legal fees (5%)', amount: legal * GST },
    { label: 'Staging, photos & cleaning', amount: prep },
    ...(penalty > 0 ? [{ label: 'Mortgage prepayment penalty', amount: penalty }] : []),
  ];
  const sellingCosts = items.reduce((s, i) => s + i.amount, 0);
  const netProceeds = price - sellingCosts - mortgage;
  const note = price > 0 && netProceeds < 0 ? 'Costs and mortgage exceed the sale price: you would owe money at closing.' : null;
  return { items, sellingCosts, mortgage, netProceeds, note };
}

export const money = (n) =>
  (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-CA');

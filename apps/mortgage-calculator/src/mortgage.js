// Mortgage math for BC buyers. Interest compounds once per payment (monthly for monthly payments), the same as the
// mortgage calculator on Nader's Lofty listing pages, so both show the same payment (Nader, 2026-10-24).

export const num = (s) => parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;

// Interest rate per payment for a given number of payments a year.
export const periodRate = (annualPct, perYear) => annualPct / 100 / perYear;

export function pmt(principal, annualPct, years, perYear = 12) {
  const n = Math.round(years * perYear);
  if (principal <= 0 || n <= 0) return 0;
  if (annualPct <= 0) return principal / n;
  const r = periodRate(annualPct, perYear);
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

// Balance left after a number of payments of a given amount.
export function balanceAfter(principal, annualPct, perYear, amount, payments) {
  if (annualPct <= 0) return Math.max(principal - amount * payments, 0);
  const r = periodRate(annualPct, perYear);
  const g = Math.pow(1 + r, payments);
  return Math.max(principal * g - (amount * (g - 1)) / r, 0);
}

// Accelerated payments are the monthly payment split in two (bi-weekly) or four (weekly),
// which adds the equivalent of one extra monthly payment a year and pays the loan off sooner.
export const FREQUENCIES = {
  monthly: { label: 'Monthly', perYear: 12 },
  biweekly: { label: 'Bi-weekly', perYear: 26 },
  accBiweekly: { label: 'Accelerated bi-weekly', perYear: 26, split: 2 },
  weekly: { label: 'Weekly', perYear: 52 },
  accWeekly: { label: 'Accelerated weekly', perYear: 52, split: 4 },
};

export function payment({ loan, ratePct, years, frequency = 'monthly', termYears = 5 }) {
  const f = FREQUENCIES[frequency] || FREQUENCIES.monthly;
  const amount = f.split ? pmt(loan, ratePct, years) / f.split : pmt(loan, ratePct, years, f.perYear);
  let n = Math.round(years * f.perYear);
  if (f.split && loan > 0 && amount > 0) {
    if (ratePct <= 0) n = Math.ceil(loan / amount);
    else {
      const r = periodRate(ratePct, f.perYear);
      n = Math.ceil(-Math.log(1 - (loan * r) / amount) / Math.log(1 + r));
    }
  }
  const last = balanceAfter(loan, ratePct, f.perYear, amount, n - 1); // final payment is only what is left
  const totalPaid = loan > 0 ? amount * (n - 1) + last * (ratePct > 0 ? 1 + periodRate(ratePct, f.perYear) : 1) : 0;
  return {
    amount,
    perYear: f.perYear,
    payoffYears: loan > 0 ? n / f.perYear : 0,
    totalInterest: Math.max(totalPaid - loan, 0),
    termBalance: balanceAfter(loan, ratePct, f.perYear, amount, Math.min(termYears * f.perYear, n)),
  };
}

// Turns a down payment entered as $ or % into dollars.
export const downInDollars = (price, value, mode) => (mode === '%' ? (price * value) / 100 : value);

// ---- CMHC mortgage default insurance ----------------------------------------
// Rules as of the Dec 2024 changes; verify against CMHC before relying on them.
export const CMHC = {
  maxInsuredPrice: 1500000,
  longAmortSurcharge: 0.2, // % added when amortization is over 25 years
  tiers: [ // [minimum down %, premium %]
    [15, 2.8],
    [10, 3.1],
    [5, 4.0],
  ],
};

export function minimumDown(price) {
  if (price <= 500000) return price * 0.05;
  if (price < CMHC.maxInsuredPrice) return 25000 + (price - 500000) * 0.1;
  return price * 0.2;
}

export function cmhcInsurance({ price, down, years }) {
  const loan = Math.max(price - down, 0);
  const downPct = price > 0 ? (down / price) * 100 : 0;
  const res = { loan, downPct, minDown: minimumDown(price), ratePct: 0, premium: 0, total: loan, status: 'ok', message: '' };
  if (price <= 0) return res;
  if (downPct >= 20) { res.message = 'Down payment is 20% or more, so mortgage insurance is not required.'; return res; }
  if (price >= CMHC.maxInsuredPrice) { res.status = 'blocked'; res.message = 'Homes at $1.5M or more need at least 20% down (not insurable).'; return res; }
  if (down < res.minDown) { res.status = 'blocked'; res.message = `Minimum down payment for this price is ${money(res.minDown)}.`; return res; }
  let rate = CMHC.tiers.find(([min]) => downPct >= min)[1];
  if (years > 25) rate += CMHC.longAmortSurcharge;
  res.ratePct = rate;
  res.premium = (loan * rate) / 100;
  res.total = loan + res.premium;
  res.message = `Insurance premium of ${rate.toFixed(2)}% is added to the mortgage. BC charges 7% PST on it, paid at closing.`;
  return res;
}

// Payment calculator: price and down payment in, insured mortgage and payment out.
export function mortgagePayment({ price, down, ratePct, years, frequency }) {
  const ins = cmhcInsurance({ price, down, years });
  const loan = ins.status === 'blocked' ? 0 : ins.total;
  return { insurance: ins, loan, ...payment({ loan, ratePct, years, frequency }) };
}

// ---- Affordability ------------------------------------------------------------
// Uses common lender limits: GDS 39% and TDS 44%, qualified at max(rate + 2, 5.25%).
export const AFFORD = { gds: 0.39, tds: 0.44, stressAdd: 2, stressFloor: 5.25, hoaShare: 0.5 };

export function affordability({ income, down, debts, years, ratePct, taxRatePct, heat, hoa }) {
  const monthlyIncome = income / 12;
  const qualRate = Math.max(ratePct + AFFORD.stressAdd, AFFORD.stressFloor);
  const f = pmt(1, qualRate, years); // payment per $1 of loan at the qualifying rate
  const t = taxRatePct / 100 / 12; // monthly property tax per $1 of price
  const limit = Math.min(AFFORD.gds * monthlyIncome, AFFORD.tds * monthlyIncome - debts);
  const fixed = heat + hoa * AFFORD.hoaShare;
  const loan = Math.max((limit - fixed - t * down) / (f + t), 0);
  const price = loan > 0 ? loan + down : 0;
  const tax = (price * taxRatePct) / 100 / 12;
  const qualHousing = loan * f + tax + fixed;
  const payment = pmt(loan, ratePct, years);
  return {
    qualRate, loan, price, payment, tax,
    total: payment + tax + heat + hoa,
    gdsPct: monthlyIncome > 0 ? (qualHousing / monthlyIncome) * 100 : 0,
    tdsPct: monthlyIncome > 0 ? ((qualHousing + debts) / monthlyIncome) * 100 : 0,
  };
}

// ---- BC property transfer tax --------------------------------------------------
// Same rules as apps/my-home-cost/src/costs.js: 1% to $200k, 2% to $2M, 3% above, plus 2% above $3M.
export function propertyTransferTax(price) {
  const band = (from, to, rate) => Math.max(0, Math.min(price, to) - from) * rate;
  return band(0, 200000, 0.01) + band(200000, 2000000, 0.02) + band(2000000, Infinity, 0.03) + band(3000000, Infinity, 0.02);
}

// First-time buyers: up to $8,000 off up to $835k, phased out to $860k.
// Newly built homes: whole tax off up to $1.1M, phased out to $1.15M. Only one can be claimed.
export function transferTax({ price, firstTime = false, newBuild = false }) {
  const full = propertyTransferTax(price);
  const phase = (amount, fullUpTo, partialTo) =>
    price <= fullUpTo ? amount : price < partialTo ? (amount * (partialTo - price)) / (partialTo - fullUpTo) : 0;
  const ftb = firstTime ? phase(Math.min(full, 8000), 835000, 860000) : 0;
  const nb = newBuild ? phase(full, 1100000, 1150000) : 0;
  const exemption = Math.max(ftb, nb);
  const label = nb > ftb ? 'Newly built home exemption' : 'First-time buyer exemption';
  let note = '';
  if ((firstTime || newBuild) && exemption === 0) note = `No exemption applies at ${newBuild ? '$1,150,000' : '$860,000'} or more.`;
  return { full, exemption, label, payable: full - exemption, note };
}

export const money = (n) =>
  (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-CA');

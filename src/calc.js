// Pure calculator math (no React). Canadian fixed-rate mortgages compound semi-annually.

export const num = (s) => parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;

export const monthlyRate = (annualPct) => Math.pow(1 + annualPct / 100 / 2, 2 / 12) - 1;

export function pmt(principal, annualPct, years) {
  const n = Math.round(years * 12);
  if (principal <= 0 || n <= 0) return 0;
  if (annualPct <= 0) return principal / n;
  const r = monthlyRate(annualPct);
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function balanceAfter(principal, annualPct, years, months) {
  const n = Math.round(years * 12);
  if (principal <= 0 || n <= 0) return 0;
  const m = Math.min(months, n);
  if (annualPct <= 0) return principal * (1 - m / n);
  const r = monthlyRate(annualPct);
  const p = pmt(principal, annualPct, years);
  return Math.max(principal * Math.pow(1 + r, m) - (p * (Math.pow(1 + r, m) - 1)) / r, 0);
}

// One row per year: interest paid, principal paid, ending balance.
export function yearlySchedule(principal, annualPct, years) {
  const rows = [];
  let prev = principal;
  for (let y = 1; y <= years; y++) {
    const bal = balanceAfter(principal, annualPct, years, y * 12);
    const paid = pmt(principal, annualPct, years) * 12;
    const principalPaid = prev - bal;
    rows.push({ year: y, principal: principalPaid, interest: Math.max(paid - principalPaid, 0), balance: bal });
    prev = bal;
  }
  return rows;
}

// Turns a down payment entered as $ or % into dollars.
export const downInDollars = (price, value, mode) => (mode === '%' ? (price * value) / 100 : value);

// ---- CMHC mortgage default insurance ---------------------------------------
// Rules as of the Dec 2024 changes; verify against CMHC before relying on them.
export const CMHC = {
  maxInsuredPrice: 1500000,
  minDownTier1: 0.05, // on first $500k
  minDownTier2: 0.10, // on $500k to $1.5M
  longAmortSurcharge: 0.20, // % added when amortization is over 25 years
};

export function minimumDown(price) {
  if (price <= 500000) return price * CMHC.minDownTier1;
  if (price < CMHC.maxInsuredPrice) return 500000 * CMHC.minDownTier1 + (price - 500000) * CMHC.minDownTier2;
  return price * 0.2;
}

export function cmhcInsurance({ price, down, amortYears }) {
  const loan = Math.max(price - down, 0);
  const downPct = price > 0 ? (down / price) * 100 : 0;
  const res = { loan, downPct, minDown: minimumDown(price), ratePct: 0, premium: 0, total: loan, status: 'ok', message: '' };
  if (price <= 0) return res;
  if (downPct >= 20) { res.message = 'Down payment is 20% or more, so mortgage insurance is not required.'; return res; }
  if (price >= CMHC.maxInsuredPrice) { res.status = 'blocked'; res.message = 'Homes at $1.5M or more need at least 20% down (not insurable).'; return res; }
  if (down < res.minDown) { res.status = 'blocked'; res.message = `Minimum down payment for this price is $${Math.round(res.minDown).toLocaleString('en-CA')}.`; return res; }
  let rate = downPct >= 15 ? 2.8 : downPct >= 10 ? 3.1 : 4.0;
  if (amortYears > 25) rate += CMHC.longAmortSurcharge;
  res.ratePct = rate;
  res.premium = (loan * rate) / 100;
  res.total = loan + res.premium;
  return res;
}

// ---- BC Property Transfer Tax ---------------------------------------------
// Rates and exemption thresholds as of 2024; they change, so verify with the BC government.
export const BC_PTT = {
  tiers: [ // [upper bound, rate]
    [200000, 0.01],
    [2000000, 0.02],
    [3000000, 0.03],
    [Infinity, 0.05], // 3% + 2% additional on residential value above $3M
  ],
  firstTimeFull: 835000,
  firstTimePartialTo: 860000,
  newBuildFull: 1100000,
  newBuildPartialTo: 1150000,
};

export function bcTransferTax({ price, firstTime, newBuild }) {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of BC_PTT.tiers) {
    if (price > lower) tax += (Math.min(price, upper) - lower) * rate;
    lower = upper;
  }
  const full = tax;
  let payable = tax;
  let note = '';
  const exempt = (fullUpTo, partialTo, label) => {
    if (price <= fullUpTo) return { payable: 0, note: `${label} exemption applies: no transfer tax.` };
    if (price < partialTo) return { payable: (tax * (price - fullUpTo)) / (partialTo - fullUpTo), note: `Partial ${label.toLowerCase()} exemption applies.` };
    return null;
  };
  const options = [];
  if (firstTime) options.push(exempt(BC_PTT.firstTimeFull, BC_PTT.firstTimePartialTo, 'First-time buyer'));
  if (newBuild) options.push(exempt(BC_PTT.newBuildFull, BC_PTT.newBuildPartialTo, 'Newly built home'));
  for (const o of options) if (o && o.payable < payable) { payable = o.payable; note = o.note; }
  return { full, payable, note };
}

// ---- Affordability -----------------------------------------------------------
// Uses common lender limits: GDS 39% and TDS 44%, qualified at max(rate + 2, 5.25%).
export const AFFORD = { gds: 0.39, tds: 0.44, stressAdd: 2, stressFloor: 5.25, hoaShare: 0.5 };

export function affordability({ income, down, debts, years, ratePct, taxRatePct, insurance, hoa }) {
  const monthlyIncome = income / 12;
  const qualRate = Math.max(ratePct + AFFORD.stressAdd, AFFORD.stressFloor);
  const f = pmt(1, qualRate, years); // payment per $1 of loan at the qualifying rate
  const t = taxRatePct / 100 / 12; // monthly property tax per $1 of price
  const limit = Math.min(AFFORD.gds * monthlyIncome, AFFORD.tds * monthlyIncome - debts);
  const fixed = insurance / 12 + hoa * AFFORD.hoaShare;
  const loan = Math.max((limit - fixed - t * down) / (f + t), 0);
  const price = loan > 0 ? loan + down : 0;
  const payment = pmt(loan, ratePct, years);
  const tax = (price * taxRatePct) / 100 / 12;
  const qualHousing = loan * f + tax + fixed;
  return {
    qualRate, loan, price,
    payment, tax, insurance: insurance / 12, hoa, total: payment + tax + insurance / 12 + hoa,
    gdsPct: monthlyIncome > 0 ? (qualHousing / monthlyIncome) * 100 : 0,
    tdsPct: monthlyIncome > 0 ? ((qualHousing + debts) / monthlyIncome) * 100 : 0,
  };
}

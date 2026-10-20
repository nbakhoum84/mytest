// Presale deposit schedule: deposit dates and amounts from signing to completion, and what is owed at completion.
// GST rebate rules checked October 2026 on canada.ca (First-time Home Buyers' GST/HST Rebate); confirm with your lawyer.
import { minimumDown, transferTax } from '../mortgage-calculator/mortgage.js';

// Common Metro Vancouver structures: [% of price, days after signing].
export const PRESETS = {
  '15%': [[5, 0], [5, 90], [5, 180]],
  '20%': [[5, 0], [5, 90], [5, 180], [5, 365]],
  '10%': [[5, 0], [5, 90]],
  '10/10': [[10, 0], [10, 180]],
};

export const LEGAL = 1800; // same legal estimate as the Buyer Cost app

// 'YYYY-MM-DD' plus a number of days, as 'YYYY-MM-DD'.
export function addDays(iso, days) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// First-time buyers of a new home: GST back up to $50,000 on homes up to $1M, phasing out to nothing at $1.5M.
export function ftbGstRebate(price) {
  const base = Math.min(price * 0.05, 50000);
  if (price <= 1000000) return base;
  if (price < 1500000) return (base * (1500000 - price)) / 500000;
  return 0;
}

export function depositSchedule({ price, signed, deposits, completion, firstTime = false, gstIncluded = false }) {
  let paid = 0;
  const rows = deposits
    .filter(([pct]) => pct > 0)
    .map(([pct, days]) => ({ pct, days, date: addDays(signed, days), amount: (price * pct) / 100 }))
    .sort((a, b) => a.days - b.days)
    .map((r) => ({ ...r, paid: (paid += r.amount) }));
  // GST is usually added to a presale price at completion; when the price includes it, the builder handles any rebate.
  const gst = gstIncluded ? 0 : price * 0.05;
  const rebate = firstTime && !gstIncluded ? ftbGstRebate(price) : 0;
  const tax = transferTax({ price, firstTime, newBuild: true });
  const balance = Math.max(price - paid, 0);
  const late = completion ? rows.filter((r) => r.date > completion) : [];
  return {
    rows, deposits: paid, depositPct: price ? (paid / price) * 100 : 0, balance,
    gst, rebate, gstPayable: gst - rebate, ptt: tax.payable, pttExemption: tax.exemption, legal: LEGAL,
    // Deposits count toward the down payment; the rest of the balance is usually the mortgage.
    minDown: minimumDown(price), extraDown: Math.max(minimumDown(price) - paid, 0),
    mortgage: Math.max(price - Math.max(paid, minimumDown(price)), 0),
    cashAtCompletion: Math.max(minimumDown(price) - paid, 0) + gst - rebate + tax.payable + LEGAL,
    late,
  };
}

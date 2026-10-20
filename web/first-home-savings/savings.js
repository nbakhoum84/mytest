// First-time buyer savings plan: FHSA, RRSP Home Buyers' Plan and other savings, month by month, until the down payment goal is reached.
// Rules checked October 2026 on canada.ca (FHSA, HBP) and the 2026 federal budget update; confirm with CRA before relying on them.
import { cmhcInsurance, minimumDown, transferTax } from '../mortgage-calculator/mortgage.js';

export const RULES = {
  fhsaAnnual: 8000, // per person per year
  fhsaLifetime: 40000, // per person
  fhsaCarryMax: 8000, // unused room carried into the next year, per person
  fhsaYears: 15, // an FHSA must be used or closed within 15 years of opening
  hbpMax: 60000, // RRSP Home Buyers' Plan withdrawal per person
  hbpRepayYears: 15,
  hbpGraceUntil: 2028, // first withdrawals up to the end of 2028 start repaying in the 5th year after, otherwise the 2nd
};

// Same fixed estimates as the Buyer Cost app (legal, inspection, appraisal, home insurance).
export const CLOSING_FIXED = 1800 + 500 + 400 + 1500;

// Down payment and cash closing costs for a first-time buyer at this price.
export function savingsGoal({ price, downPct = 0, closing = true }) {
  const min = minimumDown(price);
  const down = Math.max(min, (price * downPct) / 100);
  const ptt = transferTax({ price, firstTime: true }).payable;
  // PST on the CMHC premium is paid in cash at closing (the premium itself is added to the mortgage).
  const pst = cmhcInsurance({ price, down, years: 25 }).premium * 0.07;
  const closingCost = closing ? ptt + CLOSING_FIXED + pst : 0;
  return { down, min, ptt: closing ? ptt : 0, pst: closing ? pst : 0, closing: closingCost, total: down + closingCost };
}

// Year the HBP repayments start for a first withdrawal in this year.
export const hbpRepayStart = (year) => year + (year <= RULES.hbpGraceUntil ? 5 : 2);

// Simulates saving month by month. Amounts are for the household: with a partner, both have their own FHSA and HBP limits.
export function savingsPlan({
  goal, people = 1, startYear, startMonth = 0, monthly = 0, other = 0, returnPct = 0,
  fhsaBalance = 0, fhsaContributed = 0, fhsaRoom = RULES.fhsaAnnual, rrsp = 0, rrspMonthly = 0, taxPct = 0, maxMonths = 600,
}) {
  const p = people === 2 ? 2 : 1;
  const growth = Math.pow(1 + returnPct / 100, 1 / 12);
  let fhsa = fhsaBalance, rrspBal = rrsp, cash = other, contributed = fhsaContributed;
  let room = Math.min(fhsaRoom, RULES.fhsaLifetime * p - contributed);
  let year = startYear, month = startMonth, months = 0, newFhsa = 0;
  const usable = () => fhsa + Math.min(rrspBal, RULES.hbpMax * p) + cash;
  while (usable() < goal && months < maxMonths) {
    months++;
    if (++month === 12) {
      month = 0; year++;
      // Up to one year of unused room carries forward; the lifetime limit still caps it.
      room = Math.min(RULES.fhsaAnnual * p + Math.min(room, RULES.fhsaCarryMax * p), RULES.fhsaLifetime * p - contributed);
    }
    fhsa *= growth; rrspBal *= growth; cash *= growth;
    const toFhsa = Math.max(0, Math.min(monthly, room));
    fhsa += toFhsa; room -= toFhsa; contributed += toFhsa; newFhsa += toFhsa;
    cash += monthly - toFhsa;
    rrspBal += rrspMonthly;
  }
  const hbp = Math.min(rrspBal, RULES.hbpMax * p);
  return {
    reached: usable() >= goal,
    months, year, month,
    fhsa, hbp, rrsp: rrspBal, other: cash, total: usable(),
    fhsaContributions: newFhsa,
    // FHSA and RRSP contributions are tax deductible; refunds are shown separately and not added to savings.
    taxRefund: ((newFhsa + rrspMonthly * months) * taxPct) / 100,
    hbpYearly: hbp / RULES.hbpRepayYears,
    hbpRepayFrom: hbpRepayStart(year),
  };
}

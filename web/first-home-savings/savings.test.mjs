import test from 'node:test';
import assert from 'node:assert/strict';
import { CLOSING_FIXED, RULES, hbpRepayStart, savingsGoal, savingsPlan } from './savings.js';

test('goal is the minimum down payment plus first-time buyer closing costs', () => {
  const g = savingsGoal({ price: 700000 });
  assert.equal(g.down, 25000 + 20000); // 5% of $500k + 10% of the rest
  assert.equal(g.ptt, 12000 - 8000); // $12,000 PTT less the $8,000 first-time buyer exemption
  assert.ok(g.pst > 0); // under 20% down, PST on the CMHC premium is paid in cash
  assert.equal(g.total, g.down + g.ptt + CLOSING_FIXED + g.pst);
  assert.equal(savingsGoal({ price: 700000, closing: false }).total, 45000);
});

test('20% down has no CMHC PST, and $1.5M+ always needs 20%', () => {
  assert.equal(savingsGoal({ price: 800000, downPct: 20 }).pst, 0);
  assert.equal(savingsGoal({ price: 1600000 }).down, 320000);
});

test('FHSA fills at $8,000 a year and the rest goes to other savings', () => {
  const r = savingsPlan({ goal: 20000, startYear: 2026, startMonth: 0, monthly: 1000 });
  assert.equal(r.months, 20); // Jan 2026 + 20 months = Sept 2027
  assert.equal(r.year, 2027);
  assert.equal(r.month, 8);
  // Feb-Sep 2026 fill the $8,000 room and Oct-Dec go to other savings; Jan-Aug 2027 fill the new room and Sep goes to other savings.
  assert.equal(r.fhsa + r.other, 20000);
  assert.equal(r.fhsaContributions, 8000 + 8000);
});

test('unused FHSA room carries forward up to $8,000 and the lifetime limit caps it', () => {
  const r = savingsPlan({ goal: 1e9, startYear: 2026, startMonth: 11, monthly: 20000, fhsaRoom: 8000, fhsaContributed: 0, maxMonths: 1 });
  assert.equal(r.fhsaContributions, 16000); // January: $8,000 new + $8,000 carried
  const capped = savingsPlan({ goal: 1e9, startYear: 2026, startMonth: 11, monthly: 20000, fhsaContributed: 36000, maxMonths: 1 });
  assert.equal(capped.fhsaContributions, 4000);
});

test('a partner doubles the FHSA and HBP limits', () => {
  const one = savingsPlan({ goal: 200000, startYear: 2026, rrsp: 100000 });
  assert.equal(one.hbp, RULES.hbpMax);
  const two = savingsPlan({ goal: 200000, people: 2, startYear: 2026, rrsp: 100000 });
  assert.equal(two.hbp, 100000);
});

test('goal already met returns now', () => {
  const r = savingsPlan({ goal: 50000, startYear: 2026, other: 60000 });
  assert.equal(r.months, 0);
  assert.ok(r.reached);
});

test('HBP repayment starts in the 5th year for first withdrawals to 2028, the 2nd after', () => {
  assert.equal(hbpRepayStart(2026), 2031);
  assert.equal(hbpRepayStart(2028), 2033);
  assert.equal(hbpRepayStart(2029), 2031);
});

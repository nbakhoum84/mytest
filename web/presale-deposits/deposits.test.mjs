import test from 'node:test';
import assert from 'node:assert/strict';
import { PRESETS, addDays, depositSchedule, ftbGstRebate } from './deposits.js';

test('dates count days from signing', () => {
  assert.equal(addDays('2026-10-19', 0), '2026-10-19');
  assert.equal(addDays('2026-10-19', 90), '2027-01-17');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
});

test('15% schedule on $750,000', () => {
  const s = depositSchedule({ price: 750000, signed: '2026-10-19', deposits: PRESETS['15%'], completion: '2029-10-01' });
  assert.deepEqual(s.rows.map((r) => r.amount), [37500, 37500, 37500]);
  assert.deepEqual(s.rows.map((r) => r.date), ['2026-10-19', '2027-01-17', '2027-04-17']);
  assert.equal(s.deposits, 112500);
  assert.equal(s.balance, 637500);
  assert.equal(s.gst, 37500);
  assert.equal(s.ptt, 0); // newly built, under $1.1M
  assert.equal(s.extraDown, 0); // minimum down is $50,000
  assert.equal(s.mortgage, 637500);
  assert.equal(s.cashAtCompletion, 37500 + 1800);
  assert.equal(s.late.length, 0);
});

test('first-time buyer GST rebate: full to $1M, phased out by $1.5M, capped at $50,000', () => {
  assert.equal(ftbGstRebate(800000), 40000);
  assert.equal(ftbGstRebate(1000000), 50000);
  assert.equal(ftbGstRebate(1250000), 25000);
  assert.equal(ftbGstRebate(1500000), 0);
  const s = depositSchedule({ price: 800000, signed: '2026-10-19', deposits: PRESETS['10%'], firstTime: true });
  assert.equal(s.gstPayable, 0);
});

test('GST included in the price adds no GST or rebate', () => {
  const s = depositSchedule({ price: 800000, signed: '2026-10-19', deposits: PRESETS['20%'], firstTime: true, gstIncluded: true });
  assert.equal(s.gst, 0);
  assert.equal(s.rebate, 0);
});

test('deposits below the minimum down payment show the extra cash needed', () => {
  const s = depositSchedule({ price: 1600000, signed: '2026-10-19', deposits: PRESETS['10%'] });
  assert.equal(s.extraDown, 320000 - 160000);
  assert.equal(s.mortgage, 1600000 - 320000);
  assert.ok(s.ptt > 0); // over $1.15M, no new home exemption
});

test('deposits after completion are flagged and rows sort by date', () => {
  const s = depositSchedule({ price: 500000, signed: '2026-10-19', deposits: [[5, 400], [5, 0]], completion: '2027-06-01' });
  assert.deepEqual(s.rows.map((r) => r.days), [0, 400]);
  assert.equal(s.late.length, 1);
});

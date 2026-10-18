import assert from 'assert';
import { readFileSync } from 'fs';
import { propertyTransferTax, transferTax, pmt, payment, minimumDown, cmhcInsurance, mortgagePayment, affordability, downInDollars } from './mortgage.js';

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} is not ${b}`);

// $500k at 5% over 25 years, compounded semi-annually.
near(pmt(500000, 5, 25), 2908.02);
near(payment({ loan: 500000, ratePct: 5, years: 25 }).totalInterest, 2908.0249 * 300 - 500000, 1);
near(pmt(120000, 0, 10), 1000);
assert.strictEqual(pmt(0, 5, 25), 0);

// Accelerated bi-weekly is half the monthly payment and pays the loan off sooner.
const acc = payment({ loan: 500000, ratePct: 5, years: 25, frequency: 'accBiweekly' });
near(acc.amount, 1454.01);
assert.ok(acc.payoffYears > 21 && acc.payoffYears < 22);
const bi = payment({ loan: 500000, ratePct: 5, years: 25, frequency: 'biweekly' });
assert.strictEqual(bi.payoffYears, 25);
assert.ok(bi.amount < acc.amount);
// Balance after the 5-year term is the same whether paid monthly or bi-weekly.
near(bi.termBalance, payment({ loan: 500000, ratePct: 5, years: 25 }).termBalance, 1);
assert.strictEqual(payment({ loan: 120000, ratePct: 0, years: 10, frequency: 'accWeekly' }).termBalance, 55000);

// Minimum down: 5% of the first $500k, 10% of the rest, 20% at $1.5M or more.
assert.strictEqual(minimumDown(400000), 20000);
assert.strictEqual(minimumDown(800000), 55000);
assert.strictEqual(minimumDown(1500000), 300000);
assert.strictEqual(downInDollars(800000, 10, '%'), 80000);

// CMHC premium tiers, plus 0.20% for amortizations over 25 years.
assert.strictEqual(cmhcInsurance({ price: 800000, down: 55000, years: 25 }).premium, 745000 * 0.04);
assert.strictEqual(cmhcInsurance({ price: 800000, down: 80000, years: 25 }).ratePct, 3.1);
assert.strictEqual(cmhcInsurance({ price: 800000, down: 120000, years: 25 }).ratePct, 2.8);
near(cmhcInsurance({ price: 800000, down: 120000, years: 30 }).ratePct, 3.0);
assert.strictEqual(cmhcInsurance({ price: 800000, down: 160000, years: 25 }).premium, 0);
assert.strictEqual(cmhcInsurance({ price: 800000, down: 50000, years: 25 }).status, 'blocked');
assert.strictEqual(cmhcInsurance({ price: 1600000, down: 200000, years: 25 }).status, 'blocked');

// The payment calculator finances the premium.
const m = mortgagePayment({ price: 800000, down: 55000, ratePct: 4.5, years: 25, frequency: 'monthly' });
assert.strictEqual(m.loan, 774800);
near(m.amount, pmt(774800, 4.5, 25));
assert.strictEqual(mortgagePayment({ price: 800000, down: 1000, ratePct: 4.5, years: 25 }).amount, 0);

// Affordability stays within GDS 39% / TDS 44% at the stress-test rate.
const a = affordability({ income: 150000, down: 100000, debts: 500, years: 25, ratePct: 4.5, taxRatePct: 0.3, heat: 100, hoa: 0 });
assert.strictEqual(a.qualRate, 6.5);
assert.ok(a.gdsPct <= 39.0001 && a.tdsPct <= 44.0001);
assert.strictEqual(affordability({ income: 150000, down: 0, debts: 0, years: 25, ratePct: 2, taxRatePct: 0, heat: 0, hoa: 0 }).qualRate, 5.25);
assert.strictEqual(affordability({ income: 0, down: 50000, debts: 0, years: 25, ratePct: 4, taxRatePct: 0.3, heat: 0, hoa: 0 }).price, 0);
// BC property transfer tax and exemptions.
assert.strictEqual(propertyTransferTax(1000000), 18000);
assert.strictEqual(propertyTransferTax(4000000), 2000 + 36000 + 60000 + 20000);
assert.strictEqual(transferTax({ price: 800000, firstTime: true }).payable, 6000);
assert.strictEqual(transferTax({ price: 400000, firstTime: true }).payable, 0);
assert.strictEqual(transferTax({ price: 850000, firstTime: true }).exemption, 3200);
assert.strictEqual(transferTax({ price: 860000, firstTime: true }).exemption, 0);
assert.strictEqual(transferTax({ price: 1100000, newBuild: true }).payable, 0);
assert.strictEqual(Math.round(transferTax({ price: 1140000, newBuild: true }).exemption), 4160);
assert.strictEqual(transferTax({ price: 1000000, firstTime: true, newBuild: true }).label, 'Newly built home exemption');

// The web app (web/mortgage-calculator) loads its own copy of this file.
assert.strictEqual(
  readFileSync(new URL('../../../web/mortgage-calculator/mortgage.js', import.meta.url), 'utf8'),
  readFileSync(new URL('./mortgage.js', import.meta.url), 'utf8'),
  'web/mortgage-calculator/mortgage.js is out of date: copy apps/mortgage-calculator/src/mortgage.js over it'
);
// The Lofty embed is generated from the web app by scripts/build_mortgage_embed.py.
assert.ok(
  readFileSync(new URL('../../../site-snippet/mortgage-calculator-embed.html', import.meta.url), 'utf8')
    .includes(readFileSync(new URL('./mortgage.js', import.meta.url), 'utf8').replaceAll('export ', '')),
  'site-snippet/mortgage-calculator-embed.html is out of date: run python3 scripts/build_mortgage_embed.py'
);
console.log('mortgage tests passed');

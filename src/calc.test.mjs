import assert from 'assert';
import { bcTransferTax, buyerCost, sellerCost } from './calc.js';
import { estimateClosingCosts } from '../apps/my-home-cost/src/costs.js';
import { estimateSellerCosts } from '../apps/seller-cost/src/costs.js';

// The app's built-in Buyer cost and Seller cost must give the same totals as the standalone apps.
const near = (a, b) => assert.ok(Math.abs(a - b) < 0.01, `${a} != ${b}`);
for (const price of [150000, 400000, 700000, 835000, 845000, 860000, 1100000, 1120000, 1150000, 2500000, 3500000]) {
  for (const [firstTime, newBuild] of [[false, false], [true, false], [false, true]]) {
    for (const gst of [false, true]) {
      near(buyerCost({ price, firstTime, newBuild, addGst: gst }).total, estimateClosingCosts({ price, firstTimeBuyer: firstTime, newBuild, gst }).total);
    }
  }
}
for (const price of [80000, 100000, 900000, 2000000]) {
  for (const [mortgage, penalty, legal, staging] of [[0, 0, 1500, 1500], [300000, 4000, 1200, 2500]]) {
    near(
      sellerCost({ price, mortgage, penalty, legal, staging, pct1: 7, pct2: 3 }).net,
      estimateSellerCosts({ price, mortgage, penalty, legal, prep: staging }).netProceeds,
    );
  }
}

// Transfer Tax screen: first-time buyer exemption is capped at $8,000.
assert.strictEqual(bcTransferTax({ price: 400000, firstTime: true }).payable, 0);
assert.strictEqual(bcTransferTax({ price: 700000, firstTime: true }).payable, 12000 - 8000);
near(bcTransferTax({ price: 845000, firstTime: true }).payable, 14900 - 8000 * 0.6);
assert.strictEqual(bcTransferTax({ price: 900000, firstTime: true }).payable, 16000);
// Newly built home: whole tax waived up to $1.1M; the larger exemption wins when both are ticked.
assert.strictEqual(bcTransferTax({ price: 1000000, newBuild: true }).payable, 0);
assert.strictEqual(bcTransferTax({ price: 700000, firstTime: true, newBuild: true }).payable, 0);
assert.strictEqual(bcTransferTax({ price: 4000000 }).full, 2000 + 36000 + 60000 + 20000);

// Foreign buyer: extra 20% PTT, no exemptions; same total as the standalone app.
for (const price of [700000, 1200000]) {
  near(buyerCost({ price, firstTime: true, newBuild: false, addGst: false, foreign: true }).total, estimateClosingCosts({ price, firstTimeBuyer: true, foreignBuyer: true }).total);
}
near(buyerCost({ price: 700000, firstTime: false, newBuild: false, addGst: false, foreign: true }).foreignTax, 140000);

console.log('calc tests passed');

import assert from 'assert';
import { propertyTransferTax, estimateClosingCosts, firstTimeBuyerExemption, newBuildExemption } from './costs.js';

assert.strictEqual(propertyTransferTax(200000), 2000);
assert.strictEqual(propertyTransferTax(1000000), 2000 + 16000);
assert.strictEqual(propertyTransferTax(3000000), 2000 + 36000 + 30000);
assert.strictEqual(propertyTransferTax(4000000), 2000 + 36000 + 60000 + 20000);
assert.strictEqual(firstTimeBuyerExemption(400000), propertyTransferTax(400000)); // fully waived
assert.strictEqual(firstTimeBuyerExemption(500000), 8000);
assert.strictEqual(firstTimeBuyerExemption(800000), 8000);
assert.strictEqual(firstTimeBuyerExemption(835000), 8000);
assert.strictEqual(firstTimeBuyerExemption(836000), 7680);
assert.strictEqual(firstTimeBuyerExemption(850000), 3200);
assert.strictEqual(firstTimeBuyerExemption(860000), 0);
const ftb = estimateClosingCosts({ price: 800000, firstTimeBuyer: true });
assert.strictEqual(ftb.items[1].amount, -8000);
assert.strictEqual(ftb.closingTotal, 14000 - 8000 + 4200); // fixed fees incl. $1,500 first-year home insurance
assert.strictEqual(newBuildExemption(1000000), propertyTransferTax(1000000)); // fully waived
assert.strictEqual(newBuildExemption(1100000), 20000);
assert.strictEqual(Math.round(newBuildExemption(1140000)), 4160);
assert.strictEqual(newBuildExemption(1150000), 0);
const nb = estimateClosingCosts({ price: 1100000, newBuild: true });
assert.strictEqual(nb.items[1].label, 'Newly built home exemption');
assert.strictEqual(nb.items[0].amount + nb.items[1].amount, 0);
const r = estimateClosingCosts({ price: 900000 });
assert.strictEqual(r.closingTotal, 20200);
assert.strictEqual(r.total, 920200);
const g = estimateClosingCosts({ price: 1000000, gst: true });
assert.strictEqual(g.gst, 50000);
assert.strictEqual(g.total, 1000000 + g.closingTotal + 50000);
assert.strictEqual(estimateClosingCosts({ price: 1000000 }).gst, 0);
console.log('costs tests passed');

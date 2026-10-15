import assert from 'assert';
import { propertyTransferTax, estimateClosingCosts, firstTimeBuyerExemption } from './costs.js';

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
assert.strictEqual(ftb.closingTotal, 14000 - 8000 + 2700);
const r = estimateClosingCosts({ price: 900000 });
assert.strictEqual(r.closingTotal, 18700);
assert.strictEqual(r.total, 918700);
console.log('costs tests passed');

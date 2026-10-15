import assert from 'assert';
import { propertyTransferTax, estimateClosingCosts } from './costs.js';

assert.strictEqual(propertyTransferTax(200000), 2000);
assert.strictEqual(propertyTransferTax(1000000), 2000 + 16000);
assert.strictEqual(propertyTransferTax(3000000), 2000 + 36000 + 30000);
assert.strictEqual(propertyTransferTax(4000000), 2000 + 36000 + 60000 + 20000);
assert.strictEqual(estimateClosingCosts({ price: 800000, firstTimeBuyer: true }).items[0].amount, 0);
const r = estimateClosingCosts({ price: 900000 });
assert.strictEqual(r.closingTotal, 18700);
assert.strictEqual(r.total, 918700);
console.log('costs tests passed');

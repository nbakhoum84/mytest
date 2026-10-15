import assert from 'assert';
import { commission, estimateSellerCosts } from './costs.js';

assert.strictEqual(commission(100000), 7000);
assert.strictEqual(commission(1000000), 7000 + 27000);
assert.strictEqual(commission(50000), 3500);
assert.strictEqual(commission(1000000, { firstRate: 0.05, restRate: 0.02 }), 5000 + 18000);
const r = estimateSellerCosts({ price: 1000000, mortgage: 400000 });
assert.strictEqual(r.items[0].amount, 34000);
assert.strictEqual(r.items[1].amount, 1700);
assert.strictEqual(r.sellingCosts, 34000 + 1700 + 1500 + 75 + 1500);
assert.strictEqual(r.netProceeds, 1000000 - r.sellingCosts - 400000);
assert.strictEqual(r.note, null);
const p = estimateSellerCosts({ price: 1000000, penalty: 8000 });
assert.strictEqual(p.items[p.items.length - 1].amount, 8000);
assert.strictEqual(p.sellingCosts, r.sellingCosts + 8000);
const neg = estimateSellerCosts({ price: 500000, mortgage: 520000 });
assert.ok(neg.netProceeds < 0 && neg.note);
console.log('seller-cost tests passed');

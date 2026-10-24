import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { ptt, costs } = createRequire(import.meta.url)('./costs.js');

test('commercial PTT uses 1/2/3% bands with no extra residential 2% over $3M', () => {
  assert.equal(ptt(200000), 2000);
  assert.equal(ptt(1000000), 2000 + 16000);
  assert.equal(ptt(2000000), 2000 + 36000);
  assert.equal(ptt(5000000), 2000 + 36000 + 90000);
});

test('GST is added for a non-registrant and is not a cash cost for a registrant', () => {
  const a = costs(1000000, {});
  assert.equal(a.gst, 50000);
  assert.equal(a.total, 1000000 + a.closing + 50000);
  const b = costs(1000000, { registrant: true });
  assert.equal(b.gstPaid, 0);
  assert.equal(b.total, 1000000 + b.closing);
  assert.equal(costs(1000000, { gst: false }).gst, 0);
});

test('closing costs are PTT plus the fixed estimates', () => {
  const c = costs(3000000, {});
  assert.equal(c.closing, ptt(3000000) + 3500 + 4000 + 3500 + 3000);
});

test('a business-only sale (no land) has no property transfer tax and no commercial appraisal', () => {
  const c = costs(1000000, { land: false });
  assert.equal(c.items[0][1], 0);
  assert.equal(c.items.find((i) => i[0] === 'Commercial appraisal')[1], 0);
  assert.equal(c.closing, 3500 + 3500 + 3000);
});

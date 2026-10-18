// BC commercial purchase costs. Used by index.html (window.CommercialCosts) and the tests (module.exports).
(function (root) {
var band = function (p, from, to, rate) { return Math.max(0, Math.min(p, to) - from) * rate; };
// Property transfer tax on non-residential property: 1% to $200k, 2% to $2M, 3% above.
// The extra 2% above $3M applies only to residential property, and the first-time buyer and
// newly built home exemptions are residential only, so none of them apply here.
function ptt(p) { return band(p, 0, 2e5, .01) + band(p, 2e5, 2e6, .02) + band(p, 2e6, Infinity, .03); }
// Typical buyer-side costs for a commercial purchase in BC (estimates).
var FEES = [['Legal fees & disbursements', 3500], ['Commercial appraisal', 4000],
  ['Phase I environmental site assessment', 3500], ['Building condition assessment', 3000]];
// PTT is a tax on registering land, so a business-only sale (shares or business assets, no land
// or building title) pays none: pass { land: false }.
// GST: most commercial real property sales are taxable at 5%. A GST-registered buyer self-assesses
// it and normally claims it back as an input tax credit, so it is not a cash cost at closing.
function costs(price, opts) {
  var p = Math.max(0, +price || 0), o = opts || {};
  var items = [['Property transfer tax', o.land === false ? 0 : ptt(p)]].concat(FEES.map(function (f) { return f.slice(); }));
  var closing = items.reduce(function (s, i) { return s + i[1]; }, 0);
  var gst = o.gst === false ? 0 : p * .05;
  var gstPaid = o.registrant ? 0 : gst;
  return { price: p, items: items, closing: closing, gst: gst, gstPaid: gstPaid, total: p + closing + gstPaid };
}
var api = { ptt: ptt, costs: costs, FEES: FEES };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.CommercialCosts = api;
})(this);

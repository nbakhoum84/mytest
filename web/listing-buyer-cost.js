// Buyer Cost button on listing cards. Served from GitHub Pages (nbakhoum84.github.io/mytest/listing-buyer-cost.js) and loaded by the short
// loader in site-snippet/listing-price-buyer-cost.js, either per page or once site-wide (it then only acts on Residential and Presales/New pages).
// Every listing card gets a "Buyer cost" button next to its price. Clicking the button (or the price) opens the Buyer Cost
// calculator in a popup, prefilled with that price; the card's own link still works everywhere else on the card.
// Presale / new-build cards (or a page whose address mentions presale/new) also tick "New build: add 5% GST".
(function () {
var APP = 'https://nbakhoum84.github.io/mytest/my-home-cost/';
var NEW_PAGE = /pre-?sale|new-?(home|build|construction|development|listing)|\/new(\/|$|\?|-)/i;
var NEW_CARD = /pre-?sale|new construction|new development|est(\.|imated)? completion|completion date|move-in ready|developer/i;
// "$1,299,000", "From $599,900", "Starting at $1.2M", "C$849,000+", "$599,900 - $1,200,000" (uses the lowest).
var PRICE = /^(?:(?:list(?:ed)?\s*price|asking(?:\s*price)?|price|priced\s*from|starting\s*(?:from|at)|from)\s*:?\s*)?(?:CAD\s*|CA?)?\$\s*(\d[\d,]*(?:\.\d+)?)\s*([KkMm])?\s*\+?\s*(?:CAD)?(?:\s*[-–]\s*(?:CAD\s*|CA?)?\$\s*\d[\d,]*(?:\.\d+)?\s*[KkMm]?\s*\+?)?$/i;
var SKIP = 'header,nav,footer,form,select,option,button,input,textarea,label,script,style,#hn-bcp-modal,' +
'.gm-style,.mapboxgl-map,.leaflet-container,[class*="marker" i],[class*="cluster" i],[class*="filter" i],[class*="dropdown" i],[class*="slider" i]';

function parsePrice(text) {
var m = PRICE.exec(String(text || '').replace(/\s+/g, ' ').trim());
if (!m) return 0;
var n = parseFloat(m[1].replace(/,/g, ''));
if (m[2]) n *= /m/i.test(m[2]) ? 1e6 : 1e3;
n = Math.round(n);
return n >= 50000 && n <= 100000000 ? n : 0;
}
if (typeof document === 'undefined') { if (typeof module !== 'undefined') module.exports = { parsePrice: parsePrice }; return; }

// The listing card: the nearest ancestor (up to 8 levels) that also holds a photo.
function cardOf(el) {
for (var a = el.parentElement, i = 0; a && a !== document.body && i < 8; a = a.parentElement, i++) {
if (a.querySelector('img,picture,[style*="background-image"]')) return a;
}
return null;
}

function mark(el, price) {
el.classList.add('hn-bcp');
el.setAttribute('data-hn-price', price);
if (!el.title) el.title = 'See buyer closing costs for this price';
addButton(el, price);
}

// One "Buyer cost" button per card, right after the price. Re-added if the site redraws the card.
function addButton(el, price) {
var next = el.nextElementSibling;
if (next && next.classList.contains('hn-bcp-btn')) { next.setAttribute('data-hn-price', price); return; }
var card = cardOf(el);
if (card && card.querySelector('.hn-bcp-btn')) return;
var b = document.createElement('button');
b.type = 'button';
b.className = 'hn-bcp-btn';
b.setAttribute('data-hn-price', price);
b.setAttribute('aria-label', 'Buyer cost for $' + price.toLocaleString('en-CA'));
b.textContent = 'Buyer cost';
el.insertAdjacentElement('afterend', b);
}

function scan() {
if (!document.body) return;
var done = document.querySelectorAll('.hn-bcp');
for (var d = 0; d < done.length; d++) addButton(done[d], +done[d].getAttribute('data-hn-price'));
var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
acceptNode: function (n) { return n.nodeValue.indexOf('$') >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
});
var n;
while ((n = walker.nextNode())) {
var el = n.parentElement;
if (!el || el.closest('.hn-bcp') || el.closest(SKIP)) continue;
// Climb while the text still reads as a single price, so "$" and "1,299,000" split across spans count as one.
var best = parsePrice(el.textContent) ? el : null;
for (var a = el.parentElement, i = 0; a && i < 3; a = a.parentElement, i++) {
if (a.textContent.length > 60 || !parsePrice(a.textContent) || a.querySelector('img,picture,[style*="background-image"]')) break;
best = a;
}
if (!best || !cardOf(best)) continue;
mark(best, parsePrice(best.textContent));
}
}

function isNew(el) {
if (NEW_PAGE.test(location.pathname + location.search)) return true;
var card = cardOf(el);
return !!(card && NEW_CARD.test(card.textContent));
}

function modal() {
var m = document.getElementById('hn-bcp-modal');
if (m) return m;
m = document.createElement('div');
m.id = 'hn-bcp-modal';
m.innerHTML =
'<div class="hn-bcp-box" role="dialog" aria-modal="true" aria-label="Buyer Cost">' +
'<div class="hn-bcp-bar"><b class="hn-bcp-title">Buyer Cost</b>' +
'<a class="hn-bcp-open" target="_blank" rel="noopener">Open in new tab</a>' +
'<button type="button" class="hn-bcp-x" aria-label="Close">&times;</button></div>' +
'<iframe title="Buyer Cost calculator"></iframe></div>';
document.body.appendChild(m);
m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('.hn-bcp-x')) close(); });
return m;
}
function close() {
var m = document.getElementById('hn-bcp-modal');
if (!m) return;
m.classList.remove('hn-bcp-on');
m.querySelector('iframe').src = 'about:blank';
document.documentElement.style.overflow = '';
}
function openCalc(price, isNewBuild) {
var url = APP + '?price=' + price + (isNewBuild ? '&new=1' : '');
var m = modal();
m.querySelector('.hn-bcp-title').textContent = 'Buyer Cost for $' + price.toLocaleString('en-CA');
m.querySelector('.hn-bcp-open').href = url;
m.querySelector('iframe').src = url;
m.classList.add('hn-bcp-on');
document.documentElement.style.overflow = 'hidden';
m.querySelector('.hn-bcp-x').focus();
}

function onClick(e) {
var el = e.target && e.target.closest && e.target.closest('.hn-bcp,.hn-bcp-btn');
if (!el) return;
var price = +el.getAttribute('data-hn-price');
if (!price) return;
// Stop the card's own link (to the listing page) only for clicks on the price or the button.
e.preventDefault();
e.stopPropagation();
if (e.stopImmediatePropagation) e.stopImmediatePropagation();
openCalc(price, isNew(el));
}

function start() {
var style = document.createElement('style');
style.textContent =
'.hn-bcp{cursor:pointer!important;text-decoration:underline dotted rgba(201,160,99,.9)!important;text-underline-offset:4px}' +
'.hn-bcp-btn{display:inline-flex!important;align-items:center;gap:6px;margin:8px 0 4px;padding:8px 14px;border:0;border-radius:8px;background:#c9a063;color:#111;font-family:inherit;font-weight:600;font-size:13px;line-height:1.2;letter-spacing:0;text-transform:none;cursor:pointer;white-space:nowrap;position:relative;z-index:2}' +
'.hn-bcp-btn::before{content:"";width:14px;height:14px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v4h10V4H7zm1 7v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zm-8 4v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v6h2v-6h-2zm-8 4v2h2v-2H8zm4 0v2h2v-2h-2z%27/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v4h10V4H7zm1 7v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zm-8 4v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v6h2v-6h-2zm-8 4v2h2v-2H8zm4 0v2h2v-2h-2z%27/%3E%3C/svg%3E") center/contain no-repeat}' +
'.hn-bcp-btn:hover{background:#b88d4f}' +
'#hn-bcp-modal{display:none;position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);align-items:center;justify-content:center;padding:16px}' +
'#hn-bcp-modal.hn-bcp-on{display:flex}' +
'#hn-bcp-modal .hn-bcp-box{width:600px;max-width:100%;height:min(820px,100%);background:#fff;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.35)}' +
'#hn-bcp-modal .hn-bcp-bar{display:flex;align-items:center;gap:12px;padding:10px 12px 10px 18px;border-bottom:1px solid #e6e2d9;background:#f4f2ee;color:#111;font-family:inherit;font-size:15px;line-height:1.3}' +
'#hn-bcp-modal .hn-bcp-title{flex:1;font-weight:600}' +
'#hn-bcp-modal .hn-bcp-open{color:#8a6a35;font-size:13px;text-decoration:underline}' +
'#hn-bcp-modal .hn-bcp-x{border:0;background:none;font-size:28px;line-height:1;padding:0 6px;cursor:pointer;color:#111}' +
'#hn-bcp-modal iframe{flex:1;width:100%;border:0;background:#fff}' +
'@media(max-width:640px){#hn-bcp-modal{padding:0}#hn-bcp-modal .hn-bcp-box{height:100%;border-radius:0}}';
(document.head || document.documentElement).appendChild(style);
// Capture phase, so the price click is handled before the card's link or Lofty's own click handler.
document.addEventListener('click', onClick, true);
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
scan();
// Listing cards load and change as visitors search, filter and page, so rescan (throttled) when the page changes.
var timer = null;
new MutationObserver(function () {
if (timer) return;
timer = setTimeout(function () { timer = null; scan(); }, 400);
}).observe(document.body, { childList: true, subtree: true, characterData: true });
}
// Run once, even if the loader is pasted both site-wide and on a page.
if (window.hnBuyerCostLoaded) return;
window.hnBuyerCostLoaded = true;
// Only on Residential listing pages (e.g. /abbotsford-listings) and Presales/New pages; never on Commercial, Sold or a single listing.
var path = location.pathname.toLowerCase();
if (!/listing|pre-?sale|new-?(home|build|construction|development)/.test(path) || /commercial|sold|detail/.test(path)) return;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
})();

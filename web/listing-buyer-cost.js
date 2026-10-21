// Buyer Cost button on listing cards. Served from GitHub Pages (nbakhoum84.github.io/mytest/listing-buyer-cost.js) and loaded by the short
// loader in site-snippet/listing-price-buyer-cost.js, either per page or once site-wide (it then only acts on Residential, Presales/New and Commercial pages).
// Every listing card gets a "Buyer cost" button next to its price. Clicking the button (or the price) opens the Buyer Cost
// calculator in a popup, prefilled with that price; the card's own link still works everywhere else on the card.
// Presale / new-build cards (or a page whose address mentions presale/new) also tick "New build: add 5% GST".
(function () {
var path = typeof location === 'undefined' ? '' : location.pathname.toLowerCase();
// Commercial pages open the Commercial Buyer Cost app (BC commercial rules); everything else the residential one.
// Commercial city pages have plain addresses (e.g. /abbotsford), so their loader sets window.hnBuyerCostMode = 'commercial'.
var COMMERCIAL = (typeof window !== 'undefined' && window.hnBuyerCostMode === 'commercial') || /commercial/.test(path);
var APP = 'https://nbakhoum84.github.io/mytest/' + (COMMERCIAL ? 'commercial-cost/' : 'my-home-cost/');
var MORTGAGE_APP = 'https://nbakhoum84.github.io/mytest/mortgage-calculator/';
var DETAIL = /^\/listing-detail\//.test(path);
// Longest names first, so "South Surrey" wins over "Surrey" and "North Vancouver" over "Vancouver".
var CITIES = ['North Vancouver', 'West Vancouver', 'New Westminster', 'Port Coquitlam', 'Pitt Meadows', 'South Surrey', 'Maple Ridge', 'Port Moody',
'White Rock', 'Abbotsford', 'Chilliwack', 'Coquitlam', 'Vancouver', 'Burnaby', 'Richmond', 'Langley', 'Mission', 'Surrey', 'Delta'];
var NEW_PAGE = /pre-?sale|new-?(home|build|construction|development|listing)|\/new(\/|$|\?|-)/i;
var NEW_CARD = /pre-?sale|new construction|new development|est(\.|imated)? completion|completion date|move-in ready|developer/i;
// "$1,299,000", "From $599,900", "Starting at $1.2M", "C$849,000+", "$599,900 - $1,200,000" (uses the lowest).
var PRICE = /^(?:(?:list(?:ed)?\s*price|asking(?:\s*price)?|price|priced\s*from|starting\s*(?:from|at)|from)\s*:?\s*)?(?:CAD\s*|CA?)?\$\s*(\d[\d,]*(?:\.\d+)?)\s*([KkMm])?\s*\+?\s*(?:CAD)?(?:\s*[-–]\s*(?:CAD\s*|CA?)?\$\s*(\d[\d,]*(?:\.\d+)?)\s*([KkMm])?\s*\+?)?$/i;
// The pasted-in calculators (Buyer Cost, Seller Cost, Mortgage, First Home Savings, Presale Deposits) show their own $ totals; those aren't listing prices.
var SKIP = 'header,nav,footer,form,select,option,button,input,textarea,label,script,style,#hn-bcp-modal,#mh-app,#sc-app,#mc-app,#fh-app,#pd-app,' +
'.gm-style,.mapboxgl-map,.leaflet-container,[class*="marker" i],[class*="cluster" i],[class*="filter" i],[class*="dropdown" i],[class*="slider" i]';

// Every price shown: one, or the low and high ends of a range like "$900K - $1.1M".
function parsePrices(text) {
var m = PRICE.exec(String(text || '').replace(/\s+/g, ' ').trim());
if (!m) return [];
function amount(num, unit) {
var n = parseFloat(num.replace(/,/g, ''));
if (unit) n *= /m/i.test(unit) ? 1e6 : 1e3;
n = Math.round(n);
return n >= 50000 && n <= 100000000 ? n : 0;
}
var low = amount(m[1], m[2]), high = m[3] ? amount(m[3], m[4]) : 0;
if (!low) return [];
return high > low ? [low, high] : [low];
}
function parsePrice(text) { return parsePrices(text)[0] || 0; }
if (typeof document === 'undefined') { if (typeof module !== 'undefined') module.exports = { parsePrice: parsePrice, parsePrices: parsePrices }; return; }

// The listing card: the nearest ancestor (up to 8 levels) that also holds a photo, or, for a card with no photo
// (e.g. a dark placeholder with an icon), the ancestor that sits next to look-alike cards that do have photos.
var PHOTO = 'img,picture,[style*="background-image"]';
function cardOf(el) {
// A single listing's page has one price, so the whole page is its "card".
if (DETAIL) return document.body;
for (var a = el.parentElement, i = 0; a && a !== document.body && i < 8; a = a.parentElement, i++) {
if (a.querySelector(PHOTO)) return a;
var sibs = a.className && a.parentElement ? a.parentElement.children : [];
for (var k = 0; k < sibs.length; k++) {
if (sibs[k] !== a && sibs[k].tagName === a.tagName && sibs[k].className === a.className && sibs[k].querySelector(PHOTO)) return a;
}
}
return null;
}

function mark(el, price) {
el.classList.add('hn-bcp');
el.setAttribute('data-hn-price', price);
addButton(el, price);
}

// One "Buyer cost" button per card, on its own line right below the price. Re-added if the site redraws the card.
function addButton(el, price) {
var card = cardOf(el);
if (!card) return;
var oldRow = card.querySelector('.hn-bcp-row');
if (oldRow) {
var olds = oldRow.querySelectorAll('.hn-bcp-btn');
for (var o = 0; o < olds.length; o++) {
olds[o].setAttribute('data-hn-price', price);
olds[o].setAttribute('aria-label', (olds[o].getAttribute('data-hn-kind') === 'mortgage' ? 'Mortgage calculator for $' : 'Buyer cost for $') + price.toLocaleString('en-CA'));
}
return;
}
// "Buyer cost" and "Mortgage" sit side by side in one row (Mortgage not on Commercial pages); the mortgage calculator starts from the same price.
var b = document.createElement('div');
b.className = 'hn-bcp-row';
b.innerHTML = '<button type="button" class="hn-bcp-btn" data-hn-kind="buyer" data-hn-price="' + price + '" aria-label="Buyer cost for $' + price.toLocaleString('en-CA') + '">Buyer cost</button>' +
(COMMERCIAL ? '' : '<button type="button" class="hn-bcp-btn hn-bcp-mtg" data-hn-kind="mortgage" data-hn-price="' + price + '" aria-label="Mortgage calculator for $' + price.toLocaleString('en-CA') + '">Mortgage</button>');
// After the whole line the price sits on (e.g. price + open house tag), so it lands just below it.
var line = el;
while (line.parentElement && line.parentElement !== card && /^inline/.test(getComputedStyle(line).display)) line = line.parentElement;
line.insertAdjacentElement('afterend', b);
// If the price's row lays things out side by side, keep stepping out until the button is below the price.
var pr = el.getBoundingClientRect();
while (b.getBoundingClientRect().top < pr.bottom - 1 && line.parentElement && line.parentElement !== card) {
line = line.parentElement;
line.insertAdjacentElement('afterend', b);
}
// Line it up with the price's left edge.
var r = document.createRange();
r.selectNodeContents(el);
var dx = Math.round(r.getBoundingClientRect().left - b.getBoundingClientRect().left);
if (dx > 0) b.style.setProperty('margin-left', dx + 'px', 'important');
}

// A single listing's page can draw the "$" with CSS, leaving only "799,900" in the text; read that as a price there.
var BARE = /^\s*\d{1,3}(,\d{3})+\s*$/;
function priceText(el) {
var t = el.textContent;
return DETAIL && BARE.test(t) ? '$' + t : t;
}
// Largest text size inside an element (the wrapper may be small while the digits inside are big).
function fontOf(el) {
var max = parseFloat(getComputedStyle(el).fontSize) || 0, kids = el.querySelectorAll('*');
for (var k = 0; k < kids.length && k < 20; k++) max = Math.max(max, parseFloat(getComputedStyle(kids[k]).fontSize) || 0);
return max;
}

// Nader asked to drop the Ratehub mortgage payment calculator from single listing pages.
// Hide its frame, and the wrapper around it as long as the wrapper holds nothing else but Ratehub's title.
function hideRatehub() {
var frames = document.querySelectorAll('iframe[src*="ratehub"]');
for (var i = 0; i < frames.length; i++) {
var box = frames[i];
while (box.parentElement && box.parentElement !== document.body) {
var kids = box.parentElement.children, only = true;
for (var k = 0; k < kids.length; k++) {
var t = kids[k] === box ? '' : kids[k].textContent.trim();
if (t && !(/ratehub/i.test(t) && t.length < 120)) { only = false; break; }
}
if (!only) break;
box = box.parentElement;
}
if (box.style.display !== 'none') box.style.setProperty('display', 'none', 'important');
}
}

function scan() {
if (!active) return;
if (!document.body) return;
if (DETAIL) hideRatehub();
var done = document.querySelectorAll('.hn-bcp');
// The site reuses card elements when results are sorted, filtered or paged, so re-read each price from its current text.
for (var d = 0; d < done.length; d++) {
var fresh = parsePrice(priceText(done[d]));
if (fresh) { done[d].setAttribute('data-hn-price', fresh); addButton(done[d], fresh); continue; }
var dc = cardOf(done[d]);
done[d].classList.remove('hn-bcp');
done[d].removeAttribute('data-hn-price');
var dr = dc && dc.querySelector('.hn-bcp-row');
if (dr && !dc.querySelector('.hn-bcp')) dr.remove();
}
var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
acceptNode: function (n) { return n.nodeValue.indexOf('$') >= 0 || (DETAIL && BARE.test(n.nodeValue)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
});
var n, top = null, topSize = 0;
while ((n = walker.nextNode())) {
var el = n.parentElement;
if (!el || el.closest('.hn-bcp') || el.closest(SKIP)) continue;
// Climb while the text still reads as a single price, so "$" and "1,299,000" split across spans count as one.
var best = parsePrice(priceText(el)) ? el : null;
for (var a = el.parentElement, i = 0; a && i < 3; a = a.parentElement, i++) {
if (a.textContent.length > 60 || !parsePrice(priceText(a)) || a.querySelector('img,picture,[style*="background-image"]')) break;
best = a;
}
if (!best || !cardOf(best)) continue;
// On a single listing's page only the big headline price gets the buttons (not similar listings, payments or offers).
if (DETAIL) {
var size = fontOf(best);
if (size >= 24 && size > topSize) { top = best; topSize = size; }
continue;
}
mark(best, parsePrice(priceText(best)));
}
if (top && !document.querySelector('.hn-bcp')) mark(top, parsePrice(priceText(top)));
}

// For troubleshooting on the live site: type hnBuyerCostDebug() in the browser console to see every price it found and why it was used or skipped.
window.hnBuyerCostDebug = function () {
var out = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n;
while ((n = w.nextNode())) {
var t = n.nodeValue.trim();
if (!/\d{1,3}(,\d{3})+/.test(t) || !n.parentElement) continue;
var el = n.parentElement, skip = el.closest(SKIP);
out.push(t.slice(0, 40) + ' | size ' + fontOf(el) + ' | ' + (skip ? 'skipped by <' + skip.tagName.toLowerCase() + ' class="' + skip.className + '">' :
parsePrice(priceText(el)) || parsePrice(priceText(el.parentElement)) ? 'price' : 'not a price: "' + el.parentElement.textContent.trim().slice(0, 60) + '"'));
}
return { path: path, detail: DETAIL, listingPage: LISTING_PAGE, active: active, found: out.slice(0, 30) };
};

function isNew(el) {
if (COMMERCIAL) return false;
if (NEW_PAGE.test(location.pathname + location.search)) return true;
if (DETAIL) return false;
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
'<div class="hn-bcp-bar"><b class="hn-bcp-title">Buyer Cost</b><span class="hn-bcp-alts"></span>' +
'<a class="hn-bcp-open" target="_blank" rel="noopener">Open in new tab</a>' +
'<button type="button" class="hn-bcp-x" aria-label="Close">&times;</button></div>' +
'<iframe title="Buyer Cost calculator"></iframe></div>';
document.body.appendChild(m);
m.addEventListener('click', function (e) {
if (e.target === m || e.target.closest('.hn-bcp-x')) close();
// A price range: switch the calculator between the low and high price.
var alt = e.target.closest('.hn-bcp-alt');
if (alt && current) openCalc(+alt.getAttribute('data-hn-price'), current.isNewBuild, current.mortgage, current.prices);
});
return m;
}
function close() {
var m = document.getElementById('hn-bcp-modal');
if (!m) return;
m.classList.remove('hn-bcp-on');
m.querySelector('iframe').src = 'about:blank';
document.documentElement.style.overflow = '';
}
// City from the listing page address, e.g. /south-surrey-listings -> "South Surrey" (empty on pages without one, like /new-homes-under-construction).
function cityOf() {
// A single listing, e.g. /listing-detail/1189480162/1342-JOHNSTON-RD-804-White-Rock-BC -> "White Rock".
if (DETAIL) {
var slug = decodeURIComponent(path.replace(/\/$/, '').split('/').pop() || '').replace(/-bc$/, '');
for (var c = 0; c < CITIES.length; c++) if (new RegExp('-' + CITIES[c].toLowerCase().replace(/ /g, '-') + '$').test(slug)) return CITIES[c];
return '';
}
var m = /^\/(?:presales?-)?([a-z-]+?)(?:-(?:sold-)?listings?|-presales?)?\/?$/.exec(path);
if (!m || /^(new|foreclosures?|commercial|residential)/.test(m[1])) return '';
return m[1].split('-').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
}
// Latest Total cost shown in the Buyer Cost popup (it reports every change), so Mortgage starts from what the visitor ticked there.
var lastTotal = null;
window.addEventListener('message', function (e) {
var d = e.data, m = document.getElementById('hn-bcp-modal'), f = m && m.querySelector('iframe');
if (d && d.hnBuyerCost && f && e.source === f.contentWindow && d.price > 0 && d.total > 0) lastTotal = { price: d.price, total: d.total };
});
var current = null;
function openCalc(price, isNewBuild, mortgage, prices) {
current = { isNewBuild: isNewBuild, mortgage: mortgage, prices: prices || [price] };
var city = mortgage ? cityOf() : '';
var total = mortgage && lastTotal && lastTotal.price === price ? lastTotal.total : 0;
var url = (mortgage ? MORTGAGE_APP : APP) + '?price=' + price + (isNewBuild ? '&new=1' : '') + (total ? '&total=' + total : '') + (city ? '&city=' + encodeURIComponent(city) : '') + '&v=' + Math.floor(Date.now() / 6e4);
var m = modal();
m.querySelector('.hn-bcp-title').textContent = mortgage ? 'Mortgage for $' + price.toLocaleString('en-CA') + (city ? ' in ' + city : '') :
(COMMERCIAL ? 'Commercial Buyer Cost for $' : 'Buyer Cost for $') + price.toLocaleString('en-CA');
var alts = current.prices.length > 1 ? current.prices : [];
if (alts.length) m.querySelector('.hn-bcp-title').textContent = mortgage ? 'Mortgage' + (city ? ' in ' + city : '') + ' for' : (COMMERCIAL ? 'Commercial Buyer Cost for' : 'Buyer Cost for');
m.querySelector('.hn-bcp-alts').innerHTML = alts.map(function (p) {
return '<button type="button" class="hn-bcp-alt' + (p === price ? ' hn-bcp-alt-on' : '') + '" data-hn-price="' + p + '">$' + p.toLocaleString('en-CA') + '</button>';
}).join('');
m.querySelector('.hn-bcp-open').href = url;
m.querySelector('iframe').src = url;
m.classList.add('hn-bcp-on');
document.documentElement.style.overflow = 'hidden';
m.querySelector('.hn-bcp-x').focus();
}

function onClick(e) {
var el = e.target && e.target.closest && e.target.closest('.hn-bcp,.hn-bcp-btn');
if (!el) return;
// Use the price the card shows right now, not the one stored when the button was added.
var card = cardOf(el.classList.contains('hn-bcp') ? el : el.parentElement);
var shown = card && card.querySelector('.hn-bcp');
var prices = shown ? parsePrices(priceText(shown)) : [];
var price = prices[0] || +el.getAttribute('data-hn-price');
if (!price) return;
// Stop the card's own link (to the listing page) only for clicks on the price or the button.
e.preventDefault();
e.stopPropagation();
if (e.stopImmediatePropagation) e.stopImmediatePropagation();
openCalc(price, isNew(el), el.getAttribute('data-hn-kind') === 'mortgage', prices.length ? prices : [price]);
}

var started = false;
function start() {
if (started) { scan(); return; }
started = true;
var style = document.createElement('style');
style.textContent =
'.hn-bcp{cursor:pointer!important}' +
'.hn-bcp-row{display:flex!important;flex-wrap:wrap;gap:8px;margin:8px 0 6px!important}' +
'button.hn-bcp-btn{position:relative!important;top:auto!important;left:auto!important;z-index:2!important;display:flex!important;align-items:center!important;gap:7px!important;width:max-content!important;max-width:100%!important;height:auto!important;min-height:0!important;margin:0!important;padding:6px 12px!important;border:0!important;border-radius:8px!important;background:#dbae77!important;box-shadow:none!important;color:#111!important;font-family:inherit!important;font-weight:700!important;font-size:14px!important;line-height:1.2!important;letter-spacing:0!important;text-transform:none!important;cursor:pointer!important;white-space:nowrap!important;opacity:1!important}' +
'.hn-bcp-btn::before{content:"";width:16px;height:16px;flex:none;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v4h10V4H7zm1 7v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zm-8 4v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v6h2v-6h-2zm-8 4v2h2v-2H8zm4 0v2h2v-2h-2z%27/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v4h10V4H7zm1 7v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zm-8 4v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v6h2v-6h-2zm-8 4v2h2v-2H8zm4 0v2h2v-2h-2z%27/%3E%3C/svg%3E") center/contain no-repeat}' +
'button.hn-bcp-btn:hover{background:#c99a60!important}' +
'#hn-bcp-modal{display:none;position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);align-items:center;justify-content:center;padding:16px}' +
'#hn-bcp-modal.hn-bcp-on{display:flex}' +
'#hn-bcp-modal .hn-bcp-box{width:600px;max-width:100%;height:min(820px,100%);background:#fff;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.35)}' +
'#hn-bcp-modal .hn-bcp-bar{display:flex;align-items:center;gap:12px;padding:10px 12px 10px 18px;border-bottom:1px solid #e6e2d9;background:#f4f2ee;color:#111;font-family:inherit;font-size:15px;line-height:1.3}' +
'#hn-bcp-modal .hn-bcp-bar{flex-wrap:wrap}' +
'#hn-bcp-modal .hn-bcp-title{font-weight:600}' +
'#hn-bcp-modal .hn-bcp-alts{flex:1;display:flex;flex-wrap:wrap;gap:6px}' +
'#hn-bcp-modal .hn-bcp-alt{border:1px solid #dbae77;border-radius:8px;padding:4px 10px;background:#fff;color:#111;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer}' +
'#hn-bcp-modal .hn-bcp-alt-on{background:#dbae77}' +
'#hn-bcp-modal .hn-bcp-open{color:#8a6a35;font-size:13px;text-decoration:underline}' +
'#hn-bcp-modal .hn-bcp-x{border:0;background:none;font-size:28px;line-height:1;padding:0 6px;cursor:pointer;color:#111}' +
'#hn-bcp-modal iframe{flex:1;width:100%;border:0;background:#fff}' +
'@media(max-width:640px){#hn-bcp-modal{padding:0}#hn-bcp-modal .hn-bcp-box{height:100%;border-radius:0}}';
(document.head || document.documentElement).appendChild(style);
// Capture phase, so the price click is handled before the card's link or Lofty's own click handler.
document.addEventListener('click', onClick, true);
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
// Listing cards load and change as visitors search, filter and page, so rescan (throttled) when the page changes.
// Our own buttons coming and going are ignored, so adding them never triggers another round.
var timer = null;
function ours(n) { return n.nodeType === 1 && (n.classList.contains('hn-bcp-row') || n.id === 'hn-bcp-modal'); }
new MutationObserver(function (list) {
if (timer) return;
for (var i = 0; i < list.length; i++) {
var nodes = [].slice.call(list[i].addedNodes).concat([].slice.call(list[i].removedNodes));
if (!nodes.length || nodes.some(function (n) { return !ours(n); })) {
timer = setTimeout(function () { timer = null; scan(); }, 500);
return;
}
}
}).observe(document.body, { childList: true, subtree: true, characterData: true });
scan();
}
// Commercial city pages (e.g. /abbotsford) have no telltale address, but the site highlights the section
// you are in ("Commercial" shows bold in the top menu). True when Commercial is the one highlighted section.
function inCommercialSection() {
var hot = function (el) {
for (var a = el, i = 0; a && i < 3; a = a.parentElement, i++) {
if (/(^|[\s_-])(active|current|cur|selected|on)([\s_-]|$)/i.test(a.className || '') || a.getAttribute('aria-current')) return true;
}
return +getComputedStyle(el).fontWeight >= 600;
};
var found = {};
var els = document.querySelectorAll('header a, header span, header li, nav a, nav span, nav li, [class*="nav" i] a, [class*="menu" i] a');
for (var i = 0; i < els.length; i++) {
var t = els[i].textContent.replace(/\s+/g, ' ').trim().toLowerCase();
if (t === 'commercial' || t === 'residential' || t === 'presales/new') found[t] = found[t] || hot(els[i]);
}
return !!found.commercial && !found.residential && !found['presales/new'];
}
// Wait until the page has fully loaded and the site has finished drawing it before touching anything;
// changing the cards while the site is still building them made the page flicker.
function later() {
setTimeout(function () {
if (!LISTING_PAGE) {
if (!inCommercialSection()) return;
COMMERCIAL = true;
APP = 'https://nbakhoum84.github.io/mytest/commercial-cost/';
}
active = true;
start();
}, 300);
}
// Run once, even if the loader is pasted both site-wide and on a page.
if (window.hnBuyerCostLoaded) return;
window.hnBuyerCostLoaded = true;
// Only on Residential listing pages (e.g. /abbotsford-listings), Presales/New pages and Commercial pages; never on Sold or a single listing.
// (The commercial loader sets its mode before either copy of this file runs, so whichever copy runs first picks it up.)
// Any other page (e.g. a commercial city page like /abbotsford) is checked for the Commercial menu highlight once loaded.
// A single listing's page (/listing-detail/...) gets the buttons under its headline price.
var LISTING_PAGE = false, active = false;
function route() {
active = false;
path = location.pathname.toLowerCase();
DETAIL = /^\/listing-detail\//.test(path);
COMMERCIAL = window.hnBuyerCostMode === 'commercial' || /commercial/.test(path);
APP = 'https://nbakhoum84.github.io/mytest/' + (COMMERCIAL ? 'commercial-cost/' : 'my-home-cost/');
if (/sold/.test(path) || (/detail/.test(path) && !DETAIL)) return false;
LISTING_PAGE = DETAIL || COMMERCIAL || /listing|pre-?sale|new-?(home|build|construction|development)/.test(path);
return true;
}
if (route()) {
if (document.readyState === 'complete') later();
else window.addEventListener('load', later);
}
// The site opens a listing (and goes back to results) without reloading the page, so follow address changes too.
var lastUrl = location.href;
setInterval(function () {
if (location.href === lastUrl) return;
lastUrl = location.href;
// Start fresh: results the site keeps in the background would otherwise count as this page's buttons.
[].forEach.call(document.querySelectorAll('.hn-bcp-row'), function (r) { r.remove(); });
[].forEach.call(document.querySelectorAll('.hn-bcp'), function (x) { x.classList.remove('hn-bcp'); x.removeAttribute('data-hn-price'); });
if (route()) later();
}, 1000);
})();

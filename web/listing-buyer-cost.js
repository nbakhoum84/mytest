// Buyer Cost button on listing cards. Served from GitHub Pages (nbakhoum84.github.io/mytest/listing-buyer-cost.js) and loaded by the short
// loader in site-snippet/listing-price-buyer-cost.js, either per page or once site-wide (it then only acts on Residential, Presales/New and Commercial pages).
// Every listing card gets a "Buyer cost" button next to its price. Clicking the button (or the price) opens the Buyer Cost
// calculator in a popup, prefilled with that price; the card's own link still works everywhere else on the card.
// Presale / new-build cards (or a page whose address mentions presale/new) also tick "New build: add 5% GST".
(function () {
// Test switch: home-nader.com/?hnoff=1 loads the page with none of our code (buttons, chat greeting, hover lock, ...), to check whether
// something on the site is Lofty's own. ?hnoff=0 turns it back on. Remembered for the browser tab only.
try {
var off = /[?&]hnoff=([01])/.exec(location.search);
if (off) sessionStorage.setItem('hnOff', off[1]);
if (sessionStorage.getItem('hnOff') === '1') { console.log('home-nader scripts are off (?hnoff=0 turns them on)'); return; }
} catch (e) {}
// The virtual assistant chat's greeting line (web/chat-welcome.js) rides along on every page.
// Phones held upright: the language selector and the AI chat bubble are moved below the home page's search field
// (web/lang-selector-position.js, web/chat-bubble-position.js; leaves the rest of the chat alone). Both scripts load at any width and decide
// for themselves from the current size, so turning the phone sideways (or back) switches them off (or on) without reloading the page.
if (typeof document !== 'undefined' && !window.hnLangPosLoading) {
window.hnLangPosLoading = true;
var lp = document.createElement('script');
lp.src = 'https://nbakhoum84.github.io/mytest/lang-selector-position.js?v=' + Math.floor(Date.now() / 6e4);
lp.async = true;
document.head.appendChild(lp);
}
if (typeof document !== 'undefined' && !window.hnBubblePosLoading) {
window.hnBubblePosLoading = true;
var bp = document.createElement('script');
bp.src = 'https://nbakhoum84.github.io/mytest/chat-bubble-position.js?v=' + Math.floor(Date.now() / 6e4);
bp.async = true;
document.head.appendChild(bp);
}
// Phones held upright, home page: the titles and the search bar sit 56px higher, so the chat bubble parked under the search field has room
// above the bottom of the screen. Done here in CSS (this loader runs first) so the move is already there when the bubble is placed.
if (typeof document !== 'undefined' && !document.getElementById('hn-hero-up')) {
var hu = document.createElement('style');
hu.id = 'hn-hero-up';
hu.textContent = '@media(max-width:700px) and (orientation:portrait){body.home .md-hero .media-content-search-group{position:relative!important;top:-56px!important}}';
(document.head || document.documentElement).appendChild(hu);
}
// Laptops and other wide screens, home page: move the titles and the search bar up just enough that the whole search bar is on screen
// when the site opens, the titles above it moving with it (Nader 2026-10-24), never up under the site's header. Re-fitted on resize and clicks.
if (typeof document !== 'undefined' && !window.hnHeroFit) {
window.hnHeroFit = function () {
var g = document.querySelector('body.home .md-hero .media-content-search-group');
if (!g || window.matchMedia('(max-width:700px) and (orientation:portrait)').matches) { if (g) { g.style.removeProperty('position'); g.style.removeProperty('top'); } return; }
g.style.removeProperty('top');
var r = g.getBoundingClientRect(), y = window.pageYOffset || 0;
var head = document.querySelector('header, .md-header');
var headBottom = head ? head.getBoundingClientRect().bottom + y : 0;
var up = Math.max(0, Math.min(r.bottom + y + 16 - window.innerHeight, r.top + y - headBottom - 16));
if (up > 0) { g.style.setProperty('position', 'relative', 'important'); g.style.setProperty('top', -Math.round(up) + 'px', 'important'); }
};
[0, 400, 1200, 3000].forEach(function (t) { setTimeout(window.hnHeroFit, t); });
window.addEventListener('load', window.hnHeroFit);
window.addEventListener('resize', window.hnHeroFit);
// After a click (e.g. Accept All Cookies closes the banner), fit again.
document.addEventListener('click', function () { setTimeout(window.hnHeroFit, 400); }, true);
}
// Every page (Nader 2026-10-25; was the home page only), every screen size (phones too): the top bar of the header (phone, e-mail and the social icons) slides up out of sight
// while the page is scrolling, up or down, and slides back as soon as scrolling stops (Nader 2026-10-25). The pinned header moves up
// by the bar's height, so the menu below the bar stays at the top of the window.
if (typeof document !== 'undefined' && !window.hnTopBarScroll) {
window.hnTopBarScroll = true;
// Phones and narrow windows (up to 1024px): the site's own CSS hides the bar and pins the header at 86px once the page is scrolled
// (.header-container.cc). Keep the bar there (header 86px + the bar's 36px) so it can slide away and back like on wide screens.
var tbKeep = document.createElement('style');
tbKeep.id = 'hn-topbar-keep';
tbKeep.textContent = '@media(max-width:1024px){.header-container.cc.hn-tb-keep{height:122px!important}' +
'.header-container.cc.hn-tb-keep .social-container{display:flex!important}}';
(document.head || document.documentElement).appendChild(tbKeep);
var tbParts = function () {
if (!document.body) return null;
var head = document.querySelector('.md-header') || document.querySelector('header');
if (!head) return null;
var hc = head.querySelector('.header-container');
if (hc && !hc.classList.contains('hn-tb-keep')) hc.classList.add('hn-tb-keep');
// The bar is the row holding the e-mail address, as wide as it gets without taking in the menu.
var w = document.createTreeWalker(head, NodeFilter.SHOW_TEXT, null), n, bar = null;
while ((n = w.nextNode())) if (/info@home-nader\.com/i.test(n.nodeValue) && n.parentElement.getClientRects().length) { bar = n.parentElement; break; }
if (!bar) return null;
while (bar.parentElement && bar.parentElement !== head && !/calculators/i.test(bar.parentElement.textContent)) bar = bar.parentElement;
if (/calculators/i.test(bar.textContent)) return null;
// The pinned box can be inside the header (Lofty pins div.header-container, the header itself scrolls away) or around it.
for (var el = bar.parentElement; el && el !== document.body; el = el.parentElement) {
var pos = getComputedStyle(el).position;
if (pos === 'fixed' || pos === 'sticky') return { bar: bar, pinned: el };
}
return null;
};
var tbMoved = null, tbH = 0, tbStop = 0;
var tbBack = function () {
// Scrolling has stopped: slide the bar back down.
if (!tbMoved) return;
tbMoved.style.setProperty('transition', 'transform 1s ease', 'important');
tbMoved.style.removeProperty('transform');
};
var tbFit = function (e) {
var p = tbParts();
if (tbMoved && (!p || p.pinned !== tbMoved)) { tbMoved.style.removeProperty('transform'); tbMoved.style.removeProperty('transition'); tbMoved = null; }
if (!p) return;
var y = Math.max(0, window.pageYOffset || 0);
if (!tbMoved || !p.pinned.style.transform) {
// Measure the bar with the header in its normal place; only slide when the bar is the top of the pinned header.
if (Math.abs(p.bar.getBoundingClientRect().top - p.pinned.getBoundingClientRect().top) > 2) return;
tbH = Math.round(p.bar.getBoundingClientRect().height);
}
tbMoved = p.pinned;
// While the page scrolls (up or down) the bar goes up out of sight; it comes back 1s after scrolling stops; both slides take 1s (Nader).
clearTimeout(tbStop);
// Phones (touch screens, Nader 2026-10-26): the bar (phone, e-mail) stays visible all the time, no slide. Laptops always slide, whatever the zoom.
if (!e || e.type !== 'scroll' || window.matchMedia('(hover:none) and (pointer:coarse)').matches) { tbBack(); return; }
var up = y > 0 ? tbH : 0;
p.pinned.style.setProperty('transition', 'transform 1s ease', 'important');
if (up > 0) p.pinned.style.setProperty('transform', 'translateY(' + -up + 'px)', 'important');
else p.pinned.style.removeProperty('transform');
tbStop = setTimeout(tbBack, 1000);
};
window.addEventListener('scroll', tbFit, { passive: true });
window.addEventListener('resize', tbFit);
}
// Hide the fixed bottom bar with the "Call Nader" and "Value My Home" buttons on every screen size (Nader 2026-10-24: it still
// showed on narrow laptop windows, which were wider than the old 700px limit). Found by its two buttons' text.
if (typeof document !== 'undefined' && !document.getElementById('hn-hide-bar')) {
var hb = document.createElement('style');
hb.id = 'hn-hide-bar';
hb.textContent = '.hn-hide-bar{display:none!important}';
(document.head || document.documentElement).appendChild(hb);
var hbQueued = false;
var hideBar = function () {
hbQueued = false;
var els = document.querySelectorAll('a,button,[role="button"]'), call = null, value = null;
for (var i = 0; i < els.length; i++) {
var t = els[i].textContent.replace(/\s+/g, ' ').trim();
if (/^call nader$/i.test(t)) call = call || els[i];
else if (/^value my home$/i.test(t)) value = value || els[i];
}
if (!call || !value) return;
// Only the bar itself: the lowest element holding both buttons. If that bar is the whole fixed box (nothing else in it, e.g.
// not the language selector), hide the fixed box too; otherwise leave everything else exactly as Lofty drew it.
var bar = call.parentElement;
while (bar && bar !== document.body && !bar.contains(value)) bar = bar.parentElement;
if (!bar || bar === document.body || bar.textContent.replace(/\s+/g, ' ').trim().length > 40) return;
var box = bar;
for (var up = bar.parentElement, n = 0; up && up !== document.body && n < 4; up = up.parentElement, n++) {
if (up.textContent.replace(/\s+/g, ' ').trim().length > 40 || up.querySelector('img,svg,input,select')) break;
box = up;
if (getComputedStyle(up).position === 'fixed') break;
}
box.classList.add('hn-hide-bar');
// ?hndebug=1 on a phone: show on screen which element the bar is (and its parents), so a CSS rule for Lofty's Style box can hide it from the first paint.
if (/[?&]hndebug=1/.test(location.search) && !document.getElementById('hn-bar-debug')) {
var dd = document.createElement('div'), out = [];
for (var e = box, k = 0; e && e !== document.body && k < 4; e = e.parentElement, k++) {
out.push(e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' [' + getComputedStyle(e).position + ']');
}
dd.id = 'hn-bar-debug';
dd.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:2147483647;background:#000;color:#0f0;font:12px/1.4 monospace;padding:8px;white-space:pre-wrap;word-break:break-all';
dd.textContent = 'Bottom bar:\n' + out.join('\n');
document.body.appendChild(dd);
}
};
var hbWatch = function () {
if (!hbQueued) { hbQueued = true; requestAnimationFrame(hideBar); }
};
new MutationObserver(hbWatch).observe(document.documentElement, { childList: true, subtree: true });
hbWatch();
}
// Phones: no "scroll to top" button. It is the round #scrollToTopBtn made by hn.js (nbakhoum84.github.io), which only shows it on screens wider
// than 768px; the site's own CSS styles it, so on small screens it is overridden here. A short touch screen (phone sideways) counts as a phone.
if (typeof document !== 'undefined' && !document.getElementById('hn-no-goto-top')) {
var gt = document.createElement('style');
gt.id = 'hn-no-goto-top';
gt.textContent = '@media(max-width:768px),(max-height:500px) and (pointer:coarse){#scrollToTopBtn{display:none!important}}';
(document.head || document.documentElement).appendChild(gt);
}
// Business profile for search engines and AI search tools (schema.org, Nader 2026-10-25). Same data as
// site-snippet/business-schema.html. Skipped when the page already carries it (pasted block).
if (typeof document !== 'undefined' && !document.getElementById('hn-business-schema') && ![].some.call(document.querySelectorAll('script[type="application/ld+json"]'), function (x) { return /home-nader\.com\/#agent/.test(x.textContent); })) {
var ld = document.createElement('script');
ld.type = 'application/ld+json';
ld.id = 'hn-business-schema';
ld.textContent = JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"RealEstateAgent","@id":"https://home-nader.com/#agent","name":"Nader Bakhoum, PMP, P.Eng. - eXp Realty","alternateName":"home-nader","url":"https://home-nader.com/","logo":"https://cdn.lofty.com/image/fs/400919269340348/website/135866/cmsbuild/2026923_d682dca9df114f5a.jpeg","image":"https://cdn.lofty.com/image/fs/400919269340348/website/135866/cmsbuild/2026923_d682dca9df114f5a.jpeg","description":"Nader Bakhoum is a BC realtor with eXp Realty helping buyers, sellers and investors with homes, condos, presales and commercial properties across Metro Vancouver and the Fraser Valley. Free calculators: Cash to Close, Seller Cost, Mortgage, First Home Savings and Presale Deposit Schedule.","telephone":"+1-604-612-7228","email":"info@home-nader.com","address":{"@type":"PostalAddress","streetAddress":"7565 132 St","addressLocality":"Surrey","addressRegion":"BC","postalCode":"V3W 1K5","addressCountry":"CA"},"areaServed":[{"@type":"City","name":"Abbotsford, BC"},{"@type":"City","name":"Burnaby, BC"},{"@type":"City","name":"Coquitlam, BC"},{"@type":"City","name":"Delta, BC"},{"@type":"City","name":"Langley, BC"},{"@type":"City","name":"New Westminster, BC"},{"@type":"City","name":"Port Coquitlam, BC"},{"@type":"City","name":"Port Moody, BC"},{"@type":"City","name":"Richmond, BC"},{"@type":"City","name":"South Surrey, BC"},{"@type":"City","name":"Surrey, BC"},{"@type":"City","name":"Vancouver, BC"},{"@type":"City","name":"White Rock, BC"}],"parentOrganization":{"@type":"RealEstateAgent","name":"eXp Realty"},"knowsAbout":["Residential real estate","Commercial real estate","Presales and new construction","First-time home buyers","Home valuation","BC property transfer tax"],"makesOffer":[{"@type":"Offer","itemOffered":{"@type":"Service","name":"Free home valuation","url":"https://home-nader.com/home-evaluation"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"Cash to Close calculator","url":"https://home-nader.com/cash-to-close"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"Seller Cost calculator","url":"https://home-nader.com/seller-cost"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"Mortgage calculators","url":"https://home-nader.com/mortgage-calculators"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"Presale Deposit Schedule","url":"https://home-nader.com/presale-deposit-schedule"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"First Home Savings Plan","url":"https://home-nader.com/first-home-savings-plan"}}],"contactPoint":{"@type":"ContactPoint","telephone":"+1-604-612-7228","email":"info@home-nader.com","contactType":"sales","areaServed":"CA-BC","availableLanguage":"English"}},{"@type":"WebSite","@id":"https://home-nader.com/#website","url":"https://home-nader.com/","name":"home-nader","publisher":{"@id":"https://home-nader.com/#agent"}}]});
(document.head || document.documentElement).appendChild(ld);
}
// On every screen, phones included: the chat window opens with the same greeting and answer buttons.
if (typeof document !== 'undefined' && !window.hnChatWelcomeLoading) {
window.hnChatWelcomeLoading = true;
var cw = document.createElement('script');
cw.src = 'https://nbakhoum84.github.io/mytest/chat-welcome.js?v=' + Math.floor(Date.now() / 6e4);
cw.async = true;
document.head.appendChild(cw);
}
// Every page: dark text keeps its colour on hover (web/hover-color-lock.js; Nader, 2026-10-24).
if (typeof document !== 'undefined' && !window.hnHoverLockLoading) {
window.hnHoverLockLoading = true;
var hl = document.createElement('script');
hl.src = 'https://nbakhoum84.github.io/mytest/hover-color-lock.js?v=' + Math.floor(Date.now() / 6e4);
hl.async = true;
document.head.appendChild(hl);
}
// Calculator blocks: Lofty wraps each HTML block in a narrower .mg-container (overflow hidden), so that box is widened (.hn-calc-wide) to match the app cards.
// The "Get the home-nader app" card (website/install-app-block.html, pasted on many Lofty pages): Nader wants it 700px wide everywhere (2026-10-23; was 1300px).
if (typeof document !== 'undefined' && !document.getElementById('hn-app-width')) {
var aw = document.createElement('style');
aw.id = 'hn-app-width';
aw.textContent = '.hn-app{max-width:700px!important}@media(min-width:701px){#hn-bc-card,#hn-sc-card,#hn-mc-card,#hn-fh-card,#hn-pd-card,.hn-app-card-wide{box-sizing:border-box!important;width:700px!important;max-width:100%!important}#mh-app,#sc-app,#fh-app,#pd-app{max-width:700px!important;padding-left:25px!important;padding-right:25px!important}.hn-calc-wide,.mg-container:has(#mh-app,#sc-app,#fh-app,#pd-app){box-sizing:border-box!important;width:700px!important;max-width:100%!important;padding-left:0!important;padding-right:0!important;margin-left:auto!important;margin-right:auto!important}}';
(document.head || document.documentElement).appendChild(aw);
// Other pages have their own "Get the ... app" cards (the calculator page scripts, or blocks built in Lofty): find each by its
// heading and its "Scan with your phone" line, and widen the box holding both. The page scripts add their cards late, so look for a while.
// Runs at once and on every page change for the first 15s, so the new width shows before the page paints the old one.
function fitWidths() {
var hs = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
for (var i = 0; i < hs.length; i++) {
// Nader renamed the Buyer Cost page's titles (the page heading and the calculator's own) to "Cash to Close", matching the listing button (2026-10-22).
if (/^\/(buyer-cost|cash-to-close)\/?$/i.test(location.pathname) && /^\s*buyer cost\s*$/i.test(hs[i].textContent)) hs[i].textContent = 'Cash to Close';
if (!/^\s*get the .{1,40} app\s*$/i.test(hs[i].textContent)) continue;
for (var c = hs[i].parentElement, k = 0; c && c !== document.body && k < 8; c = c.parentElement, k++) {
if (c.closest('.hn-app')) break;
if (/scan with your phone/i.test(c.textContent)) { c.classList.add('hn-app-card-wide'); break; }
}
}
// The Seller Cost and Mortgage page scripts are pasted in Lofty and still set 1300px inline, which the style above can't beat.
var pc = innerWidth > 700 ? document.querySelectorAll('#hn-bc-card,#hn-sc-card,#hn-mc-card,#hn-fh-card,#hn-pd-card') : [];
for (var q = 0; q < pc.length; q++) pc[q].style.setProperty('width', '700px', 'important');
var calcs = document.querySelectorAll('#mh-app,#sc-app,#fh-app,#pd-app');
for (var j = 0; j < calcs.length; j++) { var box = calcs[j].closest('.mg-container'); if (box) box.classList.add('hn-calc-wide'); }
}
if (innerWidth > 700) fitWidths();
if (innerWidth > 700) {
var fitWatch = new MutationObserver(fitWidths);
fitWatch.observe(document.documentElement, { childList: true, subtree: true });
setTimeout(function () { fitWatch.disconnect(); fitWidths(); }, 15000);
}
}
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

// Rough numbers shown on the buttons, with the same defaults the popups open with. Cash to close: 10% down (20% at $1.5M or more),
// CMHC premium under 20% down (its 7% PST is paid in cash at closing), and the Buyer Cost app's default closing costs (BC property
// transfer tax, legal $1,800, inspection $500 on resale, appraisal $400, insurance $1,500, 5% GST on new builds).
// Est./mo: the same settings as the site's own (Lofty) mortgage calculator: 20% down, 4%, 30 years, compounded monthly (Nader, 2026-10-24).
var EST = { rate: 4, years: 30, downPct: 20 };
function ptt(p) {
var band = function (from, to, rate) { return Math.max(0, Math.min(p, to) - from) * rate; };
return band(0, 2e5, 0.01) + band(2e5, 2e6, 0.02) + band(2e6, Infinity, 0.03) + band(3e6, Infinity, 0.02);
}
function estimate(price, isNewBuild) {
var downPct = price >= 1.5e6 ? 20 : 10;
var down = price * downPct / 100, loan = price - down;
var premium = downPct < 20 ? loan * 0.031 : 0;
var closing = ptt(price) + 1800 + (isNewBuild ? 0 : 500) + 400 + 1500 + (isNewBuild ? price * 0.05 : 0);
var r = EST.rate / 1200, n = EST.years * 12, mLoan = price * (1 - EST.downPct / 100);
return { downPct: downPct, cash: down + closing + premium * 0.07, monthly: mLoan * r / (1 - Math.pow(1 + r, -n)) };
}
function short(n) { return n >= 1e6 ? '$' + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M' : '$' + Math.round(n / 1e3) + 'K'; }
function labels(price, isNewBuild) {
if (COMMERCIAL) return { buyer: 'Buyer cost', mortgage: 'Mortgage' };
var e = estimate(price, isNewBuild);
return { buyer: 'Cash to close \u2248 ' + short(e.cash), mortgage: 'Est. $' + Math.round(e.monthly).toLocaleString('en-CA') + '/mo' };
}

// One "Buyer cost" button per card, on its own line right below the price. Re-added if the site redraws the card.
function addButton(el, price) {
var card = cardOf(el);
if (!card) return;
var oldRow = card.querySelector('.hn-bcp-row');
if (oldRow) {
var olds = oldRow.querySelectorAll('.hn-bcp-btn'), lb = labels(price, isNew(el));
for (var o = 0; o < olds.length; o++) {
olds[o].setAttribute('data-hn-price', price);
var want = olds[o].getAttribute('data-hn-kind') === 'mortgage' ? lb.mortgage : lb.buyer;
if (olds[o].textContent !== want) olds[o].textContent = want;
olds[o].setAttribute('aria-label', (olds[o].getAttribute('data-hn-kind') === 'mortgage' ? 'Mortgage calculator for $' : 'Buyer cost for $') + price.toLocaleString('en-CA'));
}
var oldHints = oldRow.querySelectorAll('.hn-bcp-hint');
for (var h = 0; h < oldHints.length; h++) oldHints[h].setAttribute('data-hn-price', price);
return;
}
// "Buyer cost" and "Mortgage" sit side by side in one row (Commercial pages too); the mortgage calculator starts from the same price.
var b = document.createElement('div'), lb = labels(price, isNew(el));
b.className = 'hn-bcp-row';
// Under each button: "Click here for more information" (Nader, 2026-10-24); clicking it opens that button's calculator.
var hint = function (kind) { return '<div class="hn-bcp-hint" data-hn-kind="' + kind + '" data-hn-price="' + price + '"><u>Click here</u> for more information</div>'; };
b.innerHTML = '<div class="hn-bcp-col"><button type="button" class="hn-bcp-btn" data-hn-kind="buyer" data-hn-price="' + price + '" aria-label="Buyer cost for $' + price.toLocaleString('en-CA') + '">' + lb.buyer + '</button>' + hint('buyer') + '</div>' +
'<div class="hn-bcp-col"><button type="button" class="hn-bcp-btn hn-bcp-mtg" data-hn-kind="mortgage" data-hn-price="' + price + '" aria-label="Mortgage calculator for $' + price.toLocaleString('en-CA') + '">' + lb.mortgage + '</button>' + hint('mortgage') + '</div>';
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

// On a single listing's page the site's fixed menu covered the listing's top bar (title, PREV / NEXT).
// Find that bar and move it (or the page under the menu) down to just below the menu.
function fixedTop(el) {
for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
var pos = getComputedStyle(el).position;
if (pos === 'fixed' || pos === 'sticky') return el;
}
return null;
}
function clearHeader() {
var head = fixedTop(document.elementFromPoint(innerWidth / 2, 2));
if (!head || head.offsetWidth < innerWidth * 0.8 || head.closest('#hn-bcp-modal')) return;
var below = Math.round(head.getBoundingClientRect().bottom);
var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n, prev = null;
while ((n = w.nextNode())) if (/^\s*(<|‹)?\s*prev\s*$/i.test(n.nodeValue) && !head.contains(n) && shown(n.parentElement)) { prev = n.parentElement; break; }
// Phones have no PREV / NEXT bar; there the listing's address (e.g. "1526 FINLAY ST" from the page address) is what hides under the menu.
if (!prev) {
var words = (path.split('/')[3] || '').split('-').slice(0, 2);
// Links in Lofty's listing alert e-mails have no street in the address (/listing-detail/1191174657); take it from the page title then,
// e.g. "Homes for sale - 1526 FINLAY ST #410 ...".
if (words.length < 2 || !words[0]) { var tm = /\b(\d+[A-Za-z]?)\s+([A-Za-z0-9]+)/.exec(document.title || ''); words = tm ? [tm[1], tm[2]] : []; }
if (words.length < 2 || !words[0]) return;
var addr = new RegExp('^\\s*' + words.map(function (x) { return x.replace(/[^\w]/g, ''); }).join('\\s+'), 'i');
w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
while ((n = w.nextNode())) if (addr.test(n.nodeValue) && !head.contains(n) && !n.parentElement.closest('title,script,style,#hn-bcp-modal') && shown(n.parentElement)) { prev = n.parentElement; break; }
if (!prev) return;
}
var bar = fixedTop(prev);
if (bar && bar !== head) {
if (parseFloat(getComputedStyle(bar).top) < below) bar.style.setProperty('top', below + 'px', 'important');
return;
}
// Not a sticky bar: push the block holding PREV down if it starts under the menu (again if the menu grows later).
// The site keeps hidden copies of the address and PREV for the other screen size; only the ones on screen count.
// A text span can't be pushed down (margins don't move inline text), so start from the block holding it, e.g. the address heading.
for (bar = prev; bar.parentElement && bar.parentElement !== document.body && (bar.offsetWidth < innerWidth * 0.6 || /^inline/.test(getComputedStyle(bar).display)); bar = bar.parentElement);
var gap = below - (bar.getBoundingClientRect().top + scrollY);
if (gap > 0) { bar.setAttribute('data-hn-clear', ''); bar.style.setProperty('margin-top', (parseFloat(getComputedStyle(bar).marginTop) + gap + 8) + 'px', 'important'); }
}
var clearing = false;
addEventListener('scroll', function () {
if (!DETAIL || !active || clearing) return;
clearing = true;
requestAnimationFrame(function () { clearing = false; clearHeader(); });
}, { passive: true });
// The menu can grow after the page first draws (its logo and fonts load late), so look again for a while and when the window resizes.
var clearTries = 0;
setInterval(function () { if (DETAIL && active && clearTries++ < 30) clearHeader(); }, 500);
addEventListener('resize', function () { if (DETAIL && active) clearHeader(); });

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
if (DETAIL) { hideRatehub(); clearHeader(); }
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
// Phones draw that price smaller, so the size bar is lower there.
if (DETAIL) {
var size = fontOf(best);
// The site keeps a hidden copy of the price for the other screen size; only the one on screen counts.
if (size >= (innerWidth < 768 ? 18 : 24) && size > topSize && shown(best)) { top = best; topSize = size; }
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

// UTM tags for the listing buttons (Nader, 2026-10-24): sent with each click event to GA4 and added to the calculator's address.
function utm(isMortgage, listingType) {
return { utm_source: 'home-nader.com', utm_medium: 'listing_button', utm_campaign: isMortgage ? 'est_monthly' : 'cash_to_close', utm_content: listingType };
}
// Each button click (and each sign-up prompt click) is sent to whatever analytics the site runs: Google Tag Manager / GA4
// (dataLayer, gtag) and the Meta pixel (fbq), so they can be counted as conversions for ad campaigns.
// Nader's live GA4 property (Nader-exp). The site loads it on its own data layer (gtag/js?id=G-N9D71PSLL6&l=customSiteDataLayer),
// which the page's gtag() does not feed, so our events go onto that layer (gtag needs a real arguments object).
function naderExp() {
var l = window.customSiteDataLayer;
if (l && typeof l.push === 'function') { l.push(arguments); return true; }
return false;
}
function track(name, data) {
data.page_path = location.pathname;
data.city = cityOf() || '';
try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, data)); } catch (e) {}
var viaSite = false;
try { viaSite = naderExp('event', name, Object.assign({ send_to: 'G-N9D71PSLL6' }, data)); } catch (e) {}
try { if (typeof window.gtag === 'function') window.gtag('event', name, Object.assign({ send_to: viaSite ? 'G-50BX6YT24D' : ['G-N9D71PSLL6', 'G-50BX6YT24D'] }, data)); } catch (e) {}
try { if (typeof window.fbq === 'function') window.fbq('trackCustom', name, data); } catch (e) {}
}
// The site's own "Register/Sign In" link; it's only there while the visitor isn't signed in.
// On phones it sits in the collapsed menu (hidden), so hidden links count too. Picks the innermost match,
// preferring a real link or button, then one that says Register, then a visible one.
var REG = /^(register|sign\s*in|log\s*in|sign\s*up)(\s*(\/|\||or|&)\s*(register|sign\s*in|log\s*in|sign\s*up))?$/i;
function registerLink() {
var els = document.querySelectorAll('a, button, [role="button"], li, span, div');
var best = null, bestScore = -1;
for (var i = els.length - 1; i >= 0; i--) {
var t = els[i].textContent;
if (t.length > 40) continue;
t = t.replace(/\s+/g, ' ').trim();
// Never a Register/Sign in link inside a listing card: clicking that opens the listing instead of the form.
if (!REG.test(t) || els[i].closest('#hn-bcp-modal, footer, a[href*="/listing-detail/"]')) continue;
var el = els[i].closest('a, button, [role="button"]') || els[i];
var score = (el !== els[i] || /^(A|BUTTON)$/.test(el.tagName) || el.getAttribute('role') === 'button' ? 4 : 0) + (/register/i.test(t) ? 2 : 0) + (el.offsetParent ? 1 : 0);
if (score > bestScore) { best = el; bestScore = score; }
}
return best;
}
// The listing's own "Save" button (single listing page only); saving asks a visitor to register.
function saveButton() {
if (!DETAIL) return null;
var els = document.querySelectorAll('button, a, [role="button"], div, span');
for (var i = 0; i < els.length; i++) {
if (/^\s*save\s*$/i.test(els[i].textContent) && els[i].offsetParent && !els[i].closest('#hn-bcp-modal')) return els[i].closest('button,a,[role="button"]') || els[i];
}
return null;
}
var ctaTimer = null;
// Offer the full breakdown (and saving the listing) for registering as soon as the calculator opens (Nader 2026-10-27; was after 8s).
function showCta(m) {
clearTimeout(ctaTimer);
var cta = m.querySelector('.hn-bcp-cta');
cta.hidden = true;
if (!registerLink()) return;
m.querySelector('.hn-bcp-save').hidden = !saveButton();
cta.hidden = false;
}

function modal() {
var m = document.getElementById('hn-bcp-modal');
if (m) return m;
m = document.createElement('div');
m.id = 'hn-bcp-modal';
m.innerHTML =
'<div class="hn-bcp-box" role="dialog" aria-modal="true" aria-label="Buyer Cost">' +
'<div class="hn-bcp-bar"><b class="hn-bcp-title">Buyer Cost</b><span class="hn-bcp-alts"></span>' +
'<button type="button" class="hn-bcp-x" aria-label="Close">&times;</button></div>' +
'<iframe title="Buyer Cost calculator" allow="clipboard-write"></iframe>' +
'<div class="hn-bcp-fail" hidden>The calculator is taking a while to load. <a class="hn-bcp-fail-open" target="_blank" rel="noopener">Open it in a new tab</a></div>' +
'<div class="hn-bcp-cta" hidden><span>Want the full breakdown for this home?</span>' +
'<button type="button" class="hn-bcp-cta-btn" data-hn-cta="register">Email me the breakdown</button>' +
'<button type="button" class="hn-bcp-cta-btn hn-bcp-save" data-hn-cta="save">Save this listing</button></div></div>';
document.body.appendChild(m);
m.addEventListener('click', function (e) {
if (e.target === m || e.target.closest('.hn-bcp-x')) { closeAndOffer(); return; }
var cta = e.target.closest('[data-hn-cta]');
if (cta && current) {
var kind = cta.getAttribute('data-hn-cta'), target = kind === 'save' ? saveButton() : registerLink();
// UTM tags (Nader 2026-10-26): "Email me the breakdown" / "Save this listing" in the Cash to Close and Mortgage popups count as conversions.
track('hn_calculator_signup_click', { action: kind, calculator: current.mortgage ? 'mortgage' : 'buyer_cost', listing_price: current.price,
button_text: cta.textContent.trim(), utm_source: 'home-nader.com', utm_medium: 'calculator_popup', utm_campaign: current.mortgage ? 'est_monthly' : 'cash_to_close',
utm_content: kind === 'save' ? 'save_listing' : 'email_breakdown' });
close();
if (kind === 'save') { if (target) target.click(); } else openRegistration();
return;
}
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
// Add ?hndebug=1 to a listings page address to see, on screen, what the script finds when a calculator is closed
// (handy on a phone, where there is no console). Nothing is shown without it.
var DEBUG = /[?&]hndebug=1/.test(location.search);
function dbg(msg) {
if (!DEBUG) return;
var d = document.getElementById('hn-bcp-debug');
if (!d) {
d = document.createElement('div');
d.id = 'hn-bcp-debug';
d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;max-height:45%;overflow:auto;z-index:2147483647;background:#000;color:#0f0;font:12px/1.4 monospace;padding:8px;white-space:pre-wrap';
document.body.appendChild(d);
}
d.textContent += msg + '\n';
}
// With ?hndebug=1, script errors on the page show up in the same box.
if (DEBUG) {
window.addEventListener('error', function (e) { dbg('ERROR: ' + e.message + (e.filename ? ' (' + String(e.filename).split('/').pop() + ':' + e.lineno + ')' : '')); });
window.addEventListener('unhandledrejection', function (e) { dbg('ERROR (promise): ' + (e.reason && e.reason.message || e.reason)); });
}
function describe(el) {
if (!el) return 'none';
var r = el.getBoundingClientRect();
return el.tagName + (el.id ? '#' + el.id : '') + '.' + String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).slice(0, 60) + ' text="' + el.textContent.replace(/\s+/g, ' ').trim().slice(0, 30) + '" size=' + Math.round(r.width) + 'x' + Math.round(r.height) + ' shown=' + !!el.offsetParent + (el.href ? ' href=' + el.getAttribute('href') : '');
}
// A real tap (pointer and mouse events, then the click) in case the site listens for those rather than a plain click.
function press(el) {
var o = { bubbles: true, cancelable: true, view: window };
['pointerdown', 'mousedown', 'pointerup', 'mouseup'].forEach(function (t) {
try { el.dispatchEvent(new (/^pointer/.test(t) && window.PointerEvent ? PointerEvent : MouseEvent)(t, o)); } catch (e) {}
});
el.click();
}
// The site's menu button; on phones the Register link can sit inside the collapsed menu.
var MENU = 'button[aria-label*="menu" i],[class*="hamburger" i],[class*="menu-toggle" i],[class*="menu-btn" i],[class*="navbar-toggl" i],[class*="burger" i]';
// Open the site's registration form. If it hasn't appeared a moment later (phones: link hidden in the menu, or only drawn
// once the menu is open), open the menu and try the link again.
function openRegistration() {
var reg = registerLink();
dbg('register link: ' + describe(reg));
// No longer puts back what the site stored after the form is closed (watchRegistration): that made the site forget the visitor had
// already seen its Quick Connection form, so the chat bubble showed the form again instead of the chat buttons (Nader, 2026-10-24).
if (reg) press(reg);
setTimeout(function () {
dbg('form open after 1.2s: ' + !!formBox());
if (formBox()) return;
var menu = document.querySelector(MENU);
dbg('menu button: ' + describe(menu));
if (menu && menu.offsetParent && !(reg && reg.offsetParent)) press(menu);
setTimeout(function () {
var again = registerLink();
dbg('retry link: ' + describe(again) + ' | form open now: ' + !!formBox());
if (again && !formBox()) press(again);
}, 600);
}, 1200);
}
// Opening and dismissing the registration form makes the site remember it ("already asked") in cookies or local storage, so its own
// prompt (on clicking a listing card, after a few listings) then stays away until the cookies are cleared. When the visitor closes the form
// and is still signed out, put back whatever the site stored while the form was open (never anything that looks like a sign-in), so the
// site keeps asking as it normally would.
var AUTHKEY = /token|auth|jwt|login|user|csrf|xsrf|refresh|lead|email|phone/i;
function cookieMap() {
var m = {};
document.cookie.split(';').forEach(function (c) { var i = c.indexOf('='); if (i > 0) m[c.slice(0, i).trim()] = c.slice(i + 1).trim(); });
return m;
}
function storeMap(st) {
var m = {};
try { for (var i = 0; i < st.length; i++) m[st.key(i)] = st.getItem(st.key(i)); } catch (e) {}
return m;
}
function snapshot() { return { c: cookieMap(), l: storeMap(window.localStorage), s: storeMap(window.sessionStorage) }; }
function dropCookie(name) {
var host = location.hostname, parts = host.split('.');
['', 'domain=' + host + ';', 'domain=.' + host + ';', 'domain=.' + parts.slice(-2).join('.') + ';'].forEach(function (d) {
document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;' + d;
});
}
function restoreStored(before) {
var now = snapshot(), undone = [];
function fix(label, was, is, put, drop) {
Object.keys(is).forEach(function (k) {
if (AUTHKEY.test(k) || was[k] === is[k]) return;
try { if (k in was) put(k, was[k]); else drop(k); undone.push(label + ':' + k); } catch (e) {}
});
}
fix('cookie', before.c, now.c, function (k, v) { document.cookie = k + '=' + v + ';path=/'; }, dropCookie);
fix('local', before.l, now.l, function (k, v) { localStorage.setItem(k, v); }, function (k) { localStorage.removeItem(k); });
fix('session', before.s, now.s, function (k, v) { sessionStorage.setItem(k, v); }, function (k) { sessionStorage.removeItem(k); });
dbg('put back what the site remembered about the form: ' + (undone.join(', ') || 'nothing changed'));
}
var regWatch = null;
function watchRegistration(before) {
clearInterval(regWatch);
var seen = false, t0 = Date.now();
regWatch = setInterval(function () {
if (Date.now() - t0 > 180000) { clearInterval(regWatch); return; }
if (formBox()) { seen = true; return; }
if (!seen) return;
clearInterval(regWatch);
// Form closed. Wait a moment: if the visitor registered, the site signs them in and the Register link goes away, so leave everything alone.
setTimeout(function () { if (registerLink() && !formBox()) restoreStored(before); else dbg('form closed, visitor looks signed in: left everything as is'); }, 2500);
}, 400);
}
// When a signed-out visitor closes the calculator, open the site's registration form (every time).
function closeAndOffer() {
var was = current;
close();
var reg = registerLink();
dbg('closed calculator; register link found: ' + (reg ? describe(reg) : 'NO (treated as signed in, no form)'));
if (!reg || !was) return;
track('hn_calculator_signup_prompt', { calculator: was.mortgage ? 'mortgage' : 'buyer_cost', listing_price: was.price });
try { sessionStorage.setItem('hnCalcUsed', '1'); } catch (e) {}
openRegistration();
hideFormClose();
}
// Nader: no close button on the registration form we open. Only hides the form's × (nothing is blocked), and only
// while the form is really on screen, so it can't stop the form from opening.
function shown(el) {
var r = el.getBoundingClientRect();
if (!r.width || !r.height) return false;
for (var x = el; x && x.nodeType === 1; x = x.parentElement) {
var cs = getComputedStyle(x);
if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
}
return true;
}
function formBox() {
var hs = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, span');
for (var i = 0; i < hs.length; i++) {
if (hs[i].children.length || !/^create your free account$/i.test(hs[i].textContent.trim()) || !shown(hs[i])) continue;
for (var el = hs[i].parentElement; el && el !== document.body; el = el.parentElement) {
if (el.querySelector('input')) return { card: el, box: el.parentElement && el.parentElement !== document.body ? el.parentElement : el };
}
}
return null;
}
function hideFormClose() {
var tries = 0;
var t = setInterval(function () {
var f = hideCloseOnce();
if (++tries > 100 || (f && tries > 20)) clearInterval(t);
}, 100);
}
function hideCloseOnce() {
var f = formBox(), box = f && f.box;
if (box) {
var b = f.card.getBoundingClientRect();
[].forEach.call(box.querySelectorAll('*'), function (x) {
if (x.closest('form') || /^(INPUT|LABEL|TEXTAREA|SELECT)$/.test(x.tagName)) return;
var cls = String(x.className && x.className.baseVal !== undefined ? x.className.baseVal : x.className) + ' ' + (x.getAttribute('aria-label') || '') + ' ' + (x.getAttribute('title') || '');
var r = x.getBoundingClientRect(), small = r.width > 0 && r.width < 60 && r.height < 60;
// Never hide anything that holds the form's fields or heading (a wrapper whose class merely contains "close", e.g. "closeable", would hide the whole form).
if (!small || x.contains(f.card.querySelector('input')) || x.querySelector('input,textarea,select,h1,h2,h3,h4,h5,h6')) return;
var corner = Math.abs(r.top - b.top) < 80 && Math.abs(b.right - r.right) < 80;
if (/close/i.test(cls) || /^[\u00d7\u2715\u2716]$/.test(x.textContent.trim()) || (corner && !x.textContent.trim() && x.querySelector && (x.tagName === 'svg' || x.querySelector('svg')))) {
x.style.setProperty('display', 'none', 'important');
}
});
}
return f;
}
// The site also opens the form by itself (e.g. after a few listings); hide its × then too.
setInterval(hideCloseOnce, 700);
// City from the listing page address, e.g. /south-surrey-listings -> "South Surrey" (empty on pages without one, like /new-homes-under-construction).
function cityOf() {
// A single listing, e.g. /listing-detail/1189480162/1342-JOHNSTON-RD-804-White-Rock-BC -> "White Rock".
if (DETAIL) {
var slug = decodeURIComponent(path.replace(/\/$/, '').split('/').pop() || '').replace(/-bc$/, '');
for (var c = 0; c < CITIES.length; c++) if (new RegExp('-' + CITIES[c].toLowerCase().replace(/ /g, '-') + '$').test(slug)) return CITIES[c];
return '';
}
var m = /^\/(?:presales?-)?([a-z-]+?)(?:-(?:sold-)?listings?|-presales?)?\/?$/.exec(path);
if (!m || /^(new|foreclosures?|commercial|residential|listings?$)/.test(m[1])) return '';
return m[1].split('-').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
}
// Latest Total cost shown in the Buyer Cost popup (it reports every change), so Mortgage starts from what the visitor ticked there.
var lastTotal = null;
window.addEventListener('message', function (e) {
var d = e.data, m = document.getElementById('hn-bcp-modal'), f = m && m.querySelector('iframe');
if (d && d.hnBuyerCost && f && e.source === f.contentWindow && d.price > 0 && d.total > 0) lastTotal = { price: d.price, total: d.total };
});
var current = null;
var loadTimer = null;
// The listing's street address, e.g. "2891 MONTROSE AVE #48, Abbotsford", sent to the Mortgage form for its BC Assessment link
// (Nader, 2026-10-25). Cards show it on a line like "2891 MONTROSE AVE #48, Abbotsford, BC V2T 0A1"; a listing page in its heading or title.
var lastAddr = '';
function addressOf(card) {
var text = DETAIL ? Array.prototype.map.call(document.querySelectorAll('h1,h2'), function (h) { return h.innerText || ''; }).join('\n') + '\n' + (document.title || '').replace(/\s+-\s+/g, '\n') : (card && card.innerText) || '';
var lines = text.split('\n');
for (var i = 0; i < lines.length; i++) {
var m = /^\s*(\d+[A-Za-z]?\s+[^,$\n]{2,60}?,\s*[A-Za-z .'-]{2,30}?),\s*BC\b/i.exec(lines[i]);
if (m) return m[1].replace(/\s+/g, ' ');
}
return '';
}
function openCalc(price, isNewBuild, mortgage, prices) {
current = { isNewBuild: isNewBuild, mortgage: mortgage, prices: prices || [price], price: price };
var city = mortgage ? cityOf() : '';
var total = mortgage && lastTotal && lastTotal.price === price ? lastTotal.total : 0;
var u = utm(mortgage, COMMERCIAL ? 'commercial' : isNewBuild ? 'new_build' : 'residential');
var url = (mortgage ? MORTGAGE_APP : APP) + '?utm_source=' + u.utm_source + '&utm_medium=' + u.utm_medium + '&utm_campaign=' + u.utm_campaign + '&utm_content=' + u.utm_content + '&price=' + price + (isNewBuild ? '&new=1' : '') + (mortgage ? '&down=' + EST.downPct : '') + (total ? '&total=' + total : '') + (city ? '&city=' + encodeURIComponent(city) : '') + (mortgage && COMMERCIAL ? '&commercial=1' : '') + (mortgage && lastAddr ? '&addr=' + encodeURIComponent(lastAddr) : '') + '&v=' + Math.floor(Date.now() / 6e4);
var m = modal();
m.querySelector('.hn-bcp-title').textContent = mortgage ? 'Mortgage for $' + price.toLocaleString('en-CA') + (city ? ' in ' + city : '') :
(COMMERCIAL ? 'Commercial Buyer Cost for $' : 'Buyer Cost for $') + price.toLocaleString('en-CA');
var alts = current.prices.length > 1 ? current.prices : [];
if (alts.length) m.querySelector('.hn-bcp-title').textContent = mortgage ? 'Mortgage' + (city ? ' in ' + city : '') + ' for' : (COMMERCIAL ? 'Commercial Buyer Cost for' : 'Buyer Cost for');
m.querySelector('.hn-bcp-alts').innerHTML = alts.map(function (p) {
return '<button type="button" class="hn-bcp-alt' + (p === price ? ' hn-bcp-alt-on' : '') + '" data-hn-price="' + p + '">$' + p.toLocaleString('en-CA') + '</button>';
}).join('');
var fr = m.querySelector('iframe'), fail = m.querySelector('.hn-bcp-fail');
fail.hidden = true;
m.querySelector('.hn-bcp-fail-open').href = url;
clearTimeout(loadTimer);
fr.onload = function () {
if (fr.getAttribute('src') === 'about:blank') return;
clearTimeout(loadTimer);
fail.hidden = true;
dbg('calculator frame loaded, size ' + Math.round(fr.getBoundingClientRect().width) + 'x' + Math.round(fr.getBoundingClientRect().height));
};
// If the calculator hasn't loaded after a few seconds (slow or blocked network), offer it in a new tab instead of leaving a blank box.
loadTimer = setTimeout(function () { if (m.classList.contains('hn-bcp-on')) { fail.hidden = false; dbg('calculator frame did not load in 6s'); } }, 6000);
fr.src = url;
m.classList.add('hn-bcp-on');
showCta(m);
document.documentElement.style.overflow = 'hidden';
m.querySelector('.hn-bcp-x').focus();
}

function onClick(e) {
var el = e.target && e.target.closest && e.target.closest('.hn-bcp,.hn-bcp-btn,.hn-bcp-hint');
if (!el) return;
// Use the price the card shows right now, not the one stored when the button was added.
var card = cardOf(el.classList.contains('hn-bcp') ? el : el.parentElement);
var shown = card && card.querySelector('.hn-bcp');
var prices = shown ? parsePrices(priceText(shown)) : [];
var price = prices[0] || +el.getAttribute('data-hn-price');
if (!price) return;
lastAddr = addressOf(card);
// Stop the card's own link (to the listing page) only for clicks on the price or the button.
e.preventDefault();
e.stopPropagation();
if (e.stopImmediatePropagation) e.stopImmediatePropagation();
var isMortgage = el.getAttribute('data-hn-kind') === 'mortgage';
var listingType = COMMERCIAL ? 'commercial' : isNew(el) ? 'new_build' : 'residential';
track(isMortgage ? 'hn_mortgage_click' : 'hn_buyer_cost_click', Object.assign({ listing_price: price, listing_type: listingType, button_text: el.classList.contains('hn-bcp-btn') ? el.textContent : el.classList.contains('hn-bcp-hint') ? 'hint line' : 'price' }, utm(isMortgage, listingType)));
dbg('tap on ' + (isMortgage ? 'Mortgage' : 'Buyer cost') + ' button, price=' + price);
try { openCalc(price, isNew(el), isMortgage, prices.length ? prices : [price]); } catch (err) { dbg('ERROR opening the calculator: ' + err.message); throw err; }
var mm = document.getElementById('hn-bcp-modal');
dbg('calculator open: ' + !!(mm && mm.classList.contains('hn-bcp-on')) + ', box ' + (mm ? Math.round(mm.getBoundingClientRect().width) + 'x' + Math.round(mm.getBoundingClientRect().height) : 'missing') + ', iframe ' + (mm ? mm.querySelector('iframe').src.slice(0, 70) : ''));
}

// Floating widgets (the AI chat bubble and its window, the language selector) sit in fixed boxes; clicks there are never card clicks.
// Before this, a chat bubble click on the home page climbed to a section holding listings and opened the registration form (2026-10-24).
function inFixed(el) {
for (; el && el !== document.body; el = el.parentElement) if (getComputedStyle(el).position === 'fixed') return true;
return false;
}
// A signed-out visitor who has used a calculator and then clicks a listing card gets the registration form (the card does not open until
// they register), the same as when they close a calculator. Our own buttons, hearts and other buttons are left alone.
function onCardClick(e) {
// Only a visitor's own click. Our own clicks on the Register link (openRegistration) must not land here: on the search page that
// started a loop that re-opened the form and logged hn_listing_signup_prompt about once a second.
if (!e.isTrusted) return;
var t = e.target;
if (!t || !t.closest || t.closest('.hn-bcp-row,#hn-bcp-modal,button,[role="button"],input,select,textarea,label')) return;
// The photo arrows (and dots) that page through a card's pictures never open the form (Nader, 2026-10-25).
for (var pa = t, pi = 0; pa && pa !== document.body && pi < 4; pa = pa.parentElement, pi++) {
var pc = (typeof pa.className === 'string' ? pa.className : (pa.getAttribute && pa.getAttribute('class')) || '') + ' ' + ((pa.getAttribute && (pa.getAttribute('aria-label') || pa.getAttribute('title'))) || '');
if (/(^|[\s_-])(arrow|arrows|prev|next|chevron|left|right)([\s_-]|$)|swiper-(button|pagination)|slick-(arrow|dots)|carousel-control|pagination|indicator/i.test(pc)) return;
}
var used = false;
try { used = sessionStorage.getItem('hnCalcUsed') === '1'; } catch (err) {}
if (!used || !registerLink() || inFixed(t)) return;
var link = t.closest('a[href*="/listing-detail/"]');
if (!link) {
for (var a = t.parentElement, i = 0; a && a !== document.body && i < 8; a = a.parentElement, i++) {
var ls = a.querySelectorAll('a[href*="/listing-detail/"]');
// Exactly one listing link: a single card, never a whole section (the home page's wrapper holds many, but no button rows).
if (ls.length === 1 && a.querySelector('img,picture') && a.querySelectorAll('.hn-bcp-row').length <= 1) { link = ls[0]; break; }
}
}
if (!link) return;
e.preventDefault();
e.stopPropagation();
if (e.stopImmediatePropagation) e.stopImmediatePropagation();
track('hn_listing_signup_prompt', { listing_url: link.getAttribute('href') });
dbg('listing card click: showing the registration form');
openRegistration();
hideFormClose();
}

var started = false;
function start() {
if (started) { scan(); return; }
started = true;
var style = document.createElement('style');
style.textContent =
'.hn-bcp{cursor:pointer!important}' +
'.hn-bcp-row{display:flex!important;flex-wrap:wrap;gap:8px;margin:8px 0 6px!important}' +
'button.hn-bcp-btn{position:relative!important;top:auto!important;left:auto!important;z-index:2!important;display:flex!important;align-items:center!important;gap:7px!important;width:max-content!important;max-width:100%!important;height:auto!important;min-height:0!important;margin:0!important;padding:6px 12px!important;border:0!important;border-radius:8px!important;background:#1e8e3e!important;box-shadow:none!important;color:#fff!important;font-family:inherit!important;font-weight:700!important;font-size:14px!important;line-height:1.2!important;letter-spacing:0!important;text-transform:none!important;cursor:pointer!important;white-space:nowrap!important;opacity:1!important}' +
'.hn-bcp-btn::before{content:"";width:16px;height:16px;flex:none;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v4h10V4H7zm1 7v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zm-8 4v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v6h2v-6h-2zm-8 4v2h2v-2H8zm4 0v2h2v-2h-2z%27/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v4h10V4H7zm1 7v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zm-8 4v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v6h2v-6h-2zm-8 4v2h2v-2H8zm4 0v2h2v-2h-2z%27/%3E%3C/svg%3E") center/contain no-repeat}' +
'button.hn-bcp-btn:hover{background:#17702f!important}' +
'.hn-bcp-col{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:4px!important}' +
'.hn-bcp-hint{margin:0!important;padding:0!important;color:#555!important;font-family:inherit!important;font-size:14px!important;text-align:left!important;font-weight:400!important;line-height:1.3!important;text-decoration:none!important;text-transform:none!important;white-space:normal!important;cursor:pointer!important}' +
'.hn-bcp-hint u{color:#1e8e3e!important;font-weight:600!important;text-decoration:underline!important}' +
'#hn-bcp-modal{display:none;position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);align-items:center;justify-content:center;padding:16px}' +
'#hn-bcp-modal.hn-bcp-on{display:flex}' +
'#hn-bcp-modal .hn-bcp-box{width:600px;max-width:100%;height:min(820px,100%);background:#fff;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.35)}' +
'#hn-bcp-modal .hn-bcp-bar{display:flex;align-items:center;gap:12px;padding:10px 12px 10px 18px;border-bottom:1px solid #e6e2d9;background:#f4f2ee;color:#111;font-family:inherit;font-size:15px;line-height:1.3}' +
'#hn-bcp-modal .hn-bcp-bar{flex-wrap:wrap}' +
'#hn-bcp-modal .hn-bcp-title{font-weight:600}' +
'#hn-bcp-modal .hn-bcp-alts{flex:1;display:flex;flex-wrap:wrap;gap:6px}' +
'#hn-bcp-modal .hn-bcp-alt{border:1px solid #dbae77;border-radius:8px;padding:4px 10px;background:#fff;color:#111;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer}' +
'#hn-bcp-modal .hn-bcp-alt-on{background:#dbae77}' +
'#hn-bcp-modal .hn-bcp-x{border:0;background:none;font-size:28px;line-height:1;padding:0 6px;cursor:pointer;color:#111}' +
'#hn-bcp-modal iframe{flex:1 1 auto;min-height:0;display:block;width:100%;border:0;background:#fff}' +
'#hn-bcp-modal .hn-bcp-fail{padding:12px 16px;background:#fff7e8;color:#111;font-family:inherit;font-size:14px;border-top:1px solid #e6e2d9}' +
'#hn-bcp-modal .hn-bcp-fail[hidden]{display:none}' +
'#hn-bcp-modal .hn-bcp-fail a{color:#8a6a35;font-weight:600;text-decoration:underline}' +
'#hn-bcp-modal .hn-bcp-cta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 14px;border-top:1px solid #e6e2d9;background:#f4f2ee;color:#111;font-family:inherit;font-size:14px;line-height:1.3}' +
'#hn-bcp-modal .hn-bcp-cta[hidden],#hn-bcp-modal .hn-bcp-cta-btn[hidden]{display:none}' +
'#hn-bcp-modal .hn-bcp-cta span{flex:1 1 100%;font-weight:600}' +
'#hn-bcp-modal .hn-bcp-cta-btn{border:0;border-radius:8px;padding:8px 14px;background:#dbae77;color:#111;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer}' +
'#hn-bcp-modal .hn-bcp-save{background:#fff;border:1px solid #dbae77}' +
'@media(max-width:640px){#hn-bcp-modal{padding:0}#hn-bcp-modal .hn-bcp-box{height:100%;border-radius:0}}';
(document.head || document.documentElement).appendChild(style);
// Capture phase, so the price click is handled before the card's link or Lofty's own click handler.
document.addEventListener('click', onClick, true);
document.addEventListener('click', onCardClick, true);
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.querySelector('#hn-bcp-modal.hn-bcp-on')) closeAndOffer(); });
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
// Site-wide conversion clicks (Nader 2026-10-25), sent like the listing buttons (Nader-exp, GA4, Meta pixel) with UTM-style tags:
// call / text / e-mail / WhatsApp links (hn_contact_click), "What's My Home Worth?" and Valuation (hn_valuation_click), Calendly
// booking links (hn_booking_click), the "Get the ... app" cards (hn_app_card_click) and the first use of each pasted-in calculator
// (hn_calculator_use). The chat greeting buttons are counted by chat-welcome.js through window.hnTrack (hn_chat_button_click).
if (!window.hnSiteClicks) {
window.hnSiteClicks = true;
window.hnTrack = track;
function siteTags(medium, campaign, content) {
return { utm_source: 'home-nader.com', utm_medium: medium, utm_campaign: campaign, utm_content: content || '' };
}
function placeOf(el) {
return el.closest('header, .md-header') ? 'header' : el.closest('footer, .md-footer') ? 'footer' : 'page';
}
var VALUATION = /^(what'?s my home worth\??|home valuation|valuation|value my home|free home (evaluation|valuation))$/i;
document.addEventListener('click', function (e) {
if (!e.isTrusted || !e.target || !e.target.closest) return;
var t = e.target, a = t.closest('a, button, [role="button"]');
var href = a ? (a.getAttribute('href') || '').trim() : '';
var text = (a || t).textContent.replace(/\s+/g, ' ').trim().slice(0, 60);
var where = placeOf(t);
var kind = /^tel:/i.test(href) ? 'call' : /^sms:/i.test(href) ? 'text' : /^mailto:/i.test(href) ? 'email' : /wa\.me|whatsapp/i.test(href) ? 'whatsapp' : '';
if (kind) { track('hn_contact_click', Object.assign({ contact_type: kind, link_location: where, button_text: text || (a && (a.getAttribute('aria-label') || a.getAttribute('title'))) || kind }, siteTags('contact_link', kind, where))); return; }
if (/calendly\.com/i.test(href)) { track('hn_booking_click', Object.assign({ link_location: where, button_text: text }, siteTags('booking_link', 'calendly', where))); return; }
var card = t.closest('#hn-bc-card, #hn-sc-card, #hn-mc-card, #hn-fh-card, #hn-pd-card, .hn-app');
if (card && a) {
var h = card.querySelector('h2, h3'), app = h ? h.textContent.replace(/\s+/g, ' ').trim().replace(/^get the\s+/i, '').replace(/\s+app$/i, '') : '';
track('hn_app_card_click', Object.assign({ app: app, button_text: text }, siteTags('app_card', app.toLowerCase().replace(/\s+/g, '_'), text)));
return;
}
// "Get Price List & Floor Plans" on the presale / new-home development cards (Nader 2026-10-27): hn_price_list_click, named by the card's title.
var PL = null;
for (var pe = t, pk = 0; pe && pe !== document.body && pk < 4 && !PL; pe = pe.parentElement, pk++) {
if (/^get price list\s*(&|and)\s*floor plans$/i.test(pe.textContent.replace(/\s+/g, ' ').trim())) PL = pe;
}
if (PL) {
text = PL.textContent.replace(/\s+/g, ' ').trim();
var dev = '';
for (var c = PL.parentElement, j = 0; c && c !== document.body && j < 8 && !dev; c = c.parentElement, j++) {
var hd = c.querySelector('h1, h2, h3, h4, h5');
if (hd) dev = hd.textContent.replace(/\s+/g, ' ').trim().slice(0, 80);
}
track('hn_price_list_click', Object.assign({ development: dev, button_text: text }, siteTags('price_list_button', 'presale_price_list', dev)));
return;
}
// The home page Valuation tab is not a link, so look at the clicked element and a few blocks around it for a short matching label.
for (var el = t, i = 0; el && el !== document.body && i < 4; el = el.parentElement, i++) {
var label = el.textContent.replace(/\s+/g, ' ').trim();
if (label.length > 40) break;
if (VALUATION.test(label)) { track('hn_valuation_click', Object.assign({ link_location: where, button_text: label }, siteTags('valuation_button', 'home_valuation', where))); return; }
}
}, true);
var CALCS = { 'mh-app': 'cash_to_close', 'sc-app': 'seller_cost', 'mc-app': 'mortgage', 'fh-app': 'first_home_savings', 'pd-app': 'presale_deposits' };
var calcUsed = {};
var calcUse = function (name) {
if (calcUsed[name]) return;
calcUsed[name] = true;
track('hn_calculator_use', Object.assign({ calculator: name }, siteTags('calculator_page', name, '')));
};
// Mortgage calculators page (Nader 2026-10-25): each tab of our mortgage form counts on its own.
var MC_TABS = { 'mc-pay': 'mortgage_payment', 'mc-afford': 'mortgage_affordability', 'mc-cmhc': 'mortgage_cmhc', 'mc-tax': 'mortgage_transfer_tax' };
var calcInput = function (e) {
var box = e.target && e.target.closest && e.target.closest('#mh-app, #sc-app, #mc-app, #fh-app, #pd-app');
if (!box) return;
var tab = box.id === 'mc-app' && e.target.closest('#mc-pay, #mc-afford, #mc-cmhc, #mc-tax');
calcUse(tab ? MC_TABS[tab.id] : CALCS[box.id]);
};
document.addEventListener('change', calcInput, true);
document.addEventListener('input', calcInput, true);
// Ratehub calculators are frames from another site, so their inputs can't be seen: count the first
// time the visitor clicks into each one (focus moves into its frame).
var RATEHUB = [[/LandTransfer|land transfer/i, 'ratehub_land_transfer_tax'], [/DownPayment|cmhc/i, 'ratehub_cmhc'],
[/Affordab/i, 'ratehub_affordability'], [/ProductTable|rate (table|comparison)|rates/i, 'ratehub_rate_table'], [/Payment|mortgage calc/i, 'ratehub_payment']];
setInterval(function () {
var f = document.activeElement;
if (!f || f.tagName !== 'IFRAME') return;
var id = (f.getAttribute('src') || '') + ' ' + (f.getAttribute('title') || '');
if (!/ratehub/i.test(id)) return;
var name = 'ratehub_other';
for (var i = 0; i < RATEHUB.length; i++) if (RATEHUB[i][0].test(id)) { name = RATEHUB[i][1]; break; }
calcUse(name);
}, 1000);
}
var LISTING_PAGE = false, active = false;
function route() {
active = false;
clearTries = 0;
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

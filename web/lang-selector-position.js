// Phones held upright, on the home page only: Lofty's floating language selector ("EN") sat on top of the search field.
// Park it just below the search field instead (it keeps floating, like the AI chat bubble, from that spot). Lying on its side, on a wide window, or on any other page
// (listing pages have a search field too) it keeps Lofty's own floating spot (rotating or changing page switches at once). Served from GitHub Pages, loaded by listing-buyer-cost.js.
// No timers: it is moved the moment Lofty draws it, and put back the moment Lofty resets it, both before the next paint, so it never shows
// in two places (a timer that re-applied the spot every half second made it jump whenever Lofty redrew it in between).
(function () {
if (window.hnLangPos) return;
window.hnLangPos = true;

var PROPS = ['position', 'bottom', 'left', 'top'];
var box = null, saved = null, parked = false, mo = null, queued = false;

// Upright phone (or a narrow window) on the home page (Lofty gives its <body> the class "home"): the only place the selector is moved.
function upright() { return innerWidth <= 700 && innerHeight > innerWidth && !!document.body && document.body.classList.contains('home'); }

// The floating box that holds the "EN" selector: a small fixed box at the left edge.
function find() {
var all = document.body.querySelectorAll('img,svg');
for (var i = 0; i < all.length; i++) {
var el = all[i], hold = null;
if (el.closest('#hn-bcp-modal')) continue;
// The selector's text ("EN") sits a level or two above its flag / arrow.
for (var u = el.parentElement, d = 0; u && u !== document.body && d < 4; u = u.parentElement, d++) {
if (/^(EN|FR|ZH|[A-Z]{2})$/.test((u.textContent || '').replace(/\s+/g, ' ').trim())) { hold = u; break; }
}
if (!hold) continue;
// the floating box: climb to the fixed element that holds it
for (var b = hold; b && b !== document.body; b = b.parentElement) {
if (getComputedStyle(b).position === 'fixed' || b.getAttribute('data-hn-lang')) {
var r = b.getBoundingClientRect();
if (b.getAttribute('data-hn-lang') || (r.left < 30 && r.width < 280 && r.width > 40)) return b;
break;
}
}
}
return null;
}

function set(name, value) {
if (box.style.getPropertyValue(name) !== value || box.style.getPropertyPriority(name) !== 'important') box.style.setProperty(name, value, 'important');
}

// Put the box just under the search field. Only writes what differs, so it never triggers itself.
function apply() {
if (!box) return;
if (!upright()) { restore(); return; }
var inp = document.querySelector('input[placeholder*="Subdivision"]');
if (!inp || !inp.offsetParent) return;
if (!saved) saved = PROPS.map(function (p) { return [p, box.style.getPropertyValue(p), box.style.getPropertyPriority(p)]; });
parked = true;
var r = inp.getBoundingClientRect();
// Like the AI chat bubble: the box stays position:fixed, so it keeps floating while the page scrolls, but its spot on the screen is
// moved to where the search field's bottom edge is at the top of the page (plus a gap), whatever the scroll is now.
var left = Math.round(Math.max(0, r.left - 4)), top = Math.round(r.bottom + scrollY + 14);
set('position', 'fixed');
set('bottom', 'auto');
set('left', left + 'px');
set('top', top + 'px');
// Whatever the page offsets fixed boxes by, correct for it.
var off = top - box.getBoundingClientRect().top;
if (Math.abs(off) > 1) set('top', Math.round(top + off) + 'px');
}

// Lofty's own spot again (rotated sideways, or the window got wide).
function restore() {
if (!parked) return;
parked = false;
saved.forEach(function (x) { if (x[1]) box.style.setProperty(x[0], x[1], x[2]); else box.style.removeProperty(x[0]); });
saved = null;
}

function later() {
if (queued) return;
queued = true;
requestAnimationFrame(function () { queued = false; try { look(); apply(); } catch (e) {} });
}

function look() {
if (box) return;
var inp = document.querySelector('input[placeholder*="Subdivision"]');
if (!inp || !inp.offsetParent) return;
box = find();
if (!box) return;
box.setAttribute('data-hn-lang', '1');
// Lofty resets the box's styles when it redraws: put it back straight away.
mo = new MutationObserver(function () { try { apply(); } catch (e) {} });
mo.observe(box, { attributes: true, attributeFilter: ['style', 'class'] });
apply();
}

// Watch for Lofty drawing the selector, and for it being swapped for a new one later. Gives up looking after 30 seconds if there is none.
var t0 = Date.now();
var wait = new MutationObserver(function () {
if (box && box.isConnected) return;
if (box) { box = null; mo.disconnect(); }
else if (Date.now() - t0 > 30000) { wait.disconnect(); return; }
try { look(); } catch (e) {}
});
wait.observe(document.documentElement, { childList: true, subtree: true });
try { look(); } catch (e) {}

// Turning the phone: the new size can arrive a moment after the event on iOS, so look again shortly after.
function turned() { later(); setTimeout(later, 350); }
addEventListener('resize', turned);
addEventListener('orientationchange', turned);
addEventListener('load', later);
// Lofty can switch pages without reloading: look again when the page type (the body's class) changes.
if (document.body) new MutationObserver(later).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();

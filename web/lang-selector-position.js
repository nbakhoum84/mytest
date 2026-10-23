// Phones, home page: Lofty's floating language selector ("EN") sat on top of the search field.
// Park it just below the search field instead (it scrolls with the page there). Served from GitHub Pages, loaded by listing-buyer-cost.js.
// No timers: it is moved the moment Lofty draws it, and put back the moment Lofty resets it, both before the next paint, so it never shows
// in two places (a timer that re-applied the spot every half second made it jump whenever Lofty redrew it in between).
(function () {
if (window.hnLangPos || innerWidth > 700) return;
window.hnLangPos = true;

var box = null, mo = null, queued = false;

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
var inp = document.querySelector('input[placeholder*="Subdivision"]');
if (!box || !inp || !inp.offsetParent) return;
var r = inp.getBoundingClientRect();
var left = Math.round(Math.max(0, r.left - 4)), top = Math.round(r.bottom + scrollY + 14);
set('position', 'absolute');
set('bottom', 'auto');
set('left', left + 'px');
set('top', top + 'px');
// Whatever the page offsets absolute boxes by, correct for it.
var off = top - (box.getBoundingClientRect().top + scrollY);
if (Math.abs(off) > 1) set('top', Math.round(top + off) + 'px');
}

function later() {
if (queued) return;
queued = true;
requestAnimationFrame(function () { queued = false; try { apply(); } catch (e) {} });
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

addEventListener('resize', later);
addEventListener('load', later);
})();

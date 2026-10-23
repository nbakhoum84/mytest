// Phones, home page: park Lofty's AI chat bubble just below the search field instead of over its search button.
// Lofty's markup isn't known, so the bubble is found by what is actually drawn on top of the search button (looking inside hidden
// components too); its floating box is then moved down. Tapping the bubble puts it back, so the chat window opens in its normal place.
// Served from GitHub Pages, loaded by listing-buyer-cost.js.
(function () {
if (window.hnBubblePos || innerWidth > 700) return;
window.hnBubblePos = true;

var held = null, done = false;

// What is on top at a point, going down into shadow roots.
function deepHit(x, y) {
var e = document.elementFromPoint(x, y);
while (e && e.shadowRoot) {
var i = e.shadowRoot.elementFromPoint(x, y);
if (!i || i === e) break;
e = i;
}
return e;
}
// The nearest floating (position: fixed) box around el, climbing out of shadow roots too.
function fixedHolder(el) {
while (el) {
if (el.nodeType === 1 && getComputedStyle(el).position === 'fixed') return el;
el = el.parentNode && el.parentNode.nodeType === 11 ? el.parentNode.host : el.parentNode;
}
return null;
}

function place() {
if (done) return;
var inp = document.querySelector('input[placeholder*="Subdivision"]');
if (!inp || !inp.offsetParent) return;
var ir = inp.getBoundingClientRect();
if (ir.bottom < 0 || ir.bottom > innerHeight - 40) return;
var hit = deepHit(Math.round(innerWidth * 0.88), Math.round((ir.top + ir.bottom) / 2));
var box = hit && fixedHolder(hit);
// Nothing floating over the search button, or it is the page itself / our own popup.
if (!box || box.contains(inp) || box.closest('#hn-bcp-modal')) return;
var r = box.getBoundingClientRect();
// Bigger than a bubble plus its preview card: an open chat window or an overlay, leave it.
if (r.height > 260 || r.width > 340) return;
var top = Math.min(ir.bottom + 14, innerHeight - r.height - 16);
done = true;
if (top <= r.top + 4) return;
held = box;
box.style.setProperty('top', Math.round(top) + 'px', 'important');
box.style.setProperty('bottom', 'auto', 'important');
box.addEventListener('click', release, true);
box.addEventListener('touchstart', release, { capture: true, passive: true });
}

// Tapping the bubble opens the chat window in its normal place.
function release() {
if (!held) return;
held.style.removeProperty('top');
held.style.removeProperty('bottom');
held = null;
}
var n = 0;
var t = setInterval(function () { try { place(); } catch (e) {} if (done || ++n > 40) clearInterval(t); }, 500);
})();

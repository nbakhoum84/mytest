// Phones, home page: park Lofty's AI chat bubble just below the search field instead of over its search button.
// It stays a floating bubble (fixed on screen) so it is always reachable; only its height on screen changes.
// Served from GitHub Pages, loaded by listing-buyer-cost.js. When the chat window is open it is left exactly as Lofty draws it.
(function () {
if (window.hnBubblePos || innerWidth > 700) return;
window.hnBubblePos = true;

// The bubble is the round agent photo near the right edge; its fixed-position holder is what gets moved.
function find() {
var imgs = document.body.querySelectorAll('img');
for (var i = 0; i < imgs.length; i++) {
var r = imgs[i].getBoundingClientRect();
if (r.width < 40 || r.width > 120 || Math.abs(r.width - r.height) > 12 || r.right < innerWidth - 40 || r.top < innerHeight * 0.3) continue;
if (imgs[i].closest('#hn-bcp-modal')) continue;
for (var b = imgs[i]; b && b !== document.body; b = b.parentElement) {
if (getComputedStyle(b).position === 'fixed') return b;
}
}
return null;
}

function place() {
var inp = document.querySelector('input[placeholder*="Subdivision"]');
if (!inp || !inp.offsetParent) return;
var box = find();
if (!box) return;
// Chat window open (tall holder): leave Lofty's own layout alone.
if (box.getBoundingClientRect().height > 320) {
['top', 'bottom'].forEach(function (p) { if (box.hasAttribute('data-hn-moved')) box.style.removeProperty(p); });
box.removeAttribute('data-hn-moved');
return;
}
var r = inp.getBoundingClientRect(), h = box.getBoundingClientRect().height;
var top = Math.min(Math.max(r.bottom + 14, 0), innerHeight - h - 16);
if (!box.hasAttribute('data-hn-moved') || Math.abs(box.getBoundingClientRect().top - top) > 2) {
box.setAttribute('data-hn-moved', '');
box.style.setProperty('top', Math.round(top) + 'px', 'important');
box.style.setProperty('bottom', 'auto', 'important');
}
}
var n = 0;
var t = setInterval(function () { try { place(); } catch (e) {} if (++n > 40) clearInterval(t); }, 500);
})();

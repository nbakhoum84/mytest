// Phones, home page: park Lofty's AI chat bubble just below the search field instead of over its search button.
// It stays a floating bubble (fixed on screen) so it is always reachable; only its height on screen changes.
// Served from GitHub Pages, loaded by listing-buyer-cost.js. When the chat window is open it is left exactly as Lofty draws it.
(function () {
if (window.hnBubblePos || innerWidth > 700) return;
window.hnBubblePos = true;

// The bubble's fixed-position holder, found by where it sits: a fixed box hugging the right edge in the lower half of the screen,
// at most a preview card in size. Looks inside shadow roots too, and the frame itself when the chat is drawn in an iframe.
function fixedBoxes(root, out) {
var all = root.querySelectorAll('*');
for (var i = 0; i < all.length; i++) {
var el = all[i];
if (el.shadowRoot) fixedBoxes(el.shadowRoot, out);
if (el.closest && el.closest('#hn-bcp-modal')) continue;
if (getComputedStyle(el).position !== 'fixed') continue;
var r = el.getBoundingClientRect();
if (r.right >= innerWidth - 40 && r.left > innerWidth * 0.2 && r.width >= 40 && r.width <= 340 &&
r.height >= 40 && r.height <= 260 && r.top > innerHeight * 0.4) out.push(el);
}
return out;
}
function find() {
var c = fixedBoxes(document, []);
for (var i = 0; i < c.length; i++) {
var outer = true;
for (var j = 0; j < c.length; j++) if (j !== i && c[j].contains(c[i])) outer = false;
if (outer) return c[i];
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

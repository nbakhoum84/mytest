// Phones, home page: park Lofty's AI chat bubble just below the search field instead of over its search button.
// Lofty draws the chat as a zero-size fixed box (#chat-app, pinned bottom right) and the bubble grows upward from it. The box stays
// fixed, so the bubble keeps floating while the page scrolls, but its spot on the screen is moved from the bottom corner to where the
// search field's bottom edge is at the top of the page, plus a gap (the greeting card is lined up to the bubble's top so it stays off
// the field).
// Served from GitHub Pages, loaded by listing-buyer-cost.js.
(function () {
if (window.hnBubblePos || innerWidth > 700) return;
window.hnBubblePos = true;

var GAP = 14;
var box = null, placed = false, queued = false, mo = null;

function place() {
var inp = document.querySelector('input[placeholder*="Subdivision"]');
var el = document.getElementById('chat-app');
if (!inp || !inp.offsetParent || !el) return;
if (!placed && getComputedStyle(el).position !== 'fixed') return;
if (!placed) {
box = el;
placed = true;
// The greeting card shows up (and changes) later: keep it off the search field too.
mo = new MutationObserver(fitCard);
mo.observe(el, { childList: true, subtree: true });
}
var l = el.querySelector('.launcher');
// The box's bottom edge is the bubble's bottom edge, so aim that GAP below the field (where it sits at the top of the page, whatever the
// scroll is now) plus the bubble's own height.
var want = inp.getBoundingClientRect().bottom + scrollY + GAP + ((l && l.offsetHeight) || 60);
el.style.setProperty('bottom', 'auto', 'important');
el.style.setProperty('top', Math.round(want) + 'px', 'important');
// Whatever the page offsets fixed boxes by, correct for it.
var off = want - el.getBoundingClientRect().top;
if (Math.abs(off) > 1) el.style.setProperty('top', Math.round(want + off) + 'px', 'important');
fitCard();
}

// The greeting card hangs above the bubble, which would put it over the search field: line its top up with the bubble's top instead.
function fitCard() {
if (!placed) return;
var c = box.querySelector('.pop-msg'), l = box.querySelector('.launcher');
if (!c || !l) return;
c.style.removeProperty('margin-bottom');
var over = Math.round(l.getBoundingClientRect().top - c.getBoundingClientRect().top);
if (over > 0) c.style.setProperty('margin-bottom', -over + 'px', 'important');
}

function later() {
if (queued) return;
queued = true;
requestAnimationFrame(function () { queued = false; try { place(); } catch (e) {} });
}

// Place it the moment Lofty draws it (before the next paint, so it never shows in the old spot first).
var wait = new MutationObserver(function () { try { place(); } catch (e) {} if (placed) wait.disconnect(); });
wait.observe(document.documentElement, { childList: true, subtree: true });
try { place(); } catch (e) {}
if (placed) wait.disconnect();
setTimeout(function () { wait.disconnect(); }, 20000);

addEventListener('resize', later);
addEventListener('load', later);
})();

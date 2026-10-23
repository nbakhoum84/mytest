// Phones, home page: park Lofty's AI chat bubble just below the search field instead of over its search button.
// Lofty draws the chat as a zero-size fixed box (#chat-app, pinned bottom right) and the bubble grows upward from it. The search field
// ends close to the bottom of a phone screen, so there is no room under it for a fixed bubble: the box scrolls with the page (absolute)
// and sits under the field. Once the visitor scrolls on, or taps the bubble, it goes back to its normal floating place, so the chat
// stays reachable and its window opens as usual.
// Served from GitHub Pages, loaded by listing-buyer-cost.js.
(function () {
if (window.hnBubblePos || innerWidth > 700) return;
window.hnBubblePos = true;

var GAP = 14, LEAVE_AT = 120, PROPS = ['position', 'top', 'bottom'];
var box = null, saved = null, placed = false, released = false, queued = false, mo = null;

function place() {
if (released) return;
var inp = document.querySelector('input[placeholder*="Subdivision"]');
var el = document.getElementById('chat-app');
if (!inp || !inp.offsetParent || !el) return;
// Opened the page already scrolled down: leave the bubble where it is.
if (scrollY > LEAVE_AT) { released = true; return; }
if (!placed && getComputedStyle(el).position !== 'fixed') return;
if (!placed) {
box = el;
saved = PROPS.map(function (p) { return [p, el.style.getPropertyValue(p), el.style.getPropertyPriority(p)]; });
placed = true;
el.addEventListener('click', release, true);
el.addEventListener('touchstart', release, { capture: true, passive: true });
// The greeting card shows up (and changes) later: keep it off the search field too.
mo = new MutationObserver(fitCard);
mo.observe(el, { childList: true, subtree: true });
}
var l = el.querySelector('.launcher');
// The box's bottom edge is the bubble's bottom edge, so aim that GAP below the field plus the bubble's own height.
var want = inp.getBoundingClientRect().bottom + scrollY + GAP + ((l && l.offsetHeight) || 60);
el.style.setProperty('position', 'absolute', 'important');
el.style.setProperty('bottom', 'auto', 'important');
el.style.setProperty('top', Math.round(want) + 'px', 'important');
// Whatever the page offsets absolute boxes by, correct for it.
var off = want - (el.getBoundingClientRect().top + scrollY);
if (Math.abs(off) > 1) el.style.setProperty('top', Math.round(want + off) + 'px', 'important');
fitCard();
}

// The greeting card hangs above the bubble, which would put it over the search field: line its top up with the bubble's top instead.
function fitCard() {
if (!placed || released) return;
var c = box.querySelector('.pop-msg'), l = box.querySelector('.launcher');
if (!c || !l) return;
c.style.removeProperty('margin-bottom');
var over = Math.round(l.getBoundingClientRect().top - c.getBoundingClientRect().top);
if (over > 0) c.style.setProperty('margin-bottom', -over + 'px', 'important');
}

// Back to the normal floating place (also what opens the chat window where it belongs).
function release() {
if (!placed || released) return;
released = true;
if (mo) mo.disconnect();
saved.forEach(function (s) { if (s[1]) box.style.setProperty(s[0], s[1], s[2]); else box.style.removeProperty(s[0]); });
var c = box.querySelector('.pop-msg');
if (c) c.style.removeProperty('margin-bottom');
}

function later() {
if (queued || released) return;
queued = true;
requestAnimationFrame(function () { queued = false; try { place(); } catch (e) {} });
}

// Place it the moment Lofty draws it (before the next paint, so it never shows in the old spot first).
var wait = new MutationObserver(function () { try { place(); } catch (e) {} if (placed || released) wait.disconnect(); });
wait.observe(document.documentElement, { childList: true, subtree: true });
try { place(); } catch (e) {}
if (placed || released) wait.disconnect();
setTimeout(function () { wait.disconnect(); }, 20000);

addEventListener('scroll', function () { if (placed && scrollY > LEAVE_AT) release(); }, { passive: true });
addEventListener('resize', later);
addEventListener('load', later);
})();

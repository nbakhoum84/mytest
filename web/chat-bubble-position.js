// Phones held upright, on the home page only: park Lofty's AI chat bubble just below the search field instead of over its search button.
// Lofty draws the chat as a zero-size fixed box (#chat-app, pinned bottom right) and the bubble grows upward from it. The box stays
// fixed, so the bubble keeps floating while the page scrolls, but its spot on the screen is moved from the bottom corner to where the
// search field's bottom edge is at the top of the page, plus a gap (the greeting card is lined up to the bubble's top so it stays off
// the field). The loader raises the titles and search bar a little (listing-buyer-cost.js) so the bubble fits above the screen's bottom.
// A phone lying on its side, a wide window, or any other page (listing pages have a search field too) keeps Lofty's own layout, with the
// bubble floating in its corner: rotating or changing page puts it back at once, and parks it again on the upright home page.
// Served from GitHub Pages, loaded by listing-buyer-cost.js.
(function () {
if (window.hnBubblePos) return;
window.hnBubblePos = true;

var GAP = 14, PROPS = ['position', 'top', 'bottom'];
var box = null, saved = null, parked = false, queued = false, mo = null;

// Upright phone (or a narrow window) on the home page (Lofty gives its <body> the class "home"): the only place the bubble is moved.
function upright() { return innerWidth <= 700 && innerHeight > innerWidth && !!document.body && document.body.classList.contains('home'); }

function place() {
var el = document.getElementById('chat-app');
if (!upright()) { unpark(); return; }
var inp = document.querySelector('input[placeholder*="Subdivision"]');
if (!inp || !inp.offsetParent || !el) return;
// Lofty swapped the chat for a new one: start over with it.
if (box && box !== el) { if (mo) mo.disconnect(); box = null; parked = false; }
if (!box) {
if (getComputedStyle(el).position !== 'fixed') return;
box = el;
saved = PROPS.map(function (p) { return [p, el.style.getPropertyValue(p), el.style.getPropertyPriority(p)]; });
// The greeting card shows up (and changes) later: keep it off the search field too.
mo = new MutationObserver(fitCard);
mo.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
}
var l = el.querySelector('.launcher');
// The box's bottom edge is the bubble's bottom edge, so aim that GAP below the field (where it sits at the top of the page, whatever the
// scroll is now) plus the bubble's own height.
var want = inp.getBoundingClientRect().bottom + scrollY + GAP + ((l && l.offsetHeight) || 60);
el.style.setProperty('bottom', 'auto', 'important');
el.style.setProperty('top', Math.round(want) + 'px', 'important');
parked = true;
// Whatever the page offsets fixed boxes by, correct for it.
var off = want - el.getBoundingClientRect().top;
if (Math.abs(off) > 1) el.style.setProperty('top', Math.round(want + off) + 'px', 'important');
fitCard();
}

// The greeting card hangs above the bubble, which would put it over the search field: line its top up with the bubble's top instead.
// It shows up, appears and animates later, so this runs on every change inside the chat; it only writes when the value is different.
function fitCard() {
if (!box || !parked) return;
var c = box.querySelector('.pop-msg'), l = box.querySelector('.launcher');
if (!c || !l || !c.offsetHeight) return;
var m = -(parseFloat(c.style.getPropertyValue('margin-bottom')) || 0);
var over = Math.round(l.getBoundingClientRect().top - c.getBoundingClientRect().top + m);
if (over < 0) over = 0;
if (over !== m) c.style.setProperty('margin-bottom', -over + 'px', 'important');
}

// Lofty's own spot again (rotated sideways, or the window got wide).
function unpark() {
if (!box || !parked) return;
parked = false;
saved.forEach(function (s) { if (s[1]) box.style.setProperty(s[0], s[1], s[2]); else box.style.removeProperty(s[0]); });
var c = box.querySelector('.pop-msg');
if (c) c.style.removeProperty('margin-bottom');
}

function later() {
if (queued) return;
queued = true;
requestAnimationFrame(function () { queued = false; try { place(); } catch (e) {} });
}

// Place it the moment Lofty draws it (before the next paint, so it never shows in the old spot first).
var wait = new MutationObserver(function () { try { place(); } catch (e) {} if (parked) wait.disconnect(); });
wait.observe(document.documentElement, { childList: true, subtree: true });
try { place(); } catch (e) {}
if (parked) wait.disconnect();
setTimeout(function () { wait.disconnect(); }, 20000);

// Turning the phone: the new size can arrive a moment after the event on iOS, so look again shortly after.
function turned() { later(); setTimeout(later, 350); }
addEventListener('resize', turned);
addEventListener('orientationchange', turned);
addEventListener('load', later);
// The header and hero finish growing after the spot is first set (the phone header bar, fonts, images), which pushed the search field
// down onto the parked buttons: re-measure whenever the page layout changes size.
if (window.ResizeObserver && document.body) { var ro = new ResizeObserver(later); ro.observe(document.body); var hd = document.querySelector('header'); if (hd) ro.observe(hd); }
// Lofty can switch pages without reloading: look again when the page type (the body's class) changes.
if (document.body) new MutationObserver(later).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();

// Home page only (Nader 2026-10-31): don't show Lofty's "Find Your Dream Home" registration form while someone is just browsing.
// Lofty pops it up by itself (a fixed box with Full Name / Email / Phone and a consent box, over a dark backdrop). This hides that
// automatic popup and gives the page its scrolling back. The form still opens when a visitor asks for it: a click on Register / Sign In
// (or Log In) counts as asking, and then it is left alone until it is closed. Other pages are not touched.
// Served from GitHub Pages, loaded by listing-buyer-cost.js.
(function () {
if (window.hnNoRegPopup) return;
window.hnNoRegPopup = true;

var lastAsk = 0, queued = false, hidOnce = false;
// Only a click on a Register / Sign In / Log In control (or anything inside one) counts as the visitor asking for the form.
document.addEventListener('click', function (e) {
var t = e.target && e.target.closest ? e.target.closest('a,button,[role=button],li,span,div') : null;
for (var n = 0; t && n < 4; n++, t = t.parentElement) {
if (/^\s*(register|sign ?in|log ?in|register\s*\/\s*sign ?in)\s*$/i.test((t.textContent || '').trim())) { lastAsk = Date.now(); return; }
}
}, true);

// A rule on an attribute, so the popup stays hidden even if Lofty rewrites its style or classes.
var st = document.createElement('style');
st.textContent = '[data-hn-gone]{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}';
(document.head || document.documentElement).appendChild(st);

// Any page: listing lists pop the same form up. The popup is recognised by its heading and its name / e-mail / phone fields.
function isHome() { return !!document.body; }

// The popup is the form whose heading says "Find Your Dream Home" and which asks for a name, an e-mail and a phone number.
function findForm() {
var heads = document.querySelectorAll('h1,h2,h3,h4,h5,div,span,p,strong,b');
for (var i = 0; i < heads.length; i++) {
var h = heads[i];
if (!/^find your dream home$/i.test(h.textContent.trim().replace(/\s+/g, ' '))) continue;
// The hero of the home page may carry the same words: only a box with the three fields is the popup.
var box = h;
for (var d = 0; box && d < 12; d++, box = box.parentElement) {
if (box.querySelector('input[type=email], input[placeholder*="Email" i], input[name*="email" i]') && box.querySelector('input[placeholder*="Phone" i], input[type=tel], input[name*="phone" i]')) return box;
}
}
return null;
}

// Climb from the form to the outermost fixed layer (the dialog or its backdrop wrapper), so everything around it goes away together.
function layer(form) {
var top = form, el = form;
while (el && el !== document.body && el !== document.documentElement) {
var pos = getComputedStyle(el).position;
if (pos === 'fixed' || el.getAttribute('role') === 'dialog' || el.getAttribute('aria-modal') === 'true') top = el;
el = el.parentElement;
}
return top;
}

// The dark backdrop is a separate layer: a fixed box (or a pseudo-element of <body>) covering the screen with nothing readable in it.
// Found by what it covers, whatever Lofty calls it. Checked on every pass, not only when the popup is first hidden.
function coversScreen(r) { return r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.9 && r.left <= innerWidth * 0.05 && r.top <= innerHeight * 0.05; }
function dimsPage(cs) {
if (cs.position !== 'fixed' && cs.position !== 'absolute') return false;
var bg = cs.backgroundColor, m = /rgba?\(([^)]+)\)/.exec(bg || '');
var a = m ? (m[1].split(',')[3] === undefined ? 1 : parseFloat(m[1].split(',')[3])) : 0;
return (a > 0 && a < 1) || (a === 1 && parseFloat(cs.opacity) < 1) || (cs.backgroundImage && cs.backgroundImage !== 'none' && cs.backgroundImage.indexOf('gradient') > -1);
}
function clearBackdrop() {
var pts = [[innerWidth / 2, 100], [innerWidth / 2, innerHeight / 2], [20, innerHeight - 20]];
pts.forEach(function (pt) {
var el = document.elementFromPoint(pt[0], pt[1]);
while (el && el !== document.documentElement) {
var cs = getComputedStyle(el);
if (el !== document.body && !el.hasAttribute('data-hn-gone') && cs.position === 'fixed' && coversScreen(el.getBoundingClientRect()) && !el.textContent.trim() && !el.querySelector('input,img,video,iframe') && dimsPage(cs)) { el.setAttribute('data-hn-gone', '1'); break; }
el = el.parentElement;
}
});
// Pseudo-element dimming of <body> or <html> (a lock class that paints ::before / ::after over the page).
[document.body, document.documentElement].forEach(function (n) {
['::before', '::after'].forEach(function (ps) {
var cs = getComputedStyle(n, ps);
if (cs.content !== 'none' && cs.position === 'fixed' && dimsPage(cs) && parseFloat(cs.width) >= innerWidth * 0.9) {
var id = 'hn-ps-' + ps.slice(2);
if (!document.getElementById(id)) { var x = document.createElement('style'); x.id = id; x.textContent = (n === document.body ? 'body' : 'html') + ps + '{display:none!important}'; document.head.appendChild(x); }
}
});
});
}

// The popup locks the page's scrolling: give it back.
function unlock() {
[document.body, document.documentElement].forEach(function (n) {
// Only undo the popup's lock. Forcing overflow:auto on <html> and <body> made iPhone Safari leave the page below the fold blank
// (gray) after a reload (Nader 2026-11-01).
n.style.removeProperty('overflow');
n.style.removeProperty('position');
n.classList.remove('modal-open', 'no-scroll', 'overflow-hidden', 'is-locked');
});
}

// The one place the form is wanted (Nader 2026-11-01): when a visitor clicks a listing to see its details (/listing-detail/...).
// Everywhere else, the home page and the listing lists included, it stays hidden. The site may open a listing without reloading the
// page, so the address is checked on every pass; arriving on a listing page puts back anything hidden before.
function onListingPage() { return /\/listing-detail\//i.test(location.pathname); }
function release() {
if (!hidOnce) return;
hidOnce = false;
document.querySelectorAll('[data-hn-gone]').forEach(function (n) { n.removeAttribute('data-hn-gone'); });
['hn-ps-before', 'hn-ps-after'].forEach(function (id) { var x = document.getElementById(id); if (x) x.remove(); });
[document.body, document.documentElement].forEach(function (n) { n.style.removeProperty('overflow'); });
}

function scan() {
queued = false;
if (!isHome()) return;
if (onListingPage()) { release(); return; }
var form = findForm();
if (!form) { if (hidOnce && Date.now() - lastAsk > 3000) { clearBackdrop(); unlock(); } return; }
// Asked for by the visitor (clicked Register / Sign In): leave it alone while it is open.
var el = layer(form);
if (Date.now() - lastAsk < 3000) { el.removeAttribute('data-hn-gone'); form.setAttribute('data-hn-keep', '1'); return; }
if (form.hasAttribute('data-hn-keep')) { if (el.offsetParent !== null || getComputedStyle(el).display !== 'none') return; form.removeAttribute('data-hn-keep'); }
if (el.hasAttribute('data-hn-gone') && getComputedStyle(el).display === 'none') { clearBackdrop(); unlock(); return; }
el.setAttribute('data-hn-gone', '1');
hidOnce = true;
clearBackdrop();
unlock();
}

function queue() { if (!queued) { queued = true; setTimeout(scan, 50); } }

function start() {
if (!document.body) { setTimeout(start, 100); return; }
scan();
new MutationObserver(queue).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'hidden', 'aria-hidden'] });
window.addEventListener('scroll', queue, { passive: true });
setInterval(scan, 700);
}
start();
})();

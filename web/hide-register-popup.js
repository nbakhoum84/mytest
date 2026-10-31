// Home page only (Nader 2026-10-31): don't show Lofty's "Find Your Dream Home" registration form while someone is just browsing.
// Lofty pops it up by itself (a fixed box with Full Name / Email / Phone and a consent box, over a dark backdrop). This hides that
// automatic popup and gives the page its scrolling back. The form still opens when a visitor asks for it: a click on Register/Sign In
// (or any other link or button) in the last 2 seconds counts as asking, and then it is left alone. Other pages are not touched.
// Served from GitHub Pages, loaded by listing-buyer-cost.js.
(function () {
if (window.hnNoRegPopup) return;
window.hnNoRegPopup = true;

var lastClick = 0, queued = false;
document.addEventListener('click', function () { lastClick = Date.now(); }, true);
document.addEventListener('keydown', function (e) { if (e.key === 'Enter') lastClick = Date.now(); }, true);

function isHome() { return !!document.body && document.body.classList.contains('home'); }

// The popup is the form whose heading says "Find Your Dream Home" and which asks for a name, an e-mail and a phone number.
function findForm() {
var heads = document.querySelectorAll('h1,h2,h3,h4,div,span,p');
for (var i = 0; i < heads.length; i++) {
var h = heads[i];
if (h.children.length || !/^find your dream home$/i.test(h.textContent.trim())) continue;
// The hero of the home page may carry the same words: only a box with the three fields is the popup.
var box = h;
for (var d = 0; box && d < 12; d++, box = box.parentElement) {
if (box.querySelector('input[type=email], input[placeholder*="Email" i]') && box.querySelector('input[placeholder*="Name" i]') && box.querySelector('input[placeholder*="Phone" i]')) return box;
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

function scan() {
queued = false;
if (!isHome()) return;
var form = findForm();
if (!form || form.dataset.hnKeep) return;
// Asked for by the visitor (Register / Sign In, a button): leave it, and keep leaving it until it is closed.
if (Date.now() - lastClick < 2000) { form.dataset.hnKeep = '1'; return; }
var el = layer(form);
if (el.dataset.hnGone) return;
el.dataset.hnGone = '1';
el.style.setProperty('display', 'none', 'important');
// The popup locks the page's scrolling and may leave a backdrop and a lock class behind.
document.querySelectorAll('[class*="backdrop" i],[class*="overlay" i],[class*="modal-mask" i]').forEach(function (b) {
if (getComputedStyle(b).position === 'fixed' && !b.querySelector('input,form,header,nav')) b.style.setProperty('display', 'none', 'important');
});
[document.body, document.documentElement].forEach(function (n) {
n.style.setProperty('overflow', 'auto', 'important');
n.style.removeProperty('position');
n.classList.remove('modal-open', 'no-scroll', 'overflow-hidden', 'is-locked');
});
}

function queue() { if (!queued) { queued = true; setTimeout(scan, 50); } }

function start() {
if (!document.body) { setTimeout(start, 100); return; }
scan();
new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
}
start();
})();

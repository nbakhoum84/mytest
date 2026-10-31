// Home page only (Nader 2026-10-31): don't show Lofty's "Find Your Dream Home" registration form while someone is just browsing.
// Lofty pops it up by itself (a fixed box with Full Name / Email / Phone and a consent box, over a dark backdrop). This hides that
// automatic popup and gives the page its scrolling back. The form still opens when a visitor asks for it: a click on Register / Sign In
// (or Log In) counts as asking, and then it is left alone until it is closed. Other pages are not touched.
// Served from GitHub Pages, loaded by listing-buyer-cost.js.
(function () {
if (window.hnNoRegPopup) return;
window.hnNoRegPopup = true;

var lastAsk = 0, queued = false;
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

function isHome() { return !!document.body && document.body.classList.contains('home'); }

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

function scan() {
queued = false;
if (!isHome()) return;
var form = findForm();
if (!form) return;
// Asked for by the visitor (clicked Register / Sign In): leave it alone while it is open.
var el = layer(form);
if (Date.now() - lastAsk < 3000) { el.removeAttribute('data-hn-gone'); form.setAttribute('data-hn-keep', '1'); return; }
if (form.hasAttribute('data-hn-keep')) { if (el.offsetParent !== null || getComputedStyle(el).display !== 'none') return; form.removeAttribute('data-hn-keep'); }
if (el.hasAttribute('data-hn-gone') && getComputedStyle(el).display === 'none') return;
el.setAttribute('data-hn-gone', '1');
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
new MutationObserver(queue).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'hidden', 'aria-hidden'] });
window.addEventListener('scroll', queue, { passive: true });
setInterval(scan, 700);
}
start();
})();

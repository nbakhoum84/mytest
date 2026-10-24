// Nader (2026-10-24): black text must stay black when the mouse is over it, on every page.
// The site's theme recolours links (and text inside links and menu items) on hover. This keeps each dark text colour as it is
// when not hovered, by setting it on the element itself. Text on coloured buttons (links with their own background) is left alone,
// so their hover look still works. Loaded on every page by listing-buyer-cost.js.
(function () {
if (window.hnHoverLock) return;
window.hnHoverLock = true;
var SEL = 'a,a *,.menu-item,.menu-item *';
var SKIP = '.hn-bcp-row,#hn-bcp-modal,#hn-chat-welcome';
function dark(c) {
var m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/.exec(c);
if (!m || (m[4] !== undefined && +m[4] === 0)) return false;
return 0.299 * m[1] + 0.587 * m[2] + 0.114 * m[3] < 90;
}
function filled(el) {
var a = el.closest('a') || el;
var bg = getComputedStyle(a).backgroundColor;
return !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(bg);
}
function scan() {
var els = document.querySelectorAll(SEL);
for (var i = 0; i < els.length; i++) {
var el = els[i];
if (el.hasAttribute('data-hn-hc') || el.matches(':hover') || el.closest(SKIP)) continue;
var c = getComputedStyle(el).color;
if (!dark(c) || filled(el)) continue;
el.setAttribute('data-hn-hc', '');
el.style.setProperty('color', c, 'important');
}
}
var t = 0;
function later() { clearTimeout(t); t = setTimeout(scan, 400); }
function start() {
scan();
new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
}
if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();

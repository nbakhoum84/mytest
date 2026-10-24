// Nader (2026-10-24): black text must stay black when the mouse is over it, on every page.
// The site's theme recolours links, menu items and labels (e.g. the listing cards' property-type tags) on hover. This keeps each dark text colour as it is
// when not hovered, by setting it on the element itself. Text on coloured buttons (links with their own background) is left alone,
// so their hover look still works. Loaded on every page by listing-buyer-cost.js.
(function () {
if (window.hnHoverLock) return;
window.hnHoverLock = true;
// Every element that shows its own text (links, menu items, and labels such as the listing cards' Townhouse / Condo tags).
var NOT = 'script,style,noscript,button,input,select,textarea,option,svg,svg *';
var SKIP = '.hn-bcp-row,#hn-bcp-modal,#hn-chat-welcome';
function dark(c) {
var m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/.exec(c);
if (!m || (m[4] !== undefined && +m[4] === 0)) return false;
return 0.299 * m[1] + 0.587 * m[2] + 0.114 * m[3] < 130;
}
function ownText(el) {
for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) return true;
return false;
}
// Button-style links and buttons: their hover look (often dark background, light text) is left as is.
function buttonish(el) {
var a = el.closest('a,[role="button"]');
if (a && !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(getComputedStyle(a).backgroundColor)) return true;
return !!el.closest('[class*="btn"],[class*="button"]');
}
function scan() {
var els = document.body.getElementsByTagName('*');
for (var i = 0; i < els.length; i++) {
var el = els[i];
if (el.hasAttribute('data-hn-hc') || !ownText(el) || el.matches(NOT) || el.matches(':hover') || el.closest(SKIP)) continue;
var c = getComputedStyle(el).color;
if (!dark(c) || buttonish(el)) continue;
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

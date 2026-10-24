// Nader (2026-10-24): text must keep its colour when the mouse is over it, on every page.
// The site's theme recolours links, menu items and labels (e.g. the listing cards' property-type tags) on hover. This keeps each text colour as it is
// when not hovered, by setting it on the element itself. Text on coloured buttons (links with their own background) is left alone,
// so their hover look still works. Loaded on every page by listing-buyer-cost.js.
(function () {
if (window.hnHoverLock) return;
window.hnHoverLock = true;
// Every element that shows its own text (links, menu items, and labels such as the listing cards' Townhouse / Condo tags).
var NOT = 'script,style,noscript,button,input,select,textarea,option,svg,svg *';
var SKIP = '.hn-bcp-row,#hn-bcp-modal,#hn-chat-welcome';
// Any visible colour counts (dark text, and light text such as on the home page's photos; Nader 2026-10-24).
function visible(c) {
var m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/.exec(c);
return !!m && !(m[4] !== undefined && +m[4] === 0);
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
if (!visible(c) || buttonish(el)) continue;
el.setAttribute('data-hn-hc', c);
el.style.setProperty('color', c, 'important');
}
}
// The site changes some colours on purpose when the page scrolls (e.g. the header turning sticky). Re-read every locked colour that
// is not under the mouse, so text follows those changes and only hover stays blocked. Colours set by other scripts are left alone.
function refresh() {
var els = document.querySelectorAll('[data-hn-hc]'), free = [], i;
for (i = 0; i < els.length; i++) {
var el = els[i];
if (el.matches(':hover') || el.style.getPropertyValue('color') !== el.getAttribute('data-hn-hc')) continue;
el.style.removeProperty('color');
free.push(el);
}
var cs = free.map(function (el) { return getComputedStyle(el).color; });
for (i = 0; i < free.length; i++) {
free[i].setAttribute('data-hn-hc', cs[i]);
free[i].style.setProperty('color', cs[i], 'important');
}
}
var t = 0, r = 0;
function later() { clearTimeout(t); t = setTimeout(function () { refresh(); scan(); }, 400); }
function start() {
scan();
new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
window.addEventListener('scroll', function () { clearTimeout(r); r = setTimeout(refresh, 150); }, { passive: true });
window.addEventListener('resize', later);
}
if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();

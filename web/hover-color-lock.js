// Nader (2026-10-24): text must keep its colour when the mouse is over it, on every page.
// The site's theme recolours links, menu items and labels (e.g. the listing cards' property-type tags) on hover. This keeps each text colour as it is
// when not hovered, by setting it on the element itself. Text on coloured buttons (links with their own background) is left alone,
// so their hover look still works. Loaded on every page by listing-buyer-cost.js.
(function () {
if (window.hnHoverLock) return;
// Touch screens have no mouse hover, so nothing to lock there. Leaving the header untouched on phones fixed the phone number and e-mail
// row disappearing after scrolling (Nader 2026-10-26; it worked with all our scripts off).
if (window.matchMedia && !window.matchMedia('(hover:hover)').matches) return;
window.hnHoverLock = true;
// Every element that shows its own text (links, menu items, and labels such as the listing cards' Townhouse / Condo tags).
var NOT = 'script,style,noscript,button,input,select,textarea,option,svg,svg *';
// The AI chat (#chat-app) is left completely alone: the chat bubble started opening Lofty's sign-up form right after this script
// went live (Nader, 2026-10-24).
var SKIP = '.hn-bcp-row,#hn-bcp-modal,#hn-chat-welcome,#chat-app,[class*="chat"]';
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
pin(el, c);
}
}
// Also pins -webkit-text-fill-color, which some themes change on hover instead of color.
function pin(el, c) {
el.setAttribute('data-hn-hc', c);
el.style.setProperty('color', c, 'important');
el.style.setProperty('-webkit-text-fill-color', c, 'important');
}
// The home page's headings still changed on hover with the colour pinned (Nader, 2026-10-24): the site rewrites the element's own
// style on hover, dropping the pin. Put it straight back. A colour another script sets as !important on purpose (the sticky
// header's white text) is left alone.
function guard(list) {
for (var i = 0; i < list.length; i++) {
var el = list[i].target, c = el.getAttribute && el.getAttribute('data-hn-hc');
if (!c || el.style.getPropertyPriority('color') === 'important') continue;
pin(el, c);
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
el.style.removeProperty('-webkit-text-fill-color');
free.push(el);
}
var cs = free.map(function (el) { return getComputedStyle(el).color; });
for (i = 0; i < free.length; i++) {
pin(free[i], cs[i]);
}
}
// The gold hover colour comes from the site's own custom CSS (Lofty Custom Style box), a rule like
// ":is(a, p, li, h1, h2, h3, h4, span):hover { color: rgb(219,174,119) !important }". Take the colour out of every such :hover rule
// the page can read (button hovers that also change the background keep theirs), so hovered text keeps its colour no matter which element it sits in.
function unhover(rules) {
for (var i = 0; rules && i < rules.length; i++) {
var ru = rules[i];
if (ru.cssRules && !ru.selectorText) { unhover(ru.cssRules); continue; }
var sel = ru.selectorText;
// A hover rule that also changes the background is a button's hover look: left as is.
if (!sel || sel.indexOf(':hover') < 0 || !ru.style || !ru.style.getPropertyValue('color') || ru.style.getPropertyValue('background-color') || ru.style.getPropertyValue('background')) continue;
ru.style.removeProperty('color');
ru.style.removeProperty('-webkit-text-fill-color');
}
}
function stripHover() {
for (var i = 0; i < document.styleSheets.length; i++) {
var sh = document.styleSheets[i], rs = null;
try { rs = sh.cssRules; } catch (e) { continue; }
unhover(rs);
}
}
var t = 0, r = 0;
function later() { clearTimeout(t); t = setTimeout(function () { stripHover(); refresh(); scan(); }, 400); }
function start() {
stripHover();
scan();
new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
new MutationObserver(guard).observe(document.body, { attributes: true, attributeFilter: ['style'], subtree: true });
window.addEventListener('scroll', function () { clearTimeout(r); r = setTimeout(refresh, 150); }, { passive: true });
window.addEventListener('resize', later);
}
if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();

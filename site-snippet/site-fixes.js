// home-nader.com UX fixes. Paste into Lofty Page Script (JavaScript), after the Seller Cost script.
// Each fix is defensive: it only touches elements that match, so it is safe if Lofty fixes the cause itself.
(function () {
var PHONE = '+16046127228';

// 1. Hide the "Please enter valid address." message until a search field has been used.
function hideEarlyAddressError() {
var style = document.createElement('style');
style.textContent = '.hn-hide-err{display:none!important}';
(document.head || document.documentElement).appendChild(style);
function isErr(el) { return !el.children.length && /^please enter valid address\.?$/i.test(el.textContent.trim()); }
function scan() {
var els = document.querySelectorAll('div,span,p,label');
for (var i = 0; i < els.length; i++) {
var el = els[i];
if (!isErr(el)) continue;
if (el.dataset.hnSeen) continue;
el.dataset.hnSeen = '1';
el.classList.add('hn-hide-err');
var scope = el.closest('form') || el.parentElement;
var input = scope && scope.querySelector('input');
var show = function (e) { return function () { e.classList.remove('hn-hide-err'); }; }(el);
if (input) {
input.addEventListener('blur', function () { if (!this.value.trim()) show(); });
input.addEventListener('input', function () { if (this.value.trim()) el.classList.add('hn-hide-err'); });
}
if (scope) scope.addEventListener('submit', show);
scope && scope.querySelectorAll('button,[role=button],a').forEach(function (b) { b.addEventListener('click', function () { if (input && !input.value.trim()) show(); }); });
}
}
scan();
new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
}

// 2. Logo link: a bare "\" (or empty) href should go to the home page.
function fixLogo() {
document.querySelectorAll('a[href]').forEach(function (a) {
var h = a.getAttribute('href').trim();
if (h === '\\' || h === '/\\' || h === '') a.setAttribute('href', '/');
});
}

// 3. Phone links: rebuild tel: hrefs without escaped characters.
function fixTel() {
document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
var h = decodeURIComponent(a.getAttribute('href').slice(4));
if (/[\\()\s-]/.test(h)) a.setAttribute('href', 'tel:' + (h.replace(/[^\d+]/g, '') || PHONE));
});
}

// 4. Menu: remove blank dropdown items and repair malformed featured-area links.
function fixMenu() {
document.querySelectorAll('nav li, header li, [class*="menu" i] li').forEach(function (li) {
if (!li.children.length || li.querySelector('ul,img,svg,input')) {
if (!li.textContent.trim() && !li.querySelector('ul,img,svg,input')) li.style.display = 'none';
return;
}
var a = li.querySelector('a');
if (a && !a.textContent.trim() && !a.querySelector('img,svg') && !a.getAttribute('aria-label')) li.style.display = 'none';
});
document.querySelectorAll('a[href]').forEach(function (a) {
var h = a.getAttribute('href');
if (/[{}<>\\]|%7B|%7D|undefined|null/i.test(h) && !/^tel:|^mailto:/.test(h)) {
var clean = h.replace(/%7B.*?%7D|\{.*?\}|\\|undefined|null/gi, '').replace(/\/{2,}$/, '/');
a.setAttribute('href', clean.charAt(0) === '/' || /^https?:/.test(clean) ? clean : '/' + clean);
}
});
}

// 5. Pagination: hide it when there is only one page.
function fixPager() {
document.querySelectorAll('[class*="pagination" i], nav[aria-label*="pagination" i]').forEach(function (p) {
var pages = p.querySelectorAll('a,button,li');
var nums = Array.prototype.filter.call(pages, function (x) { return /^\d+$/.test(x.textContent.trim()); });
if (nums.length <= 1) p.style.display = 'none';
});
}

function run() { fixLogo(); fixTel(); fixMenu(); fixPager(); }
function start() {
hideEarlyAddressError();
run();
var t, mo = new MutationObserver(function () { clearTimeout(t); t = setTimeout(run, 200); });
mo.observe(document.body, { childList: true, subtree: true });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
})();

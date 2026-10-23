// Phones, home page: Lofty's floating language selector ("EN") sat on top of the search field.
// Park it just below the search field instead (it scrolls with the page there). Served from GitHub Pages, loaded by listing-buyer-cost.js.
(function () {
if (window.hnLangPos || innerWidth > 700) return;
window.hnLangPos = true;

function find() {
var all = document.body.getElementsByTagName('*');
for (var i = 0; i < all.length; i++) {
var el = all[i];
if (el.id === 'hn-bcp-modal' || el.closest('#hn-bcp-modal')) continue;
var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
if (!/^(EN|FR|ZH|[A-Z]{2})$/.test(t) || !el.querySelector('img,svg')) continue;
// the floating box: climb to the fixed element that holds it
for (var b = el; b && b !== document.body; b = b.parentElement) {
if (getComputedStyle(b).position === 'fixed') {
var r = b.getBoundingClientRect();
if (r.left < 30 && r.width < 280 && r.width > 40) return b;
break;
}
}
}
return null;
}

function place() {
var inp = document.querySelector('input[placeholder*="Subdivision"]');
if (!inp || !inp.offsetParent) return;
var box = find();
if (!box) return;
var r = inp.getBoundingClientRect();
var left = Math.max(0, r.left - 4);
box.style.setProperty('position', 'absolute', 'important');
box.style.setProperty('top', Math.round(r.bottom + scrollY + 14 + (inp.closest('form,div') ? 0 : 0)) + 'px', 'important');
box.style.setProperty('left', Math.round(left) + 'px', 'important');
box.style.setProperty('bottom', 'auto', 'important');
}
var n = 0;
var t = setInterval(function () { try { place(); } catch (e) {} if (++n > 40) clearInterval(t); }, 500);
addEventListener('resize', function () { try { place(); } catch (e) {} });
})();

// Seller Cost card: copies the look and width of the other "Get the ... app" cards. Paste into Lofty Page Script (JavaScript).
(function () {
var URL = 'https://home-nader.com/seller-cost';
var N = 29;
var ROWS = '1fdb357f,104cdd41,17577a5d,174e4e5d,1748e85d,10512941,1fd5557f,b7700,1462d125,f1ac343,ddf3a1d,1c9296a8,1578a361,17af3b63,1059eb11,13116370,1bcee161,3dfa67,1cd72bc9,10b2b0,1e5993fa,12331d,1fd4e951,10426711,174af3fb,1747f69d,17506593,104ed188,1fd2d5e9'.split(',');
var tries = 0;
function qr() {
var d = '';
for (var y = 0; y < N; y++) {
var bits = parseInt(ROWS[y], 16).toString(2);
while (bits.length < N) bits = '0' + bits;
for (var x = 0; x < N; x++) if (bits.charAt(x) === '1') d += 'M' + x + ' ' + y + 'h1v1h-1z';
}
return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ' + (N + 4) + ' ' + (N + 4) + '" shape-rendering="crispEdges" width="120" height="120"><rect x="-2" y="-2" width="' + (N + 4) + '" height="' + (N + 4) + '" fill="#fff"/><path d="' + d + '"/></svg>';
}
function build() {
var style = document.createElement('style');
style.textContent =
'#hn-sc-card{box-sizing:border-box;width:700px;max-width:100%;margin:36px 0;position:relative;left:50%;transform:translateX(-50%);padding:24px;background:#f4f2ee;border:1px solid #e6e2d9;border-radius:16px;display:flex;gap:24px;align-items:center;justify-content:space-between;font-family:inherit;color:inherit}' +
'#hn-sc-card h3{margin:0 0 12px;font-size:26px;font-weight:300;line-height:1.2;color:inherit}' +
'#hn-sc-card p{margin:0 0 16px;font-size:15px;line-height:1.5;color:inherit}' +
'#hn-sc-card a.hn-sc-btn{display:inline-block;padding:14px 26px;background:#c9a063;color:#111;border-radius:8px;font-size:15px;font-weight:500;text-decoration:none}' +
'#hn-sc-card .hn-sc-how{margin-top:16px;font-size:12px;line-height:1.6}' +
'#hn-sc-card .hn-sc-qr{text-align:center;font-size:12px;flex:none}' +
'#hn-sc-card .hn-sc-qr svg{display:block;margin:0 auto 8px}' +
'@media(max-width:640px){#hn-sc-card{flex-direction:column;align-items:flex-start}#hn-sc-card .hn-sc-qr{align-self:center}}';
(document.head || document.documentElement).appendChild(style);
var card = document.createElement('div');
card.id = 'hn-sc-card';
card.innerHTML =
'<div><h3>Get the Seller Cost app</h3>' +
'<p>Estimate your selling costs, commission, legal fees and net proceeds from the sale of your home. Free, no app store needed.</p>' +
'<a class="hn-sc-btn" href="' + URL + '" target="_blank" rel="noopener">Open the app</a>' +
'<div class="hn-sc-how"><b>iPhone:</b> open it in Safari, tap Share, then "Add to Home Screen".<br>' +
'<b>Android:</b> open it in Chrome, tap the ⋮ menu, then "Install app".</div></div>' +
'<div class="hn-sc-qr">' + qr() + 'Scan with your phone</div>';
return card;
}
function findCard() {
var els = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,div,span');
for (var i = 0; i < els.length; i++) {
var el = els[i];
if (el.children.length || !/^Get the .+ app$/i.test(el.textContent.trim()) || el.closest('#hn-sc-card')) continue;
for (var a = el.parentElement; a && a !== document.body; a = a.parentElement) {
var cs = getComputedStyle(a);
if (parseFloat(cs.borderTopLeftRadius) > 0 && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') return a;
}
}
return null;
}
function place() {
if (!document.body || document.getElementById('hn-sc-card')) return true;
var ref = findCard();
var footer = ref ? null : document.querySelector('footer, #footer, .footer, [class*="footer" i]');
if (!ref && !footer && tries++ < 20) return false;
var card = build();
if (ref) {
var cs = getComputedStyle(ref);
[['width', '700px'], ['max-width', innerWidth <= 700 ? ref.offsetWidth + 'px' : '100%'],
['margin', cs.marginTop + ' auto ' + cs.marginBottom], ['position', 'static'], ['transform', 'none'],
['background-color', cs.backgroundColor], ['border', cs.border], ['border-radius', cs.borderRadius],
['padding', cs.padding]].forEach(function (r) { card.style.setProperty(r[0], r[1], 'important'); });
ref.parentNode.insertBefore(card, ref);
} else if (footer && footer.parentNode) footer.parentNode.insertBefore(card, footer);
else document.body.appendChild(card);
return true;
}
function start() {
if (place()) return;
var t = setInterval(function () { if (place()) clearInterval(t); }, 500);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
})();

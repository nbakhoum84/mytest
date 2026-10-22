// Presale Deposit Schedule card: copies the look and width of the other "Get the ... app" cards, or sits above the footer. Loaded by site-snippet/presale-deposits-loader.js from Lofty Page Script (JavaScript).
(function () {
var URL = 'https://nbakhoum84.github.io/mytest/presale-deposits/';
var N = 33;
var ROWS = '1fd51ba7f,105a54641,1741e645d,17550675d,17469b95d,1046f7941,1fd55557f,1b3b700,16e27ea4b,21bcfe6f,15c1947fb,b0a29228,1e75517ba,7a1424aa,17d80214c,143865cec,776c5ed4,1516e57db,175834836,305ce291,9e3f182c,1a35b324d,257ac68b,c83261d0,15678a3f2,16b3f1a,1fd31eb50,10509df1e,17493dff4,1759d192d,1754bd968,1048cb371,1fd75be1c'.split(',');
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
'#hn-pd-card{box-sizing:border-box;width:1300px;max-width:100%;margin:36px 0;position:relative;left:50%;transform:translateX(-50%);padding:24px;background:#f4f2ee;border:1px solid #e6e2d9;border-radius:16px;display:flex;gap:24px;align-items:center;justify-content:space-between;font-family:inherit;color:inherit}' +
'#hn-pd-card h3{margin:0 0 12px;font-size:26px;font-weight:300;line-height:1.2;color:inherit}' +
'#hn-pd-card p{margin:0 0 16px;font-size:15px;line-height:1.5;color:inherit}' +
'#hn-pd-card a.hn-pd-btn{display:inline-block;padding:14px 26px;background:#c9a063;color:#111;border-radius:8px;font-size:15px;font-weight:500;text-decoration:none}' +
'#hn-pd-card .hn-pd-how{margin-top:16px;font-size:12px;line-height:1.6}' +
'#hn-pd-card .hn-pd-qr{text-align:center;font-size:12px;flex:none}' +
'#hn-pd-card .hn-pd-qr svg{display:block;margin:0 auto 8px}' +
'@media(max-width:640px){#hn-pd-card{flex-direction:column;align-items:flex-start}#hn-pd-card .hn-pd-qr{align-self:center}}';
(document.head || document.documentElement).appendChild(style);
var card = document.createElement('div');
card.id = 'hn-pd-card';
card.innerHTML =
'<div><h3>Get the Presale Deposit Schedule app</h3>' +
'<p>See every presale deposit date and amount, and the cash you\'ll need at completion. Free, no app store needed.</p>' +
'<a class="hn-pd-btn" href="' + URL + '" target="_blank" rel="noopener">Open the app</a>' +
'<div class="hn-pd-how"><b>iPhone:</b> open it in Safari, tap Share, then "Add to Home Screen".<br>' +
'<b>Android:</b> open it in Chrome, tap the \u22ee menu, then "Install app".</div></div>' +
'<div class="hn-pd-qr">' + qr() + 'Scan with your phone</div>';
return card;
}
function findCard() {
var els = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,div,span');
for (var i = 0; i < els.length; i++) {
var el = els[i];
if (el.children.length || !/^Get the .+ app$/i.test(el.textContent.trim()) || el.closest('#hn-pd-card')) continue;
for (var a = el.parentElement; a && a !== document.body; a = a.parentElement) {
var cs = getComputedStyle(a);
if (parseFloat(cs.borderTopLeftRadius) > 0 && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') return a;
}
}
return null;
}
function place() {
if (!document.body || document.getElementById('hn-pd-card')) return true;
var ref = findCard();
var footer = ref ? null : document.querySelector('footer, #footer, .footer, [class*="footer" i]');
if (!ref && !footer && tries++ < 20) return false;
var card = build();
if (ref) {
var cs = getComputedStyle(ref);
[['width', '1300px'], ['max-width', innerWidth <= 700 ? ref.offsetWidth + 'px' : '100%'],
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

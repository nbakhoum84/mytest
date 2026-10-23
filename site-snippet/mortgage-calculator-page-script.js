// Mortgage Calculator card (for the Mortgage Calculators page only; the Buyer Cost and Seller Cost pages keep their own scripts): copies the look and width of the other "Get the ... app" cards. Paste into Lofty Page Script (JavaScript).
(function () {
var URL = 'https://home-nader.com/mortgage-calculators';
var N = 33;
var ROWS = '1fd517a7f,105858341,174bd515d,175826b5d,174814f5d,104874a41,1fd55557f,1f3e100,16e278a4b,192e9f36d,167594f7b,e9728d29,127f71db8,1390c12aa,273cf558,dab20fdc,14705edc,1b82e17db,1656e48b6,1b215e753,1cf9d070d,163af9e49,5f76f62b,dbaa56b9,10f25a5f1,1673b18,1fdf9eb52,10580e31e,17479c7f7,175c5a723,1755f9e68,104ccd5b1,1fd2cfa5c'.split(',');
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
'#hn-mc-card{box-sizing:border-box;width:700px;max-width:100%;margin:36px 0;position:relative;left:50%;transform:translateX(-50%);padding:24px;background:#f4f2ee;border:1px solid #e6e2d9;border-radius:16px;display:flex;gap:24px;align-items:center;justify-content:space-between;font-family:inherit;color:inherit}' +
'#hn-mc-card h3{margin:0 0 12px;font-size:26px;font-weight:300;line-height:1.2;color:inherit}' +
'#hn-mc-card p{margin:0 0 16px;font-size:15px;line-height:1.5;color:inherit}' +
'#hn-mc-card a.hn-mc-btn{display:inline-block;padding:14px 26px;background:#c9a063;color:#111;border-radius:8px;font-size:15px;font-weight:500;text-decoration:none}' +
'#hn-mc-card .hn-mc-how{margin-top:16px;font-size:12px;line-height:1.6}' +
'#hn-mc-card .hn-mc-qr{text-align:center;font-size:12px;flex:none}' +
'#hn-mc-card .hn-mc-qr svg{display:block;margin:0 auto 8px}' +
'@media(max-width:640px){#hn-mc-card{flex-direction:column;align-items:flex-start}#hn-mc-card .hn-mc-qr{align-self:center}}';
(document.head || document.documentElement).appendChild(style);
var card = document.createElement('div');
card.id = 'hn-mc-card';
card.innerHTML =
'<div><h3>Get the Mortgage Calculator app</h3>' +
'<p>Work out your mortgage payment, how much home you can afford and your CMHC insurance. Free, no app store needed.</p>' +
'<a class="hn-mc-btn" href="' + URL + '" target="_blank" rel="noopener">Open the app</a>' +
'<div class="hn-mc-how"><b>iPhone:</b> open it in Safari, tap Share, then "Add to Home Screen".<br>' +
'<b>Android:</b> open it in Chrome, tap the ⋮ menu, then "Install app".</div></div>' +
'<div class="hn-mc-qr">' + qr() + 'Scan with your phone</div>';
return card;
}
function findCard() {
var els = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,div,span');
for (var i = 0; i < els.length; i++) {
var el = els[i];
if (el.children.length || !/^Get the .+ app$/i.test(el.textContent.trim()) || el.closest('#hn-mc-card')) continue;
for (var a = el.parentElement; a && a !== document.body; a = a.parentElement) {
var cs = getComputedStyle(a);
if (parseFloat(cs.borderTopLeftRadius) > 0 && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') return a;
}
}
return null;
}
function place() {
if (!document.body || document.getElementById('hn-mc-card')) return true;
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

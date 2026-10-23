// First Home Savings Planner card: copies the look and width of the other "Get the ... app" cards, or sits above the footer. Loaded by site-snippet/first-home-savings-loader.js from Lofty Page Script (JavaScript).
(function () {
var URL = 'https://nbakhoum84.github.io/mytest/first-home-savings/';
var N = 33;
var ROWS = '1fd61327f,105254641,174de605d,175c0a75d,174e9e95d,1043f6941,1fd55557f,1c3a500,16e07ca4b,10aec7e6f,ec89077b,2ae252e8,8565c39a,3aac21aa,e5a4307c,e3624dfc,85407cd4,1283adfdb,7c938c36,1c3a8e691,1dc7f080c,1f0bf76cd,474ad79b,9b2651f1,167a083f2,1d3371a,1fd31ef50,10565df1e,17417cff4,175751d2d,175b3d968,1041893f1,1fd85bc94'.split(',');
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
'#hn-fh-card{box-sizing:border-box;width:700px;max-width:100%;margin:36px 0;position:relative;left:50%;transform:translateX(-50%);padding:24px;background:#f4f2ee;border:1px solid #e6e2d9;border-radius:16px;display:flex;gap:24px;align-items:center;justify-content:space-between;font-family:inherit;color:inherit}' +
'#hn-fh-card h3{margin:0 0 12px;font-size:26px;font-weight:300;line-height:1.2;color:inherit}' +
'#hn-fh-card p{margin:0 0 16px;font-size:15px;line-height:1.5;color:inherit}' +
'#hn-fh-card a.hn-fh-btn{display:inline-block;padding:14px 26px;background:#c9a063;color:#111;border-radius:8px;font-size:15px;font-weight:500;text-decoration:none}' +
'#hn-fh-card .hn-fh-how{margin-top:16px;font-size:12px;line-height:1.6}' +
'#hn-fh-card .hn-fh-qr{text-align:center;font-size:12px;flex:none}' +
'#hn-fh-card .hn-fh-qr svg{display:block;margin:0 auto 8px}' +
'@media(max-width:640px){#hn-fh-card{flex-direction:column;align-items:flex-start}#hn-fh-card .hn-fh-qr{align-self:center}}';
(document.head || document.documentElement).appendChild(style);
var card = document.createElement('div');
card.id = 'hn-fh-card';
card.innerHTML =
'<div><h3>Get the First Home Savings Planner app</h3>' +
'<p>Plan your down payment with an FHSA and the RRSP Home Buyers\' Plan, and see when you\'ll reach your goal. Free, no app store needed.</p>' +
'<a class="hn-fh-btn" href="' + URL + '" target="_blank" rel="noopener">Open the app</a>' +
'<div class="hn-fh-how"><b>iPhone:</b> open it in Safari, tap Share, then "Add to Home Screen".<br>' +
'<b>Android:</b> open it in Chrome, tap the \u22ee menu, then "Install app".</div></div>' +
'<div class="hn-fh-qr">' + qr() + 'Scan with your phone</div>';
return card;
}
function findCard() {
var els = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,div,span');
for (var i = 0; i < els.length; i++) {
var el = els[i];
if (el.children.length || !/^Get the .+ app$/i.test(el.textContent.trim()) || el.closest('#hn-fh-card')) continue;
for (var a = el.parentElement; a && a !== document.body; a = a.parentElement) {
var cs = getComputedStyle(a);
if (parseFloat(cs.borderTopLeftRadius) > 0 && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') return a;
}
}
return null;
}
function place() {
if (!document.body || document.getElementById('hn-fh-card')) return true;
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

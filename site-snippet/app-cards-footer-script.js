// Home Nader + My Home Cost app cards above the footer on every page. Paste into Lofty site-wide custom code (JavaScript).
(function () {
  var APPS = [
    ['Get the home-nader app', "Search Metro Vancouver listings, use mortgage calculators and contact Nader, right from your phone. It's free, with no app store needed.", 'https://nbakhoum84.github.io/mytest/home-nader/', '1fdf13a7f,105e58641,174ee605d,17520675d,174a9cd5d,104af4841,1fd55557f,103a700,16ef7c84b,1a99cfe6f,36394bbb,88e29628,b68513ba,ea5c112a,6f4316c,1c03e4ddc,3d1c5ed4,32da5fdb,fc2344b6,4328e6d1,3e9f048c,1e12f124d,2f3af68b,e04653c1,15ceca3f3,14f3f1a,1fd5deb50,10545d31e,1746fc7f4,175212d2f,1757fd968,1043493b1,1fdb9be14'],
    ['Get the My Home Cost app', 'Estimate your BC closing costs and follow a buyer checklist. Free, no app store needed.', 'https://home-nader.com/my-home-cost', '1fc14f7f,10588741,174a205d,174b845d,17589e5d,104d6f41,1fd5557f,83d00,154e0b12,29595e9,1dd344b7,16a5cc02,5e54dcb,10b851c9,dfc81bb,fa71dda,d5a3bcb,8a790cd,14d84563,bb5c81a,14cc59f0,105117,1fc98b5b,10463d19,175a39f1,17460037,17574339,10483f22,1fdd1b43']
  ];
  function qr(hex) {
    var R = hex.split(','), N = R.length, d = '';
    for (var y = 0; y < N; y++) {
      var b = parseInt(R[y], 16).toString(2);
      while (b.length < N) b = '0' + b;
      for (var x = 0; x < N; x++) if (b.charAt(x) === '1') d += 'M' + x + ' ' + y + 'h1v1h-1z';
    }
    var w = N + 4;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ' + w + ' ' + w + '" shape-rendering="crispEdges" width="120" height="120"><rect x="-2" y="-2" width="' + w + '" height="' + w + '" fill="#fff"/><path d="' + d + '"/></svg>';
  }
  function footerEl() {
    var f = document.querySelector('footer');
    if (f) return f;
    var c = [].slice.call(document.querySelectorAll('#footer, .footer, [class*="footer" i], [id*="footer" i]'));
    c = c.filter(function (e) { return !c.some(function (o) { return o !== e && o.contains(e); }); });
    return c[c.length - 1] || null;
  }
  function build() {
    var css = document.createElement('style');
    css.textContent =
      '#hn-apps{width:960px;max-width:100%;position:relative;left:50%;transform:translateX(-50%);box-sizing:border-box;font-family:inherit;color:inherit}' +
      '#hn-apps .hn-c{box-sizing:border-box;margin:36px 0;padding:24px;background:#f4f2ee;border:1px solid #e6e2d9;border-radius:16px;display:flex;gap:24px;align-items:center;justify-content:space-between}' +
      '#hn-apps h3{margin:0 0 12px;font-size:26px;font-weight:300;line-height:1.2;color:inherit}' +
      '#hn-apps p{margin:0 0 16px;font-size:15px;line-height:1.5;color:inherit}' +
      '#hn-apps a.hn-b{display:inline-block;padding:14px 26px;background:#c9a063;color:#111;border-radius:8px;font-size:15px;font-weight:500;text-decoration:none}' +
      '#hn-apps .hn-h{margin-top:16px;font-size:12px;line-height:1.6}' +
      '#hn-apps .hn-q{text-align:center;font-size:12px;flex:none}' +
      '#hn-apps .hn-q svg{display:block;margin:0 auto 8px}' +
      '@media(max-width:640px){#hn-apps .hn-c{flex-direction:column;align-items:flex-start}#hn-apps .hn-q{align-self:center}}';
    (document.head || document.documentElement).appendChild(css);
  }
  var styled = false;
  function place() {
    if (!document.body || document.getElementById('hn-apps')) return;
    var f = footerEl();
    if (!f || !f.parentNode) return;
    var text = document.body.innerText || '';
    var html = APPS.filter(function (a) { return text.indexOf(a[0]) < 0; }).map(function (a) {
      return '<div class="hn-c"><div><h3>' + a[0] + '</h3><p>' + a[1] + '</p>' +
        '<a class="hn-b" href="' + a[2] + '" target="_blank" rel="noopener">Open the app</a>' +
        '<div class="hn-h"><b>iPhone:</b> open it in Safari, tap Share, then "Add to Home Screen".<br>' +
        '<b>Android:</b> open it in Chrome, tap the ⋮ menu, then "Install app".</div></div>' +
        '<div class="hn-q">' + qr(a[3]) + 'Scan with your phone</div></div>';
    }).join('');
    if (!html) return;
    if (!styled) { build(); styled = true; }
    var box = document.createElement('div');
    box.id = 'hn-apps';
    box.innerHTML = html;
    f.parentNode.insertBefore(box, f);
  }
  function start() {
    place();
    setInterval(place, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

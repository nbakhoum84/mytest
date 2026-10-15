// Seller Cost card for the sellers page, styled like the "Get the ... app" cards. Shown above the footer.
// Paste into Lofty "Page Style & Script" > Page Script (JavaScript, not CSS). Replaces the old banner script.
(function () {
  var URL = 'https://nbakhoum84.github.io/mytest/seller-cost/';
  var N = 33;
  // QR code of URL, one hex number per row (bit set = dark square). No outside service needed.
  var ROWS = '1fc44047f,1057d9d41,175c9cd5d,175522b5d,1748a465d,104451c41,1fd55557f,1544700,105ce85ce,1a303621e,147d350d6,15207373e,127adf161,daa59667,74ac6cca,14ae660bd,9f94a7b9,a8dfb24d,16c323a2d,b9bcf11c,369531ba,141ed5f3c,167b71dd6,13a000744,1cd8337fb,1fb6d17,1fcfe4756,10496031f,1741c49f9,174c918bb,174ad5fb3,1045372bc,1fd1cf3aa'.split(',');
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
      '#hn-sc-card{box-sizing:border-box;width:880px;max-width:calc(100vw - 32px);margin:36px 0;position:relative;left:50%;transform:translateX(-50%);padding:24px;background:#f4f2ee;border:1px solid #e6e2d9;border-radius:16px;display:flex;gap:24px;align-items:center;justify-content:space-between;font-family:inherit;color:inherit}' +
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

  function place() {
    if (!document.body || document.getElementById('hn-sc-card')) return true;
    var footer = document.querySelector('footer, #footer, .footer, [class*="footer" i]');
    // Lofty builds the page with JavaScript, so keep looking for the footer for a few seconds.
    if (!footer && tries++ < 20) return false;
    var card = build();
    if (footer && footer.parentNode) footer.parentNode.insertBefore(card, footer);
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

// Seller Cost banner for the sellers page, shown above the footer.
// Paste into Lofty "Page Style & Script" > Page Script (JavaScript, not CSS).
(function () {
  var URL = 'https://nbakhoum84.github.io/mytest/seller-cost/';
  var tries = 0;

  function build() {
    var style = document.createElement('style');
    style.textContent =
      '#hn-sc-wrap{width:100%;font:14px/1.5 system-ui,sans-serif}' +
      '#hn-sc-bar{background:#0f6b4c;color:#fff;padding:14px 16px;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;text-align:center}' +
      '#hn-sc-bar a{color:#fff;text-decoration:underline;cursor:pointer;white-space:nowrap}' +
      '#hn-sc-steps{display:none;background:#fff;color:#111827;padding:16px;border-top:3px solid #0f6b4c;text-align:left}' +
      '#hn-sc-steps ol{max-width:640px;margin:8px auto 0;padding-left:20px}' +
      '#hn-sc-steps strong{display:block;max-width:640px;margin:0 auto}' +
      '#hn-sc-steps li{margin:6px 0}' +
      '#hn-sc-steps a{color:#0f6b4c}';
    (document.head || document.documentElement).appendChild(style);

    var wrap = document.createElement('div');
    wrap.id = 'hn-sc-wrap';
    wrap.innerHTML =
      '<div id="hn-sc-bar"><span>Selling your home? Try our free Seller Cost app</span>' +
      '<a id="hn-sc-toggle">Open &amp; install</a></div>' +
      '<div id="hn-sc-steps"><strong>Free Seller Cost app. No store needed.</strong><ol>' +
      '<li>On your phone, open <a href="' + URL + '" target="_blank" rel="noopener"><b>Seller Cost</b></a> to estimate commission, legal fees, mortgage payout and your net proceeds.</li>' +
      '<li><b>iPhone (Safari):</b> tap the Share button, then <b>Add to Home Screen</b>, then <b>Add</b>.</li>' +
      '<li><b>Android (Chrome):</b> tap the ⋮ menu, then <b>Install app</b> (or <b>Add to Home screen</b>).</li>' +
      '<li>Open it from your home screen like any other app. It also works offline.</li></ol></div>';
    return wrap;
  }

  function place() {
    if (!document.body || document.getElementById('hn-sc-wrap')) return true;
    var footer = document.querySelector('footer, #footer, .footer, [class*="footer" i]');
    // Lofty builds the page with JavaScript, so keep looking for the footer for a few seconds.
    if (!footer && tries++ < 20) return false;
    var wrap = build();
    if (footer && footer.parentNode) footer.parentNode.insertBefore(wrap, footer);
    else document.body.appendChild(wrap);
    document.getElementById('hn-sc-toggle').onclick = function () {
      var s = document.getElementById('hn-sc-steps');
      s.style.display = s.style.display === 'block' ? 'none' : 'block';
    };
    return true;
  }

  function start() {
    if (place()) return;
    var t = setInterval(function () { if (place()) clearInterval(t); }, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

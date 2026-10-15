// Seller Cost banner for the sellers page. Paste into Lofty "Page Style & Script" > Page Script (JavaScript, not CSS).
(function init() {
  // Wait for the page body: Lofty can run page scripts before <body> exists.
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', init);
    return;
  }
  if (document.getElementById('hn-sc-bar')) return;
  var URL = 'https://nbakhoum84.github.io/mytest/seller-cost/';
  var css =
    '#hn-sc-bar{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#0f6b4c;color:#fff;font:14px/1.4 system-ui,sans-serif;padding:10px 80px 10px 140px;display:flex;gap:12px;align-items:center;justify-content:space-between}' +
    '#hn-sc-bar a{color:#fff;text-decoration:underline;cursor:pointer;white-space:nowrap}' +
    '#hn-sc-steps{display:none;position:fixed;left:0;right:0;bottom:48px;z-index:99999;background:#fff;color:#111827;font:14px/1.5 system-ui,sans-serif;padding:16px;border-top:3px solid #0f6b4c;max-height:60vh;overflow:auto}' +
    '#hn-sc-steps li{margin:6px 0}';
  var style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  var steps = document.createElement('div');
  steps.id = 'hn-sc-steps';
  steps.innerHTML =
    '<strong>Free Seller Cost app. No store needed.</strong><ol>' +
    '<li>On your phone, open <a href="' + URL + '" target="_blank" rel="noopener"><b>Seller Cost</b></a> to estimate commission, legal fees, mortgage payout and your net proceeds.</li>' +
    '<li><b>iPhone (Safari):</b> tap the Share button, then <b>Add to Home Screen</b>, then <b>Add</b>.</li>' +
    '<li><b>Android (Chrome):</b> tap the ⋮ menu, then <b>Install app</b> (or <b>Add to Home screen</b>).</li>' +
    '<li>Open it from your home screen like any other app. It also works offline.</li></ol>';

  var bar = document.createElement('div');
  bar.id = 'hn-sc-bar';
  bar.innerHTML = '<span>Selling your home? Try our free Seller Cost app</span>';
  var link = document.createElement('a');
  link.textContent = 'Open & install';
  link.onclick = function () {
    steps.style.display = steps.style.display === 'block' ? 'none' : 'block';
  };
  bar.appendChild(link);

  document.body.appendChild(steps);
  document.body.appendChild(bar);
})();

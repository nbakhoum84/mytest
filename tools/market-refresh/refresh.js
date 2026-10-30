// Collects White Rock active listings and sold records from the live site (Lofty feeds).
// Usage: node refresh.js [whiterock|abbotsford|burnaby|coquitlam]      (default whiterock; needs Playwright)
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const CITIES = {
  whiterock:  { page: '/white-rock-listings', snap: 'White%20Rock,%20BC', dir: '' },
  abbotsford: { page: '/abbotsford-listings', snap: 'Abbotsford,%20BC', dir: 'abbotsford' },
  burnaby:    { page: '/burnaby-listings',    snap: 'Burnaby,%20BC',    dir: 'burnaby' },
  coquitlam:  { page: '/coquitlam-listings',  snap: 'Coquitlam,%20BC',  dir: 'coquitlam' },
};
const CITY = CITIES[process.argv[2] || 'whiterock'];
if (!CITY) { console.error('unknown city; use whiterock, abbotsford, burnaby or coquitlam'); process.exit(1); }
const OUT = path.join(__dirname, 'data', CITY.dir);
fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const parse = t => { const out = []; const re = /\$([\d,]+)[^\n]*\n([^\n]+)\n\s*\n?Listed by [^\n]+\n\s*\n?([^\n]+)/g; let m;
  while ((m = re.exec(t))) out.push({ price: +m[1].replace(/,/g, ''), addr: m[2].trim(), type: m[3].trim() }); return out; };

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, userAgent: UA });

  // 1) Active listings: walk every results page of /white-rock-listings
  await p.goto('https://home-nader.com' + CITY.page, { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(3000);
  const header = +(await p.evaluate(() => (document.body.innerText.match(/([\d,]+)\s+Featured Properties/) || [])[1])).toString().replace(/,/g, '');
  const active = []; const allIds = new Set();
  for (let page = 1; page <= 80; page++) {
    await p.waitForTimeout(2500);
    const got = parse(await p.evaluate(() => document.body.innerText)); got.forEach(i => active.push(i));   // no content-based dedupe: identical units at one address are separate listings
    const ids = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href*="listing-detail/"]')].map(a => (a.getAttribute('href').match(/listing-detail\/(\d+)/) || [])[1]))].filter(Boolean));
    ids.forEach(i => allIds.add(i));
    console.log(`page ${page}: parsed ${got.length}, listing links ${ids.length}, parsed so far ${active.length}, link ids so far ${allIds.size}`);
    const clicked = await p.evaluate(n => { const els = [...document.querySelectorAll('li,a,button,span,div')].filter(e => e.children.length === 0 && e.textContent.trim() === String(n + 1) && /pag|page|num/i.test((e.parentElement?.className || '') + (e.className || '') + (e.parentElement?.parentElement?.className || ''))); if (!els.length) return false; els[0].click(); return true; }, page);
    if (!clicked) break;
    await p.waitForTimeout(1500);
  }
  console.log(`active: header says ${header}, parsed ${active.length}, distinct listing links ${allIds.size}`);
  fs.writeFileSync(path.join(OUT, 'active.json'), JSON.stringify(active));

  // 2) Sold records: reuse the request the Lofty /snapshot page makes, but for White Rock
  let tmpl = null, statTmpl = null;
  p.on('request', r => { const u = r.url(); if (/api-site\/snapshot\/listings\?/.test(u) && !tmpl) tmpl = u; if (/api-site\/snapshot\/soldPriceStat\?/.test(u) && !statTmpl) statTmpl = u; });
  await p.goto('https://home-nader.com/snapshot', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(5000);
  if (!tmpl) { console.error('could not find the snapshot listings request'); process.exit(3); }
  const sold = [];
  const cutoff = Date.now() - 15 * 31 * 864e5;
  for (let page = 1; page <= 80; page++) {
    const u = tmpl.replace(/Surrey,%20BC/g, CITY.snap).replace(/page=\d+/, 'page=' + page).replace(/pageSize=\d+/, 'pageSize=100');
    const r = await p.evaluate(async u => { const x = await fetch(u, { credentials: 'include' }); return { s: x.status, t: await x.text() }; }, u);
    let j; try { j = JSON.parse(r.t); } catch (e) { console.error('sold parse failure', r.s); process.exit(3); }
    const L = j.listings || [];
    L.forEach(x => sold.push({ soldPrice: x.soldPrice, soldDate: x.soldDate, listDate: x.listDate, propertyType: x.propertyType, city: x.city }));
    if (L.length < 100) break;
    if (L.length && L[L.length - 1].soldDate && L[L.length - 1].soldDate < cutoff) break;   // newest first; older than the 12-month window plus margin
    await p.waitForTimeout(800);
  }
  console.log('sold records:', sold.length);
  if (statTmpl) {   // Lofty's own monthly statistics, saved so build.py can reconcile against them
    const u = statTmpl.replace(/Surrey,%20BC/g, CITY.snap);
    const r = await p.evaluate(async u => { const x = await fetch(u, { credentials: 'include' }); return await x.text(); }, u);
    try { fs.writeFileSync(path.join(OUT, 'stat.json'), JSON.stringify(JSON.parse(r).data)); } catch (e) { console.error('could not parse soldPriceStat'); }
  }
  fs.writeFileSync(path.join(OUT, 'sold.json'), JSON.stringify(sold));
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ collected: new Date().toISOString(), headerCount: header, activeCollected: active.length, soldRecords: sold.length }));
  await b.close();
  if (header !== active.length || allIds.size < header || allIds.size > header + 5) { console.error(`WARNING: header count ${header} vs parsed ${active.length} / distinct listing links ${allIds.size} (parsed must equal the header; links may exceed it by up to 5 non-card links)`); process.exit(2); }
})();

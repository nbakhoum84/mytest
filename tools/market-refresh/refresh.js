// Collects White Rock active listings and sold records from the live site (Lofty feeds).
// Usage: node refresh.js      (needs Playwright; run from any directory)
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, 'data');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const parse = t => { const out = []; const re = /\$([\d,]+)[^\n]*\n([^\n]+)\n\s*\n?Listed by [^\n]+\n\s*\n?([^\n]+)/g; let m;
  while ((m = re.exec(t))) out.push({ price: +m[1].replace(/,/g, ''), addr: m[2].trim(), type: m[3].trim() }); return out; };

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, userAgent: UA });

  // 1) Active listings: walk every results page of /white-rock-listings
  await p.goto('https://home-nader.com/white-rock-listings', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(3000);
  const header = +(await p.evaluate(() => (document.body.innerText.match(/(\d+)\s+Featured Properties/) || [])[1]));
  const active = new Map();
  for (let page = 1; page <= 40; page++) {
    await p.waitForTimeout(2500);
    parse(await p.evaluate(() => document.body.innerText)).forEach(i => active.set(i.addr, i));
    const clicked = await p.evaluate(n => { const els = [...document.querySelectorAll('li,a,button,span,div')].filter(e => e.children.length === 0 && e.textContent.trim() === String(n + 1) && /pag|page|num/i.test((e.parentElement?.className || '') + (e.className || '') + (e.parentElement?.parentElement?.className || ''))); if (!els.length) return false; els[0].click(); return true; }, page);
    if (!clicked) break;
    await p.waitForTimeout(1500);
  }
  console.log(`active: header says ${header}, collected ${active.size}`);
  fs.writeFileSync(path.join(OUT, 'active.json'), JSON.stringify([...active.values()]));

  // 2) Sold records: reuse the request the Lofty /snapshot page makes, but for White Rock
  let tmpl = null;
  p.on('request', r => { const u = r.url(); if (/api-site\/snapshot\/listings\?/.test(u) && !tmpl) tmpl = u; });
  await p.goto('https://home-nader.com/snapshot', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(5000);
  if (!tmpl) { console.error('could not find the snapshot listings request'); process.exit(3); }
  const sold = [];
  for (let page = 1; page <= 30; page++) {
    const u = tmpl.replace(/Surrey,%20BC/g, 'White%20Rock,%20BC').replace(/page=\d+/, 'page=' + page).replace(/pageSize=\d+/, 'pageSize=100');
    const r = await p.evaluate(async u => { const x = await fetch(u, { credentials: 'include' }); return { s: x.status, t: await x.text() }; }, u);
    let j; try { j = JSON.parse(r.t); } catch (e) { console.error('sold parse failure', r.s); process.exit(3); }
    const L = j.listings || [];
    L.forEach(x => sold.push({ soldPrice: x.soldPrice, soldDate: x.soldDate, listDate: x.listDate, propertyType: x.propertyType, city: x.city }));
    if (L.length < 100) break;
    await p.waitForTimeout(800);
  }
  console.log('sold records:', sold.length);
  fs.writeFileSync(path.join(OUT, 'sold.json'), JSON.stringify(sold));
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ collected: new Date().toISOString(), headerCount: header, activeCollected: active.size, soldRecords: sold.length }));
  await b.close();
  if (header !== active.size) { console.error(`WARNING: header count ${header} != collected ${active.size}`); process.exit(2); }
})();

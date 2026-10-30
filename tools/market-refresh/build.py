#!/usr/bin/env python3
"""Rebuilds the Market snapshot section from data/*.json and writes the live data feed data/market.json.

Usage: python3 build.py [YYYY-MM-DD] [--force]

* The page's Embed code loads data/market.json from GitHub and fills in the numbers automatically (see LOADER below),
  so after the one-time paste of the code, monthly updates need no Lofty login and no re-paste.
* Safety gate: if a headline figure moved more than 25% versus the current market.json, the new figures are written to
  data/market.pending.json instead, nothing else is touched, and the script exits with code 4. Use --force to override.
* Sales window = the 12 complete months ending two months before the run month (the sold feed lags several weeks).
Also rewrites white-rock-listings-improved.html, white-rock-listings-code.txt and white-rock-listings-copy-page.html."""
import json, re, sys, statistics as st, collections, datetime as dt, html, os
from zoneinfo import ZoneInfo
PT = ZoneInfo('America/Los_Angeles')
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
FEED_URL = 'https://raw.githubusercontent.com/nbakhoum84/mytest/claude/practical-wozniak-s89tdk/tools/market-refresh/data/market.json'
args = [a for a in sys.argv[1:] if not a.startswith('--')]; force = '--force' in sys.argv
today = dt.datetime.strptime(args[0], '%Y-%m-%d') if args else dt.datetime.now()
act = json.load(open(f'{HERE}/data/active.json')); sold = json.load(open(f'{HERE}/data/sold.json'))
def addm(d, n):
    y, m = divmod(d.year * 12 + d.month - 1 + n, 12); return dt.datetime(y, m + 1, 1)
end_x = addm(today.replace(day=1), -1); start = addm(end_x, -12); last_full = addm(end_x, -1)
rows = []
for x in sold:
    if not (x.get('listDate') and x.get('soldPrice') and x.get('soldDate')): continue
    # Lofty buckets sales and counts days in Pacific time; doing the same makes monthly counts/medians match Lofty's own statistics exactly.
    ld = dt.datetime.fromtimestamp(x['listDate'] / 1000, dt.UTC).astimezone(PT).replace(tzinfo=None); sd = dt.datetime.fromtimestamp(x['soldDate'] / 1000, dt.UTC).astimezone(PT).replace(tzinfo=None)
    rows.append((sd, (sd.date() - ld.date()).days, x['soldPrice'], x['propertyType']))
win = [r for r in rows if start <= r[0] < end_x]; wd = [r for r in win if r[1] >= 0]
M = lambda n: '${:,.0f}'.format(n)
cnt = collections.Counter(r[0].strftime('%Y-%m') for r in win); med = st.median(cnt.values()) if cnt else 0
lag = [k for k, v in sorted(cnt.items()) if v < 0.6 * med]
for k in lag: print(f'WARNING: {k} has only {cnt[k]} sales (median month {med}); feed may be lagging', file=sys.stderr)
print('window', start.date(), 'to', end_x.date(), '| sales', len(win), '| active', len(act))
KEYS = [('condo', 'Condos', 'Condo'), ('townhome', 'Townhomes', 'Townhouse'), ('sfh', 'Single&#8209;family homes', 'Single Family Home')]
by = collections.defaultdict(list)
for x in act: by[x['type']].append(x['price'])
def stat(key):
    a = by[key]; s = [r for r in win if r[3] == key]; dm = [r[1] for r in s if r[1] >= 0]
    return dict(a=len(a), ma=st.median(a), s=len(s), ms=st.median([r[2] for r in s]), dom=round(st.median(dm)))
T = {k: stat(v) for k, _, v in KEYS}
nA = len(act); medA = st.median([x['price'] for x in act]); nS = len(win); domAll = round(st.median([r[1] for r in wd]))
otherA = nA - sum(v['a'] for v in T.values()); otherS = nS - sum(v['s'] for v in T.values())
sup = lambda a, s: a / (s / 12)
c, f = T['condo'], T['sfh']
asof = f'{today:%B} {today.day}, {today.year}'; monthyr = f'{today:%B %Y}'; w1 = f'{start:%B %Y}'; w2 = f'{last_full:%B %Y}'

# ---- live data feed (strings are what the page displays; _raw is for the safety gate) ----
feed = {'updated': today.strftime('%Y-%m-%d'), 'asOf': asof, 'monthYear': monthyr, 'windowStart': w1, 'windowEnd': w2,
        'active': str(nA), 'medianList': M(medA), 'sold12': str(nS), 'domMedian': str(domAll),
        'perMonth': str(round(nS / 12)), 'supplyAll': str(round(sup(nA, nS))), 'supplyCondo': str(round(sup(c['a'], c['s']))), 'supplySfh': str(round(sup(f['a'], f['s']))),
        'otherActive': str(otherA), 'otherSales': str(otherS)}
for k, _, _ in KEYS:
    v = T[k]; feed.update({f'{k}.active': str(v['a']), f'{k}.medianList': M(v['ma']), f'{k}.sold': str(v['s']), f'{k}.medianSold': M(v['ms']), f'{k}.dom': str(v['dom'])})
feed['_raw'] = {'active': nA, 'medianList': medA, 'sold12': nS, 'domMedian': domAll}
LIVE = f'{HERE}/data/market.json'
if os.path.exists(LIVE) and not force:
    prev = json.load(open(LIVE)).get('_raw', {}); bad = []
    for k, v in feed['_raw'].items():
        if prev.get(k) and abs(v - prev[k]) / prev[k] > 0.25: bad.append(f'{k}: {prev[k]} -> {v}')
    if bad:
        json.dump(feed, open(f'{HERE}/data/market.pending.json', 'w'), indent=1)
        print('SAFETY GATE: headline figures changed by more than 25%:', '; '.join(bad), file=sys.stderr)
        print('Wrote data/market.pending.json; live feed and page files were NOT changed. Review, then re-run with --force.', file=sys.stderr); sys.exit(4)
json.dump(feed, open(LIVE, 'w'), indent=1)
if os.path.exists(f'{HERE}/data/market.pending.json'): os.remove(f'{HERE}/data/market.pending.json')

# ---- static baseline HTML (what shows if JavaScript or the feed is unavailable); data-wr spans are refreshed by the loader ----
S = lambda key, val: f'<span data-wr="{key}">{val}</span>'
kpi = lambda label, key, val: f'        <li><div class="wr-coord">{label}</div><div class="wr-kpi-val">{S(key, val)}</div></li>\n'
kpis = ''.join([kpi('Active listings', 'active', nA), kpi('Median list price', 'medianList', M(medA)), kpi('Sold, past 12 months', 'sold12', nS), kpi('Median days to sell', 'domMedian', domAll)])
def card(i, k, label):
    v = T[k]
    return f'''        <li>
          <div class="wr-coord" aria-hidden="true">0{i}</div>
          <h3>{label}</h3>
          <dl class="wr-facts">
            <div><dt>Active now</dt><dd>{S(k + '.active', v["a"])}</dd></div>
            <div><dt>Median list price</dt><dd>{S(k + '.medianList', M(v["ma"]))}</dd></div>
            <div><dt>Sold, past 12 months</dt><dd>{S(k + '.sold', v["s"])}</dd></div>
            <div><dt>Median sold price</dt><dd>{S(k + '.medianSold', M(v["ms"]))}</dd></div>
            <div><dt>Median days to sell</dt><dd>{S(k + '.dom', v["dom"])}</dd></div>
          </dl>
        </li>
'''
cards = ''.join(card(i + 1, k, label) for i, (k, label, _) in enumerate(KEYS))
LOADER_JS = """/* White Rock market snapshot: fills the numbers marked data-wr from the monthly data feed.
   If the feed or this script is unavailable, the numbers written in the page HTML stay. */
(function () {
  var FEED = '%FEED%';
  var ok = /^[A-Za-z0-9$,.\\- ]{1,40}$/;
  function fill(d) {
    var tries = 0;
    (function go() {
      var els = document.querySelectorAll('[data-wr]');
      if (els.length) {
        for (var i = 0; i < els.length; i++) {
          var v = d[els[i].getAttribute('data-wr')];
          if (v !== undefined && ok.test(String(v))) els[i].textContent = String(v);
        }
      } else if (tries++ < 40) { setTimeout(go, 250); }
    })();
  }
  function run() {
    if (!window.fetch) return;
    fetch(FEED).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { if (d) fill(d); }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
""".replace('%FEED%', FEED_URL)
section = f'''  <!-- MARKET SNAPSHOT: baseline counted {asof}; sales {w1} to {w2}. Numbers marked data-wr refresh from the monthly feed (tools/market-refresh). -->
  <section class="wr-block" aria-labelledby="wr-market-title">
    <div class="wr-wrap">
      <div class="wr-head">
        <div class="wr-eyebrow">Market snapshot</div>
        <h2 id="wr-market-title">White Rock Real Estate Market: {S('monthYear', monthyr)}</h2>
        <p>Active listings as of {S('asOf', asof)}, and sales over the past 12 complete months ({S('windowStart', w1)} to {S('windowEnd', w2)}).</p>
      </div>

      <ul class="wr-neigh wr-neigh-4 wr-kpis">
{kpis}      </ul>

      <ul class="wr-neigh wr-types">
{cards}      </ul>

      <p class="wr-marketnote">About {S('perMonth', round(nS / 12))} homes sold per month over the past year, and half of them sold within {S('domMedian', domAll)} days of listing. Condos are the bulk of the market: {S('condo.sold', c["s"])} of the {S('sold12', nS)} sales and {S('condo.active', c["a"])} of the {S('active', nA)} active listings, with a median sold price of {S('condo.medianSold', M(c["ms"]))} against {S('sfh.medianSold', M(f["ms"]))} for single&#8209;family homes. At the past year's sales pace, today's active listings equal roughly {S('supplyAll', round(sup(nA, nS)))} months of supply overall, about {S('supplyCondo', round(sup(c["a"], c["s"])))} months for condos and about {S('supplySfh', round(sup(f["a"], f["s"])))} for single&#8209;family homes. Supply above about six months generally favours buyers. Want numbers for a specific street or building? <a href="/sell">Ask for a free home valuation</a>, or see the <a href="/latest-market-updates">latest market updates</a> and <a href="/white-rock-sold-listings">recently sold White Rock homes</a>.</p>
      <p class="wr-src">Source: MLS&reg; listing and sold data shown on this site. Active listings were counted on {S('asOf', asof)}. Sales cover {S('windowStart', w1)} to {S('windowEnd', w2)} because sales from the most recent weeks are not yet fully reported. Days to sell is the time from listing date to sale date. The cards leave out {S('otherActive', otherA)} other active listings and {S('otherSales', otherS)} other sales (vacant land, manufactured and multi&#8209;family).</p>
    </div>
  </section>

'''
F = f'{ROOT}/white-rock-listings-improved.html'
s = open(F, encoding='utf8').read()
a = s.index('  <!-- MARKET SNAPSHOT'); b = s.index('  <section class="wr-block" aria-labelledby="wr-neigh-title">')
s = s[:a] + section + s[b:]
open(F, 'w', encoding='utf8').write(s); open(f'{ROOT}/white-rock-listings-code.txt', 'w', encoding='utf8').write(s)
P = f'{ROOT}/white-rock-listings-copy-page.html'
page = open(P, encoding='utf8').read()
page = re.sub(r'<textarea id="c" readonly spellcheck="false">.*?</textarea>', lambda m: '<textarea id="c" readonly spellcheck="false">' + html.escape(s, quote=False) + '</textarea>', page, flags=re.S)
open(P, 'w', encoding='utf8').write(page)
print('updated', F, 'and', LIVE)

open(f'{ROOT}/white-rock-market-loader.txt', 'w', encoding='utf8').write(LOADER_JS)
print('wrote white-rock-market-loader.txt')

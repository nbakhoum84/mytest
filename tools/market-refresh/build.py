#!/usr/bin/env python3
"""Rebuilds the Market snapshot section of a city page from data, and writes that city's live data feed.

Usage: python3 build.py [whiterock|abbotsford|burnaby|coquitlam|delta|langley|newwestminster|portcoquitlam] [YYYY-MM-DD] [--force]      (default city: whiterock; date: today)

* The page's Lofty Page Script (<city>-market-loader.txt) loads the feed from GitHub and fills in every number marked data-wr,
  so after the one-time paste, monthly updates need no Lofty login and no re-paste.
* Safety gate: if a headline figure moved more than 25% versus the current feed, new figures go to market.pending.json,
  nothing else is touched, and the script exits with code 4. Use --force to override.
* Sales window = the 12 complete months ending two months before the run month (the sold feed lags several weeks).
* Sales are bucketed by month in Pacific time, as Lofty does. If data/<city>/stat.json (Lofty's own monthly statistics) exists,
  monthly counts are reconciled against it and differences are reported."""
import json, re, sys, statistics as st, collections, datetime as dt, html, os
from zoneinfo import ZoneInfo
PT = ZoneInfo('America/Los_Angeles')
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
REPO_FEED = 'https://raw.githubusercontent.com/nbakhoum84/mytest/claude/practical-wozniak-s89tdk/tools/market-refresh/data/'
CITIES = {
  'whiterock':  dict(label='White Rock', dir='', slug='white-rock', page='white-rock-listings', loader='white-rock-market-loader.txt',
                     other='vacant land, manufactured and multi&#8209;family'),
  'abbotsford': dict(label='Abbotsford', dir='abbotsford', slug='abbotsford', page='abbotsford-listings', loader='abbotsford-market-loader.txt', other=None),
  'burnaby':    dict(label='Burnaby', dir='burnaby', slug='burnaby', page='burnaby-listings', loader='burnaby-market-loader.txt', other=None),
  'coquitlam':  dict(label='Coquitlam', dir='coquitlam', slug='coquitlam', page='coquitlam-listings', loader='coquitlam-market-loader.txt', other=None),
  'delta':      dict(label='Delta', dir='delta', slug='delta', page='delta-listings', loader='delta-market-loader.txt', other=None),
  'langley':    dict(label='Langley', dir='langley', slug='langley', page='langley-listings', loader='langley-market-loader.txt', other=None),
  'newwestminster': dict(label='New Westminster', dir='newwestminster', slug='new-westminster', page='new-westminster-listings', loader='new-westminster-market-loader.txt', other=None),
  'portcoquitlam': dict(label='Port Coquitlam', dir='portcoquitlam', slug='port-coquitlam', page='port-coquitlam-listings', loader='port-coquitlam-market-loader.txt', other=None),
}
args = [a for a in sys.argv[1:] if not a.startswith('--')]; force = '--force' in sys.argv
city_key = 'whiterock'
if args and args[0] in CITIES: city_key = args.pop(0)
C = CITIES[city_key]; L = C['label']
today = dt.datetime.strptime(args[0], '%Y-%m-%d') if args else dt.datetime.now()
D = os.path.join(HERE, 'data', C['dir'])
FEED_URL = REPO_FEED + (C['dir'] + '/' if C['dir'] else '') + 'market.json'
act = json.load(open(f'{D}/active.json')); sold = json.load(open(f'{D}/sold.json'))
def addm(d, n):
    y, m = divmod(d.year * 12 + d.month - 1 + n, 12); return dt.datetime(y, m + 1, 1)
end_x = addm(today.replace(day=1), -1); start = addm(end_x, -12); last_full = addm(end_x, -1)
rows = []
for x in sold:
    if not (x.get('listDate') and x.get('soldPrice') and x.get('soldDate')): continue
    ld = dt.datetime.fromtimestamp(x['listDate'] / 1000, dt.UTC).astimezone(PT).replace(tzinfo=None); sd = dt.datetime.fromtimestamp(x['soldDate'] / 1000, dt.UTC).astimezone(PT).replace(tzinfo=None)
    rows.append((sd, (sd.date() - ld.date()).days, x['soldPrice'], x['propertyType']))
win = [r for r in rows if start <= r[0] < end_x]; wd = [r for r in win if r[1] >= 0]
M = lambda n: '${:,.0f}'.format(n)
N = lambda n: '{:,}'.format(int(n))
cnt = collections.Counter(r[0].strftime('%Y-%m') for r in win); med = st.median(cnt.values()) if cnt else 0
for k, v in sorted(cnt.items()):
    if v < 0.6 * med: print(f'WARNING: {k} has only {v} sales (median month {med}); feed may be lagging', file=sys.stderr)
# reconcile with Lofty's own monthly statistics, when available
if os.path.exists(f'{D}/stat.json'):
    lof = {r['month']: r for r in json.load(open(f'{D}/stat.json'))}
    allc = collections.Counter(r[0].strftime('%Y-%m') for r in rows)
    ms = [m for m in sorted(lof) if m in cnt]
    diff = sum(abs(allc[m] - lof[m]['count']) for m in ms); tot = sum(lof[m]['count'] for m in ms)
    print(f'reconciliation vs Lofty monthly stats: {len(ms)} months, my sales {sum(allc[m] for m in ms)} vs Lofty {tot}, absolute monthly differences {diff}')
    if tot and diff / tot > 0.03: print(f'WARNING: monthly counts differ from Lofty by {diff/tot:.1%}; investigate before publishing', file=sys.stderr)
print(L, '| window', start.date(), 'to', end_x.date(), '| sales', len(win), '| active', len(act))
MAIN = [('condo', 'Condos', 'Condo'), ('townhome', 'Townhomes', 'Townhouse'), ('sfh', 'Single&#8209;family homes', 'Single Family Home')]
by = collections.defaultdict(list)
for x in act: by[x['type']].append(x['price'])
def stat(key):
    a = by[key]; s = [r for r in win if r[3] == key]; dm = [r[1] for r in s if r[1] >= 0]
    if not a or not s: return dict(a=len(a), ma=st.median(a) if a else 0, s=len(s), ms=st.median([r[2] for r in s]) if s else 0, dom=round(st.median(dm)) if dm else 0)
    return dict(a=len(a), ma=st.median(a), s=len(s), ms=st.median([r[2] for r in s]), dom=round(st.median(dm)))
T = {k: stat(v) for k, _, v in MAIN}
nA = len(act); medA = st.median([x['price'] for x in act]); nS = len(win); domAll = round(st.median([r[1] for r in wd]))
otherA = nA - sum(v['a'] for v in T.values()); otherS = nS - sum(v['s'] for v in T.values())
if C['other'] is None:
    oc = collections.Counter([x['type'] for x in act if x['type'] not in {t for _, _, t in MAIN}] + [r[3] for r in win if r[3] not in {t for _, _, t in MAIN}])
    names = [n.lower().replace('-', '&#8209;') for n, _ in oc.most_common(4)]
    other_text = (', '.join(names[:-1]) + ' and ' + names[-1]) if len(names) > 1 else (names[0] if names else 'other property types')
else: other_text = C['other']
sup = lambda a, s: (a / (s / 12)) if s else 0
top = max(T, key=lambda k: T[k]['s']); cmpk = 'sfh' if top != 'sfh' else 'condo'
labels = {k: lab for k, lab, _ in MAIN}
asof = f'{today:%B} {today.day}, {today.year}'; monthyr = f'{today:%B %Y}'; w1 = f'{start:%B %Y}'; w2 = f'{last_full:%B %Y}'
c, f = T['condo'], T['sfh']

feed = {'updated': today.strftime('%Y-%m-%d'), 'asOf': asof, 'monthYear': monthyr, 'windowStart': w1, 'windowEnd': w2,
        'active': N(nA), 'medianList': M(medA), 'sold12': N(nS), 'domMedian': str(domAll),
        'perMonth': str(round(nS / 12)), 'supplyAll': str(round(sup(nA, nS))), 'supplyCondo': str(round(sup(c['a'], c['s']))), 'supplySfh': str(round(sup(f['a'], f['s']))),
        'otherActive': N(otherA), 'otherSales': N(otherS)}
for k, _, _ in MAIN:
    v = T[k]; feed.update({f'{k}.active': N(v['a']), f'{k}.medianList': M(v['ma']), f'{k}.sold': N(v['s']), f'{k}.medianSold': M(v['ms']), f'{k}.dom': str(v['dom'])})
feed['_raw'] = {'active': nA, 'medianList': medA, 'sold12': nS, 'domMedian': domAll}
LIVE = f'{D}/market.json'; PEND = f'{D}/market.pending.json'
if os.path.exists(LIVE) and not force:
    prev = json.load(open(LIVE)).get('_raw', {}); bad = []
    for k, v in feed['_raw'].items():
        if prev.get(k) and abs(v - prev[k]) / prev[k] > 0.25: bad.append(f'{k}: {prev[k]} -> {v}')
    if bad:
        json.dump(feed, open(PEND, 'w'), indent=1)
        print('SAFETY GATE: headline figures changed by more than 25%:', '; '.join(bad), file=sys.stderr)
        print(f'Wrote {PEND}; live feed and page files were NOT changed. Review, then re-run with --force.', file=sys.stderr); sys.exit(4)
json.dump(feed, open(LIVE, 'w'), indent=1)
if os.path.exists(PEND): os.remove(PEND)

S = lambda key, val: f'<span data-wr="{key}">{val}</span>'
kpi = lambda label, key, val: f'        <div role="listitem"><div class="wr-coord">{label}</div><div class="wr-kpi-val">{S(key, val)}</div></div>\n'
kpis = ''.join([kpi('Active listings', 'active', N(nA)), kpi('Median list price', 'medianList', M(medA)), kpi('Sold, past 12 months', 'sold12', N(nS)), kpi('Median days to sell', 'domMedian', domAll)])
def card(i, k, label):
    v = T[k]
    return f'''        <div role="listitem">
          <div class="wr-coord" aria-hidden="true">0{i}</div>
          <h3>{label}</h3>
          <dl class="wr-facts">
            <div><dt>Active now</dt><dd>{S(k + '.active', N(v["a"]))}</dd></div>
            <div><dt>Median list price</dt><dd>{S(k + '.medianList', M(v["ma"]))}</dd></div>
            <div><dt>Sold, past 12 months</dt><dd>{S(k + '.sold', N(v["s"]))}</dd></div>
            <div><dt>Median sold price</dt><dd>{S(k + '.medianSold', M(v["ms"]))}</dd></div>
            <div><dt>Median days to sell</dt><dd>{S(k + '.dom', v["dom"])}</dd></div>
          </dl>
        </div>
'''
cards = ''.join(card(i + 1, k, label) for i, (k, label, _) in enumerate(MAIN))
LOADER_JS = """/* %LABEL% market snapshot: fills the numbers marked data-wr from the monthly data feed.
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
""".replace('%FEED%', FEED_URL).replace('%LABEL%', L)
topk = top; Ttop = T[topk]; Tc = T[cmpk]
section = f'''  <!-- MARKET SNAPSHOT: baseline counted {asof}; sales {w1} to {w2}. Numbers marked data-wr refresh from the monthly feed (tools/market-refresh). -->
  <section class="wr-block" aria-labelledby="wr-market-title">
    <div class="wr-wrap">
      <div class="wr-head">
        <div class="wr-eyebrow">Market snapshot</div>
        <h2 id="wr-market-title">{L} Real Estate Market: {S('monthYear', monthyr)}</h2>
        <p>Active listings as of {S('asOf', asof)}, and sales over the past 12 complete months ({S('windowStart', w1)} to {S('windowEnd', w2)}).</p>
      </div>

      <div class="wr-neigh wr-neigh-4 wr-kpis" role="list">
{kpis}      </div>

      <div class="wr-neigh wr-types" role="list">
{cards}      </div>

      <p class="wr-marketnote">About {S('perMonth', round(nS / 12))} homes sold per month over the past year, and half of them sold within {S('domMedian', domAll)} days of listing. {labels[topk]} {'are the bulk of the market' if (Ttop['s'] / nS if nS else 0) >= 0.55 else 'are the largest group'}: {S(topk + '.sold', N(Ttop["s"]))} of the {S('sold12', N(nS))} sales and {S(topk + '.active', N(Ttop["a"]))} of the {S('active', N(nA))} active listings, with a median sold price of {S(topk + '.medianSold', M(Ttop["ms"]))} against {S(cmpk + '.medianSold', M(Tc["ms"]))} for {labels[cmpk].lower()}. At the past year's sales pace, today's active listings equal roughly {S('supplyAll', round(sup(nA, nS)))} months of supply overall, about {S('supplyCondo', round(sup(c["a"], c["s"])))} months for condos and about {S('supplySfh', round(sup(f["a"], f["s"])))} for single&#8209;family homes. Supply above about six months generally favours buyers. Want numbers for a specific street or building? <a href="/sell">Ask for a free home valuation</a>, or see the <a href="/latest-market-updates">latest market updates</a> and <a href="/{C['slug']}-sold-listings">recently sold {L} homes</a>.</p>
      <p class="wr-src">Source: MLS&reg; listing and sold data shown on this site. Active listings were counted on {S('asOf', asof)}. Sales cover {S('windowStart', w1)} to {S('windowEnd', w2)} because sales from the most recent weeks are not yet fully reported. Days to sell is the time from listing date to sale date. The cards leave out {S('otherActive', N(otherA))} other active listings and {S('otherSales', N(otherS))} other sales ({other_text}).</p>
    </div>
  </section>

'''
F = f'{ROOT}/{C["page"]}-improved.html'
s = open(F, encoding='utf8').read()
a = s.index('  <!-- MARKET SNAPSHOT') if '  <!-- MARKET SNAPSHOT' in s else s.index('  <section class="wr-block" aria-labelledby="wr-neigh-title">')
b = s.index('  <section class="wr-block" aria-labelledby="wr-neigh-title">')
s = s[:a] + section + s[b:]
open(F, 'w', encoding='utf8').write(s); open(f'{ROOT}/{C["page"]}-code.txt', 'w', encoding='utf8').write(s)
P = f'{ROOT}/{C["page"]}-copy-page.html'
if os.path.exists(P):
    page = open(P, encoding='utf8').read()
    page = re.sub(r'<textarea id="c" readonly spellcheck="false">.*?</textarea>', lambda m: '<textarea id="c" readonly spellcheck="false">' + html.escape(s, quote=False) + '</textarea>', page, flags=re.S)
    open(P, 'w', encoding='utf8').write(page)
open(f'{ROOT}/{C["loader"]}', 'w', encoding='utf8').write(LOADER_JS)
print('updated', F, '| feed', LIVE, '| loader', C['loader'])

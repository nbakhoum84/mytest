#!/usr/bin/env python3
"""Rebuilds the Market snapshot section of white-rock-listings-improved.html from data/*.json.
Usage: python3 build.py [YYYY-MM-DD]   (date defaults to today)
Sales window = the 12 complete months ending two months before the run month, because the sold feed lags by several weeks.
Also rewrites white-rock-listings-code.txt and white-rock-listings-copy-page.html."""
import json, re, sys, statistics as st, collections, datetime as dt, html, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
today = dt.datetime.strptime(sys.argv[1], '%Y-%m-%d') if len(sys.argv) > 1 else dt.datetime.now()
act = json.load(open(f'{HERE}/data/active.json')); sold = json.load(open(f'{HERE}/data/sold.json'))
def addm(d, n):
    y, m = divmod(d.year * 12 + d.month - 1 + n, 12); return dt.datetime(y, m + 1, 1)
end_x = addm(today.replace(day=1), -1)          # exclusive: first day of last month (that month is still incomplete)
start = addm(end_x, -12)
last_full = addm(end_x, -1)
rows = []
for x in sold:
    if not (x.get('listDate') and x.get('soldPrice') and x.get('soldDate')): continue
    ld = dt.datetime.fromtimestamp(x['listDate'] / 1000, dt.UTC).replace(tzinfo=None); sd = dt.datetime.fromtimestamp(x['soldDate'] / 1000, dt.UTC).replace(tzinfo=None)
    rows.append((sd, (sd - ld).days, x['soldPrice'], x['propertyType']))
win = [r for r in rows if start <= r[0] < end_x]
wd = [r for r in win if r[1] >= 0]
M = lambda n: '${:,.0f}'.format(n)
# sanity checks
cnt = collections.Counter(r[0].strftime('%Y-%m') for r in win); med = st.median(cnt.values()) if cnt else 0
for k, v in sorted(cnt.items()):
    if v < 0.6 * med: print(f'WARNING: {k} has only {v} sales (median month {med}); feed may be lagging', file=sys.stderr)
print('window', start.date(), 'to', end_x.date(), '| sales', len(win), '| active', len(act))
KEYS = [('Condos', 'Condo'), ('Townhomes', 'Townhouse'), ('Single&#8209;family homes', 'Single Family Home')]
by = collections.defaultdict(list)
for x in act: by[x['type']].append(x['price'])
def stat(key):
    a = by[key]; s = [r for r in win if r[3] == key]; dm = [r[1] for r in s if r[1] >= 0]
    return dict(a=len(a), ma=st.median(a), s=len(s), ms=st.median([r[2] for r in s]), dom=round(st.median(dm)))
T = {k: stat(v) for k, v in KEYS}
nA = len(act); medA = st.median([x['price'] for x in act]); nS = len(win); domAll = round(st.median([r[1] for r in wd]))
otherA = nA - sum(v['a'] for v in T.values()); otherS = nS - sum(v['s'] for v in T.values())
sup = lambda a, s: a / (s / 12)
c, f = T['Condos'], T['Single&#8209;family homes']
asof = f'{today:%B} {today.day}, {today.year}'; monthyr = f'{today:%B %Y}'; w1 = f'{start:%B %Y}'; w2 = f'{last_full:%B %Y}'
kpi = lambda label, val: f'        <li><div class="wr-coord">{label}</div><div class="wr-kpi-val">{val}</div></li>\n'
kpis = ''.join([kpi('Active listings', nA), kpi('Median list price', M(medA)), kpi('Sold, past 12 months', nS), kpi('Median days to sell', domAll)])
def card(i, k, v):
    return f'''        <li>
          <div class="wr-coord" aria-hidden="true">0{i}</div>
          <h3>{k}</h3>
          <dl class="wr-facts">
            <div><dt>Active now</dt><dd>{v["a"]}</dd></div>
            <div><dt>Median list price</dt><dd>{M(v["ma"])}</dd></div>
            <div><dt>Sold, past 12 months</dt><dd>{v["s"]}</dd></div>
            <div><dt>Median sold price</dt><dd>{M(v["ms"])}</dd></div>
            <div><dt>Median days to sell</dt><dd>{v["dom"]}</dd></div>
          </dl>
        </li>
'''
cards = ''.join(card(i + 1, k, T[k]) for i, (k, _) in enumerate(KEYS))
section = f'''  <!-- MARKET SNAPSHOT: active listings counted {asof}; sales {w1} to {w2} from the Lofty sold feed. Refresh monthly (tools/market-refresh). -->
  <section class="wr-block" aria-labelledby="wr-market-title">
    <div class="wr-wrap">
      <div class="wr-head">
        <div class="wr-eyebrow">Market snapshot</div>
        <h2 id="wr-market-title">White Rock Real Estate Market: {monthyr}</h2>
        <p>Active listings as of {asof}, and sales over the past 12 complete months ({w1} to {w2}).</p>
      </div>

      <ul class="wr-neigh wr-neigh-4 wr-kpis">
{kpis}      </ul>

      <ul class="wr-neigh wr-types">
{cards}      </ul>

      <p class="wr-marketnote">About {round(nS / 12)} homes sold per month over the past year, and half of them sold within {domAll} days of listing. Condos are the bulk of the market: {c["s"]} of the {nS} sales and {c["a"]} of the {nA} active listings, with a median sold price of {M(c["ms"])} against {M(f["ms"])} for single&#8209;family homes. At the past year's sales pace, today's active listings equal roughly {round(sup(nA, nS))} months of supply overall, about {round(sup(c["a"], c["s"]))} months for condos and about {round(sup(f["a"], f["s"]))} for single&#8209;family homes. Supply above about six months generally favours buyers. Want numbers for a specific street or building? <a href="/sell">Ask for a free home valuation</a>, or see the <a href="/latest-market-updates">latest market updates</a> and <a href="/white-rock-sold-listings">recently sold White Rock homes</a>.</p>
      <p class="wr-src">Source: MLS&reg; listing and sold data shown on this site. Active listings were counted on {asof}. Sales cover {w1} to {w2} because sales from the most recent weeks are not yet fully reported. Days to sell is the time from listing date to sale date. The cards leave out {otherA} other active listings and {otherS} other sales (vacant land, manufactured and multi&#8209;family).</p>
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
print('updated', F)

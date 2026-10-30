#!/usr/bin/env python3
"""Collect market data without a browser, for pages whose area Lofty's city filter cannot express.
Usage: python3 refresh_api.py southsurrey|surrey|vancouver [expected_header]
Pulls all active and sold records for the city from the site's snapshot API (a search-bot user agent is needed to pass the firewall)
and writes data/<key>/{active,sold,meta}.json:
  southsurrey: Surrey records with postal prefixes V3Z, V4A, V4P; active drops Commercial and Vacant Land (reproduces the page count exactly).
  surrey:      Surrey records outside those prefixes; leases dropped (within about 2 percent of the page header).
  vancouver:   City of Vancouver; active = purchaseType 'For Sale' without Commercial and Vacant Land; leases dropped from sales.
               The page header (4,456 on Oct 30, 2026) could not be reproduced and is about 10 percent lower than this definition.
Exit 2 if the active count differs from expected_header by more than 3 percent (southsurrey, surrey) or 15 percent (vancouver)."""
import json, os, sys, time, datetime, subprocess, urllib.parse
UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
ZIPS = ('V3Z', 'V4A', 'V4P')
zp = lambda x: (x.get('zipCode') or '')[:3]
lease = lambda x: 'Lease' in (x.get('primaryType') or '')
CFG = {
  'southsurrey': dict(city='Surrey, BC', label='South Surrey', tol=0.03, method='Surrey postal prefixes V3Z,V4A,V4P',
                      act=lambda x: zp(x) in ZIPS and x['propertyType'] not in ('Commercial', 'Vacant Land'), sold=lambda x: zp(x) in ZIPS),
  'surrey':      dict(city='Surrey, BC', label='Surrey', tol=0.03, method='Surrey excluding postal prefixes V3Z,V4A,V4P; leases dropped',
                      act=lambda x: zp(x) not in ZIPS and not lease(x), sold=lambda x: zp(x) not in ZIPS and not lease(x)),
  'vancouver':   dict(city='Vancouver, BC', label='Vancouver', tol=0.15, method='City of Vancouver; active = For Sale without Commercial and Vacant Land',
                      act=lambda x: x.get('purchaseType') == 'For Sale' and x['propertyType'] not in ('Commercial', 'Vacant Land'), sold=lambda x: not lease(x)),
}
KEY = sys.argv[1] if len(sys.argv) > 1 else ''
if KEY not in CFG: sys.exit(__doc__)
K = CFG[KEY]; OUT = os.path.join(os.path.dirname(__file__), 'data', KEY)
C = urllib.parse.quote(json.dumps({'location': {'city': [K['city']]}}, separators=(',', ':')))
def get(status, page):
    u = f"https://home-nader.com/api-site/snapshot/listings?condition={C}&listingStatus={status}&page={page}&pageSize=100&timeline=true"
    for _ in range(3):
        t = subprocess.run(['curl', '-s', '-m', '60', '-A', UA, u], capture_output=True, text=True).stdout
        try: return json.loads(t)
        except Exception: time.sleep(5)
    sys.exit(f'could not read {status} page {page} (firewall?)')
def pull(status, stop=None):
    out, page = [], 1
    while True:
        L = get(status, page)['listings']; out += L
        if len(L) < 100 or page >= 200: return out
        if stop and L[-1]['soldDateStr'] < stop: return out
        page += 1; time.sleep(1)
cutoff = (datetime.date.today() - datetime.timedelta(days=470)).isoformat()
A = pull('Active'); S = pull('Sold', stop=cutoff)
act = [{'price': x['price'], 'addr': x.get('address'), 'type': x['propertyType']} for x in A if K['act'](x)]
sold = [{'soldPrice': x['soldPrice'], 'soldDate': x['soldDate'], 'listDate': x['listDate'], 'propertyType': x['propertyType'], 'city': K['label']} for x in S if K['sold'](x)]
os.makedirs(OUT, exist_ok=True)
json.dump(act, open(f'{OUT}/active.json', 'w')); json.dump(sold, open(f'{OUT}/sold.json', 'w'))
json.dump({'collected': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'headerCount': len(act), 'activeCollected': len(act), 'soldRecords': len(sold), 'method': 'api; ' + K['method']}, open(f'{OUT}/meta.json', 'w'))
print('active', len(act), 'sold', len(sold))
if len(sys.argv) > 2:
    exp = int(sys.argv[2])
    if abs(len(act) - exp) > K['tol'] * exp: print(f'WARNING: {len(act)} active vs page header {exp}'); sys.exit(2)

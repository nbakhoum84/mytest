#!/usr/bin/env python3
"""Collect South Surrey data without a browser (Lofty has no 'South Surrey' city).
Usage: python3 refresh_api.py southsurrey
Pulls all Surrey active and sold records from the site's snapshot API (a search-bot user agent is needed to pass the firewall),
keeps postal prefixes V3Z, V4A and V4P, and drops Commercial and Vacant Land from the active set (this reproduces the
page's own listing count exactly). Writes data/southsurrey/{active,sold,meta}.json. Exit 2 if the count differs from
expected_header (pass it as the second argument, read from the live page header) by more than 3%."""
import json, os, sys, time, datetime, subprocess, urllib.parse
UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
ZIPS = ('V3Z', 'V4A', 'V4P'); OUT = os.path.join(os.path.dirname(__file__), 'data', 'southsurrey')
C = urllib.parse.quote(json.dumps({'location': {'city': ['Surrey, BC']}}, separators=(',', ':')))
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
        if len(L) < 100 or page >= 80: return out
        if stop and L[-1]['soldDateStr'] < stop: return out
        page += 1; time.sleep(1)
if len(sys.argv) < 2 or sys.argv[1] != 'southsurrey': sys.exit(__doc__)
z = lambda x: (x.get('zipCode') or '')[:3]
cutoff = (datetime.date.today() - datetime.timedelta(days=470)).isoformat()
A = pull('Active'); S = pull('Sold', stop=cutoff)
act = [{'price': x['price'], 'addr': x.get('address'), 'type': x['propertyType']} for x in A if z(x) in ZIPS and x['propertyType'] not in ('Commercial', 'Vacant Land')]
sold = [{'soldPrice': x['soldPrice'], 'soldDate': x['soldDate'], 'listDate': x['listDate'], 'propertyType': x['propertyType'], 'city': 'South Surrey'} for x in S if z(x) in ZIPS]
os.makedirs(OUT, exist_ok=True)
json.dump(act, open(f'{OUT}/active.json', 'w')); json.dump(sold, open(f'{OUT}/sold.json', 'w'))
json.dump({'collected': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'headerCount': len(act), 'activeCollected': len(act), 'soldRecords': len(sold), 'method': 'api; Surrey postal prefixes V3Z,V4A,V4P'}, open(f'{OUT}/meta.json', 'w'))
print('active', len(act), 'sold', len(sold))
if len(sys.argv) > 2:
    exp = int(sys.argv[2])
    if abs(len(act) - exp) > 0.03 * exp: print(f'WARNING: {len(act)} active vs page header {exp}'); sys.exit(2)

"""Adds the Save result / Share / Saved bar (web/hn-extras.js) to the Lofty paste-in blocks, inline (they must be self-contained).

Run AFTER build_mortgage_embed.py (which rewrites that file) and whenever web/hn-extras.js changes:
    python3 scripts/add_extras_to_embeds.py
Then paste the updated site-snippet files into their Lofty HTML blocks again. Safe to re-run: it replaces its own block.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
CODE = (ROOT / 'web/hn-extras.js').read_text().strip()
START, END = '<!-- hn-extras:start -->', '<!-- hn-extras:end -->'

# file, prefix of the block's ids/classes, heading tag used inside it
EMBEDS = [('my-home-cost-embed.html', 'mh', 'h2'), ('seller-cost-embed.html', 'sc', 'h2'), ('mortgage-calculator-embed.html', 'mc', 'h2')]

for name, p, head in EMBEDS:
    path = ROOT / 'site-snippet' / name
    html = re.sub(re.escape(START) + r'.*?' + re.escape(END) + r'\n?', '', path.read_text(), flags=re.S).rstrip('\n') + '\n'
    cfg = f"window.HN_EXTRAS_CFG={{sections:'#{p}-app section',row:'.{p}-row',total:'.{p}-total',head:'{head}'}};"
    block = f'{START}\n<script>\n{cfg}\n{CODE}\n</script>\n{END}\n'
    path.write_text(html + block)
    print(f'{name}: added ({len(block):,} characters)')

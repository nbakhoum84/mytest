"""Builds the Lofty paste-ins for the First Home Savings Planner and the Presale Deposit Schedule
(site-snippet/first-home-savings-embed.html and site-snippet/presale-deposits-embed.html) from the web apps,
so the page and the app always show the same thing.

Run after changing web/first-home-savings, web/presale-deposits or web/mortgage-calculator/mortgage.js:
    python3 scripts/build_planner_embeds.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
MATH = (ROOT / 'web/mortgage-calculator/mortgage.js').read_text().replace('export ', '')

APPS = [
    ('first-home-savings', 'savings.js', 'fh', 'First Home Savings Planner'),
    ('presale-deposits', 'deposits.js', 'pd', 'Presale Deposit Schedule'),
]

CSS = '''<style>
  #P-app{--P-accent:#dbae77;--P-border:rgba(128,128,128,.3);--P-card:rgba(128,128,128,.12);--P-muted:rgba(128,128,128,.95);--P-warn:#b91c1c;
    max-width:1300px;margin:0 auto;padding:16px;font-family:inherit;font-size:16px;line-height:1.4;color:inherit;box-sizing:border-box}
  #P-app *{box-sizing:border-box;font-family:inherit}
  #P-app h2{font-size:22px;margin:0 0 16px;color:inherit}
  #P-app h3{font-size:17px;margin:24px 0 4px;color:inherit}
  #P-app label{display:block;color:var(--P-muted);margin:0 0 6px;font-weight:normal}
  #P-app input[type=text],#P-app input[type=date]{width:100%;height:auto;font-size:18px;padding:12px;margin:0 0 16px;border:1px solid var(--P-border);border-radius:8px;background:transparent;color:inherit}
  #P-app .P-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}
  #P-app .P-chips button,#P-app .P-add{border:1px solid var(--P-border);border-radius:8px;padding:10px 14px;background:none;color:inherit;font-size:14px;cursor:pointer;line-height:1.2}
  #P-app .P-add{margin:0 0 16px}
  #P-app .P-chips button.P-on{background:var(--P-accent);border-color:var(--P-accent);color:#111;font-weight:700}
  #P-app .P-dep{display:grid;grid-template-columns:1fr 1fr 44px;gap:8px;align-items:end}
  #P-app .P-dep label{font-size:13px}
  #P-app .P-dep button{height:48px;margin:0 0 16px;border:1px solid var(--P-border);border-radius:8px;background:none;color:var(--P-muted);font-size:20px;cursor:pointer}
  #P-app .P-row{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:0;padding:10px 0;border-bottom:1px solid var(--P-border)}
  #P-app .P-row small{display:block;color:var(--P-muted);font-size:13px}
  #P-app .P-row span:last-child{text-align:right}
  #P-app .P-total{background:var(--P-card);padding:10px;border-radius:8px;margin-top:8px;border:0;color:inherit;font-weight:700;font-size:18px}
  #P-app .P-note{color:var(--P-muted);font-size:12px;margin:8px 0}
  #P-app .P-warn{color:var(--P-warn);font-size:14px}
  #P-app .P-bar{height:10px;background:var(--P-card);border-radius:5px;overflow:hidden;margin:8px 0 16px}
  #P-app .P-bar div{height:100%;background:var(--P-accent)}
  #P-app .P-tabs{display:flex;border-bottom:1px solid var(--P-border);margin-bottom:16px}
  #P-app .P-tabs button{flex:1;padding:12px;border:0;background:none;color:var(--P-muted);font-size:14px;cursor:pointer}
  #P-app .P-tabs button.P-on{background:var(--P-accent);color:#111;font-weight:700}
  #P-app .P-check{display:flex;justify-content:space-between;align-items:center;margin:0 0 16px;padding:10px 0;border-bottom:1px solid var(--P-border);color:inherit}
  #P-app .P-check input{width:22px;height:22px;margin:0;accent-color:var(--P-accent)}
  #P-app ul{padding-left:20px}
  #P-app li{margin-bottom:8px}
  #P-app a{color:inherit}
  #P-app [hidden]{display:none}
</style>
'''


def build(folder, logic, p, name):
    page = (ROOT / 'web' / folder / 'index.html').read_text()
    code = (ROOT / 'web' / folder / logic).read_text()
    code = '\n'.join(l for l in code.splitlines() if not l.startswith('import ')).replace('export ', '')
    main = re.search(r'<main>\n(.*?)</main>', page, re.S).group(1)
    nav = re.search(r'<nav>(.*?)</nav>', page, re.S).group(1)
    script = re.search(r'<script type="module">\n(.*?)</script>', page, re.S).group(1)
    script = '\n'.join(l for l in script.splitlines() if not l.startswith(('import ', "if ('serviceWorker'")))

    # Every id and class gets a prefix so the page's own CSS (e.g. a Bootstrap .row) can't touch it.
    def prefix(s):
        s = re.sub(r'\b(id|for)="', r'\1="%s-' % p, s)
        return re.sub(r'class="([^"$]*)"', lambda m: 'class="%s"' % ' '.join(f'{p}-' + c for c in m.group(1).split()), s)

    main, nav, script = prefix(main), prefix(nav), prefix(script)
    # The Lofty page has its own h1, so headings drop one level.
    main = main.replace('h2>', 'h3>').replace('h1>', 'h2>')
    script = (script
        .replace("'.on'", f"'.{p}-on'").replace("('on'", f"('{p}-on'").replace("'.dep'", f"'.{p}-dep'")
        .replace('class="row${total ? \' total\' : \'\'}"', f'class="{p}-row${{total ? \' {p}-total\' : \'\'}}"')
        .replace('document.getElementById(id)', f"document.getElementById('{p}-' + id)")
        .replace("document.querySelector('nav')", "$('tabs')")
        .replace("document.querySelectorAll('nav button')", "$('tabs').querySelectorAll('button')")
        .replace('  scrollTo(0, 0);\n', '')
        .replace('<h2>', '<h3>').replace('</h2>', '</h3>'))
    for leftover in ("'on'", "'.on'", 'class="row', "querySelector('nav", 'scrollTo('):
        assert leftover not in script, (folder, leftover)

    out = (f'''<!-- {name}: paste into an HTML block on a Lofty page. Self-contained, no external files.
     Generated by scripts/build_planner_embeds.py from web/{folder}; edit those and re-run the script rather than editing this file.
     Everything is scoped to #{p}-app. It inherits your page's font and text colour; the gold accent is --{p}-accent below. -->
''' + CSS.replace('P-', f'{p}-').replace('#P', f'#{p}') + f'''<div id="{p}-app">
  <div class="{p}-tabs" id="{p}-tabs">{nav}</div>
{main}</div>
<script>
(function () {{
{MATH}
{code}
{script}}})();
</script>
''')
    path = ROOT / 'site-snippet' / f'{folder}-embed.html'
    path.write_text(out)
    print(f'wrote {path.relative_to(ROOT)} ({len(out):,} characters)')


for app in APPS:
    build(*app)

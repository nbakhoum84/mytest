/* Save / Share / Saved results for the calculator pages. One shared file, no per-page code:
   it reads the numbers already on the page (inputs and result rows) and adds a button bar under them.
   Results are kept in this browser only (localStorage). Add to a page with: <script src="../hn-extras.js"></script>
   To reuse for another agent, set window.HN_AGENT before loading this file. */
(function () {
  var AGENT = window.HN_AGENT || { name: 'Nader Bakhoum', brokerage: 'eXp Realty', phone: '+1 (604) 612-7228', site: 'home-nader.com' };
  var KEY = 'hn-saved', MAX = 50;

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function store(list) { try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); return true; } catch (e) { return false; } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

  // What the visitor currently sees in a section: inputs (label + value) and result rows.
  function snapshot(section) {
    var title = clean((section.querySelector('h1') || {}).textContent) || clean(document.title);
    var inputs = [], rows = [], value = '', head = '';
    section.querySelectorAll('input[type=text]').forEach(function (el) {
      var lab = el.id && section.querySelector('label[for="' + el.id + '"]');
      if (lab && el.value) inputs.push([clean(lab.textContent), el.value]);
    });
    section.querySelectorAll('.row').forEach(function (r) {
      if (r.hidden || r.closest('[hidden]') || r.querySelector('input')) return;
      var spans = r.querySelectorAll(':scope > span');
      if (spans.length < 2) return;
      var k = clean(spans[0].textContent), v = clean(spans[spans.length - 1].textContent);
      if (!k || !v) return;
      rows.push([k, v]);
      if (!value && r.classList.contains('total')) { head = k; value = v; }
    });
    if (!value && rows.length) { head = rows[0][0]; value = rows[0][1]; }
    return { title: title, head: head, value: value, inputs: inputs, rows: rows, at: Date.now() };
  }

  function toText(s) {
    var out = [s.title + (s.value ? ': ' + s.head + ' ' + s.value : '')];
    if (s.inputs.length) out.push('', 'Inputs'), s.inputs.forEach(function (i) { out.push(i[0] + ': ' + i[1]); });
    if (s.rows.length) out.push('', 'Results'), s.rows.forEach(function (r) { out.push(r[0] + ': ' + r[1]); });
    out.push('', 'Estimate only, not financial advice. Prepared with ' + AGENT.name + ', ' + AGENT.brokerage, AGENT.phone + ' · ' + AGENT.site);
    return out.join('\n');
  }

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'hnx-toast'; t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }

  function share(s) {
    var text = toText(s);
    if (navigator.share) { navigator.share({ title: s.title, text: text }).catch(function () {}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Copied. Paste it into a message or email.'); }, function () { toast('Could not copy'); });
    } else { window.prompt('Copy this result:', text); }
  }

  function panel() {
    var old = document.getElementById('hnx-panel'); if (old) old.remove();
    var list = load();
    var el = document.createElement('div');
    el.id = 'hnx-panel'; el.className = 'hnx-panel';
    el.innerHTML = '<div class="hnx-sheet"><div class="hnx-top"><strong>Saved results</strong><button class="hnx-x" aria-label="Close">×</button></div>' +
      (list.length ? list.map(function (s, i) {
        return '<div class="hnx-item" data-i="' + i + '"><div class="hnx-t">' + esc(s.title) + '</div><div class="hnx-v">' + esc(s.head) + ': ' + esc(s.value) + '</div>' +
          '<div class="hnx-d">' + new Date(s.at).toLocaleDateString('en-CA') + '</div>' +
          '<div class="hnx-det" hidden>' + s.rows.map(function (r) { return '<div><span>' + esc(r[0]) + '</span><span>' + esc(r[1]) + '</span></div>'; }).join('') + '</div>' +
          '<div class="hnx-a"><button data-a="open">Details</button><button data-a="share">Share</button><button data-a="del">Delete</button></div></div>';
      }).join('') : '<p class="hnx-empty">Nothing saved yet. Tap “Save result” under any calculator.</p>') + '</div>';
    el.onclick = function (e) {
      if (e.target === el || e.target.classList.contains('hnx-x')) { el.remove(); return; }
      var b = e.target.closest('button[data-a]'); if (!b) return;
      var item = b.closest('.hnx-item'), i = +item.dataset.i, cur = load();
      if (b.dataset.a === 'open') { var d = item.querySelector('.hnx-det'); d.hidden = !d.hidden; }
      if (b.dataset.a === 'share') share(cur[i]);
      if (b.dataset.a === 'del') { cur.splice(i, 1); store(cur); panel(); refreshCount(); }
    };
    document.body.appendChild(el);
  }

  function refreshCount() {
    var n = load().length;
    document.querySelectorAll('.hnx-count').forEach(function (c) { c.textContent = n ? ' (' + n + ')' : ''; });
  }

  function makeBar(section) {
    var bar = document.createElement('div');
    bar.className = 'hnx-bar';
    bar.innerHTML = '<button data-a="save">Save result</button><button data-a="share">Share</button><button data-a="list">Saved<span class="hnx-count"></span></button>';
    bar.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.a === 'list') { panel(); return; }
      var s = snapshot(section);
      if (b.dataset.a === 'share') { share(s); return; }
      var list = load(); list.unshift(s);
      if (store(list)) {
        b.textContent = 'Saved ✓'; refreshCount();
        if (navigator.vibrate) try { navigator.vibrate(15); } catch (x) {}
        setTimeout(function () { b.textContent = 'Save result'; }, 2000);
      } else toast('Could not save in this browser');
    };
    return bar;
  }

  function install() {
    document.querySelectorAll('main > section').forEach(function (section) {
      if (section.querySelector('.hnx-bar') || !section.querySelector('.row.total')) return;
      var rows = section.querySelectorAll('.row'), last = rows[rows.length - 1], anchor = last;
      while (anchor.parentElement && anchor.parentElement !== section) anchor = anchor.parentElement;
      anchor.after(makeBar(section));
    });
    refreshCount();
  }

  var css = document.createElement('style');
  css.textContent =
    '.hnx-bar{display:flex;gap:8px;margin:14px 0}' +
    '.hnx-bar button{flex:1;padding:12px 8px;border-radius:10px;border:1px solid var(--border,#e5e7eb);background:var(--card,#f3f4f6);color:var(--text,#111827);font:600 14px system-ui,sans-serif;cursor:pointer}' +
    '.hnx-bar button:first-child{background:var(--primary,#0f4c81);border-color:var(--primary,#0f4c81);color:#fff}' +
    '.hnx-panel{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:flex-end;justify-content:center}' +
    '.hnx-sheet{background:var(--bg,#fff);color:var(--text,#111827);width:100%;max-width:560px;max-height:80vh;overflow:auto;border-radius:16px 16px 0 0;padding:16px;font:15px/1.4 system-ui,sans-serif}' +
    '.hnx-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:17px}' +
    '.hnx-x{border:0;background:none;color:inherit;font-size:26px;line-height:1;cursor:pointer}' +
    '.hnx-item{background:var(--card,#f3f4f6);border-radius:12px;padding:12px;margin-bottom:10px}' +
    '.hnx-t{color:var(--muted,#6b7280);font-size:13px}.hnx-v{font-size:19px;font-weight:700;margin-top:2px}.hnx-d{color:var(--muted,#6b7280);font-size:12px;margin-bottom:6px}' +
    '.hnx-det div{display:flex;justify-content:space-between;gap:12px;padding:3px 0;font-size:14px}.hnx-det span:first-child{color:var(--muted,#6b7280)}' +
    '.hnx-a button{border:0;background:none;color:var(--primary,#0f4c81);font-weight:600;padding:8px 14px 8px 0;cursor:pointer}' +
    '.hnx-a button:last-child{color:#b91c1c}.hnx-empty{color:var(--muted,#6b7280)}' +
    '.hnx-toast{position:fixed;left:50%;bottom:84px;transform:translateX(-50%);background:#111827;color:#fff;padding:10px 16px;border-radius:20px;font:14px system-ui,sans-serif;z-index:10000}';
  document.head.appendChild(css);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
  // Pages draw some sections only after a tab opens; look again shortly after load and after taps.
  setTimeout(install, 400);
  document.addEventListener('click', function () { setTimeout(install, 50); });
})();

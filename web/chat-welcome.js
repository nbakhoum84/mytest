// Greeting and quick-answer buttons for Lofty's "Nader's Virtual Assistant" chat on home-nader.com.
// Served from GitHub Pages and loaded by listing-buyer-cost.js (already in Lofty's site-wide code), so nothing new to paste.
// Lofty's assistant only writes after the visitor does, so the window opens empty; this shows a greeting above
// the message box until the conversation starts. A button types its answer into the chat box and sends it, like a visitor would.
(function () {
if (window.hnChatWelcome || innerWidth <= 700) return;
window.hnChatWelcome = true;

var GREETING = 'Hi! Are you looking to buy or sell? And is it a home or a commercial property?';
// Nader (2026-10-22): answer buttons for the greeting's question (not the listing Cash to close / Est. buttons).
var ANSWERS = ['Buy a home', 'Sell a home', 'Buy commercial', 'Sell commercial'];
var CSS = '#hn-chat-welcome{padding:12px 14px;font-family:inherit;box-sizing:border-box}' +
  '#hn-chat-welcome p{margin:0 0 10px;padding:10px 12px;background:#f6efe4;color:#222;border-radius:12px 12px 12px 4px;font-size:14px;line-height:1.4}' +
  '#hn-chat-welcome div{display:flex;flex-wrap:wrap;gap:6px}' +
  '#hn-chat-welcome button{border:1px solid #dbae77;background:#fff;color:#7a5a28;border-radius:16px;padding:6px 12px;font-size:13px;line-height:1.2;cursor:pointer;font-family:inherit}' +
  '#hn-chat-welcome button:hover{background:#dbae77;color:#111}';

function addStyle(doc) {
  if (doc.getElementById('hn-chat-welcome-css')) return;
  var st = doc.createElement('style');
  st.id = 'hn-chat-welcome-css';
  st.textContent = CSS;
  (doc.head || doc.body).appendChild(st);
}

// Type the answer into the chat box the way a visitor would, then send it.
function send(input, text) {
  var proto = input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  input.focus();
  setter.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  setTimeout(function () {
    var row = input.parentElement, btn = null;
    for (var i = 0; i < 3 && row && !btn; i++, row = row.parentElement) {
      var bs = row.querySelectorAll('button,[role="button"]');
      if (bs.length) btn = bs[bs.length - 1];
    }
    if (btn) btn.click();
    else ['keydown', 'keypress', 'keyup'].forEach(function (t) {
      input.dispatchEvent(new KeyboardEvent(t, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    });
  }, 50);
}

// The chat window's text, leaving out buttons, icons and our own greeting.
function chatText(panel) {
  var w = panel.ownerDocument.createTreeWalker(panel, NodeFilter.SHOW_TEXT, null), n, out = '';
  while ((n = w.nextNode())) {
    if (n.parentElement.closest('button,[role="button"],svg,style,script,#hn-chat-welcome')) continue;
    out += ' ' + n.nodeValue;
  }
  return out.replace(/\s+/g, ' ').trim();
}

function check(doc) {
  var inputs = doc.querySelectorAll('input[placeholder],textarea[placeholder]');
  for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    if (!/type a message/i.test(input.getAttribute('placeholder'))) continue;
    // The chat window: the nearest block around the box that carries the assistant's name.
    var panel = input.parentElement;
    while (panel && panel !== doc.body && !/virtual assistant/i.test(panel.textContent)) panel = panel.parentElement;
    if (!panel || panel === doc.body || !input.offsetParent) continue;
    var mine = panel.querySelector('#hn-chat-welcome');
    // More than a few words beyond the window title means the conversation has started.
    var started = chatText(panel).replace(/nader'?s virtual assistant/i, '').trim().length > 15;
    if (started) { if (mine) mine.remove(); continue; }
    if (mine) continue;
    // The message box's own row: climb while the block holds little more than the box.
    var row = input;
    while (row.parentElement && row.parentElement !== panel && row.parentElement.offsetHeight - row.offsetHeight < 60) row = row.parentElement;
    addStyle(doc);
    var box = doc.createElement('div');
    box.id = 'hn-chat-welcome';
    var p = doc.createElement('p');
    p.textContent = GREETING;
    var list = doc.createElement('div');
    ANSWERS.forEach(function (q) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.textContent = q;
      b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); box.remove(); send(input, q); });
      list.appendChild(b);
    });
    box.appendChild(p);
    box.appendChild(list);
    row.parentElement.insertBefore(box, row);
  }
}

function tick() {
  try { check(document); } catch (e) {}
  // The chat may sit in a frame on the same site.
  var frames = document.querySelectorAll('iframe');
  for (var i = 0; i < frames.length; i++) {
    try { if (frames[i].contentDocument && frames[i].contentDocument.body) check(frames[i].contentDocument); } catch (e) {}
  }
}
setInterval(tick, 1000);
})();

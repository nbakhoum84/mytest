// Greeting line for Lofty's "Nader's Virtual Assistant" chat on home-nader.com (text only, no buttons: Nader, 2026-10-22).
// Served from GitHub Pages and loaded by listing-buyer-cost.js (already in Lofty's site-wide code), so nothing new to paste.
// Lofty's assistant only writes after the visitor does, so the window opens empty; this shows a greeting above
// the message box until the conversation starts. It only adds text: it never types, clicks or sends anything.
(function () {
if (window.hnChatWelcome) return;
window.hnChatWelcome = true;

var GREETING = 'Hi! Are you looking to buy or sell? And is it a home or a commercial property?';
var CSS = '#hn-chat-welcome{margin:12px 14px;padding:10px 12px;background:#f6efe4;color:#222;border-radius:12px 12px 12px 4px;font-family:inherit;font-size:14px;line-height:1.4;box-sizing:border-box}';

function addStyle(doc) {
  if (doc.getElementById('hn-chat-welcome-css')) return;
  var st = doc.createElement('style');
  st.id = 'hn-chat-welcome-css';
  st.textContent = CSS;
  (doc.head || doc.body).appendChild(st);
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
    var p = doc.createElement('p');
    p.id = 'hn-chat-welcome';
    p.textContent = GREETING;
    row.parentElement.insertBefore(p, row);
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

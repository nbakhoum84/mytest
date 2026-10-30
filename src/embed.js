// When the web app runs inside the home-nader.com/app page (an iframe), let the page scroll instead of the app:
// the app lays out at its full content height and tells the parent page that height, and the parent sizes the iframe to it.
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

const isEmbedded = () => Platform.OS === 'web' && typeof window !== 'undefined' && window.parent !== window;

const CSS = `
html.hn-embedded,html.hn-embedded body,html.hn-embedded #root{height:auto!important;min-height:0!important;overflow:visible!important}
html.hn-embedded #root div{overflow-y:visible!important}
html.hn-embedded [data-embed="root"]{height:auto!important;flex:none!important}
html.hn-embedded [data-embed="screen"]{flex:none!important;height:auto!important}
`;

export function useEmbedded(tab) {
  const [embedded] = useState(isEmbedded);

  useEffect(() => {
    if (!embedded) return undefined;
    const root = document.documentElement;
    root.classList.add('hn-embedded');
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    let last = 0;
    const send = () => {
      const el = document.getElementById('root');
      const h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight);
      if (h && h !== last) { last = h; window.parent.postMessage({ type: 'hn-app-height', height: h }, '*'); }
    };
    const ro = new ResizeObserver(send);
    ro.observe(document.getElementById('root'));
    const mo = new MutationObserver(send);
    mo.observe(document.getElementById('root'), { childList: true, subtree: true });
    window.addEventListener('load', send);
    send();
    return () => { ro.disconnect(); mo.disconnect(); window.removeEventListener('load', send); style.remove(); root.classList.remove('hn-embedded'); };
  }, [embedded]);

  // After a tab change, ask the page to scroll back up to the top of the app.
  useEffect(() => {
    if (embedded) window.parent.postMessage({ type: 'hn-app-top' }, '*');
  }, [embedded, tab]);

  // The page tells us how far down the app its visible area starts, so the tab bar can stay in view while the page scrolls.
  const [stickyTop, setStickyTop] = useState(0);
  useEffect(() => {
    if (!embedded) return undefined;
    const onMsg = (e) => {
      if (e.source !== window.parent || !e.data || e.data.type !== 'hn-view') return;
      const root = document.getElementById('root');
      const max = Math.max(0, (root ? root.getBoundingClientRect().height : 0) - 56);
      setStickyTop(Math.min(Math.max(0, Math.round(e.data.top)), max));
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: 'hn-app-ready' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, [embedded]);

  return { embedded, stickyTop };
}

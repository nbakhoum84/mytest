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
    const el = document.getElementById('root');
    let last = 0;
    const send = (force) => {
      const h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight);
      if (h && (force || h !== last)) { last = h; window.parent.postMessage({ type: 'hn-app-height', height: h }, '*'); }
    };
    const ro = new ResizeObserver(() => send(false));
    ro.observe(el);
    // The page asks for the height when it loads late; its offset for the tab bar is applied straight to the DOM (no React re-render per scroll).
    const onMsg = (e) => {
      if (e.source !== window.parent || !e.data) return;
      if (e.data.type === 'hn-ping') send(true);
      if (e.data.type === 'hn-view') {
        const tabs = document.querySelector('[data-embed="tabs"]');
        const max = Math.max(0, (el ? el.getBoundingClientRect().height : 0) - 56);
        const y = Math.min(Math.max(0, Math.round(e.data.top)), max);
        if (tabs) tabs.style.transform = y ? `translateY(${y}px)` : '';
      }
    };
    window.addEventListener('message', onMsg);
    window.addEventListener('load', () => send(true));
    send(true);
    window.parent.postMessage({ type: 'hn-app-ready' }, '*');
    return () => { ro.disconnect(); window.removeEventListener('message', onMsg); style.remove(); root.classList.remove('hn-embedded'); };
  }, [embedded]);

  // After a tab change, ask the page to scroll back up to the top of the app.
  useEffect(() => {
    if (embedded) window.parent.postMessage({ type: 'hn-app-top' }, '*');
  }, [embedded, tab]);

  return { embedded };
}

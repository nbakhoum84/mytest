import React, { useEffect, useRef } from 'react';
import { RATEHUB_LOADER } from '../config';

// Web version: the same Ratehub script tag the website uses, placed in a normal page element.
export default function RatehubWidget({ widget }) {
  const holder = useRef(null);

  useEffect(() => {
    const el = holder.current;
    if (!el) return undefined;
    el.innerHTML = '';
    const s = document.createElement('script');
    s.src = RATEHUB_LOADER;
    s.setAttribute('rh-title', widget.title);
    s.setAttribute('rh-frame-title', widget.frameTitle);
    s.setAttribute('rh-widget-key', widget.key);
    s.async = true;
    el.appendChild(s);
    return () => { el.innerHTML = ''; };
  }, [widget]);

  return <div ref={holder} style={{ flex: 1, minHeight: 420, overflowY: 'auto', padding: 8, backgroundColor: '#fff' }} />;
}

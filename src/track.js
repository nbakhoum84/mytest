import { Platform } from 'react-native';

// Button clicks go to Nader's Google Analytics property (Nader-exp), same event names
// as the website (Nader 2026-10-25). Sent straight to GA's collect endpoint; failures are ignored.
const GA_ID = 'G-N9D71PSLL6';
const rand = () => Math.floor(Math.random() * 2147483647);
const CLIENT = `${rand()}.${Math.floor(Date.now() / 1000)}`;
const SESSION = Math.floor(Date.now() / 1000);
let count = 0;

export function track(name, params = {}) {
  try {
    count += 1;
    const q = {
      v: '2', tid: GA_ID, cid: CLIENT, sid: String(SESSION), sct: '1', seg: '1', _s: String(count),
      en: name,
      dl: Platform.OS === 'web' && typeof location !== 'undefined' ? location.href : 'https://home-nader.com/app',
      dt: 'home-nader app',
    };
    const all = { utm_source: 'home-nader app', app_platform: Platform.OS, ...params };
    Object.keys(all).forEach((k) => { if (all[k] !== undefined && all[k] !== '') q[`ep.${k}`] = String(all[k]); });
    const qs = Object.keys(q).map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`).join('&');
    fetch(`https://www.google-analytics.com/g/collect?${qs}`, { method: 'POST', mode: 'no-cors', keepalive: true }).catch(() => {});
  } catch (e) {}
}

// Contact buttons: hn_contact_click with the same tags as the website.
export const trackContact = (kind, where) =>
  track('hn_contact_click', { contact_type: kind, link_location: where, button_text: kind, utm_medium: 'contact_link', utm_campaign: kind, utm_content: where });

export const trackBooking = (where) =>
  track('hn_booking_click', { link_location: where, button_text: 'Book a call', utm_medium: 'booking_link', utm_campaign: 'calendly', utm_content: where });

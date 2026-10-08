export const SITE_URL = 'https://home-nader.com';
export const SITE_HOST = 'home-nader.com';

export const AGENT = {
  name: 'Nader Bakhoum, PMP, P.Eng.',
  brokerage: 'eXp Realty',
  phone: '+16046127228',
  phoneDisplay: '+1 (604) 612-7228',
  email: 'info@home-nader.com',
  address: '7565 132 St, Surrey, BC V3W 1K5',
  whatsapp: 'https://wa.me/qr/2B6Q4SLSEIHYI1',
  calendly: 'https://calendly.com/nbakhoum84/your-future-property',
};

export const CITIES = [
  'Abbotsford', 'Burnaby', 'Coquitlam', 'Delta', 'Langley', 'New Westminster',
  'Port Coquitlam', 'Port Moody', 'Richmond', 'South Surrey', 'Surrey',
  'Vancouver', 'White Rock',
];

const slug = (city) => city.toLowerCase().replace(/\s+/g, '-');

// URL patterns taken from the site's navigation menu (verified for Burnaby;
// other cities are assumed to follow the same pattern).
export const CATEGORIES = [
  { key: 'residential', label: 'Residential', url: (c) => `${SITE_URL}/${slug(c)}-listings` },
  { key: 'commercial', label: 'Commercial', url: (c) => `${SITE_URL}/${slug(c)}` },
  { key: 'presales', label: 'Presales / New', url: (c) => `${SITE_URL}/presales-${slug(c)}` },
  { key: 'sold', label: 'Sold', url: (c) => `${SITE_URL}/${slug(c)}-sold-listings` },
];

export const RESOURCES = [
  { title: 'Buyer’s guide', url: `${SITE_URL}/home-buyers-guide` },
  { title: 'FAQ', url: `${SITE_URL}/faq` },
  { title: 'Blog & market news', url: `${SITE_URL}/blog` },
  { title: 'How to buy a home (PDF)', url: 'https://static.chimeroi.com/servicetool-temp/How%20to%20buy%20a%20home.pdf' },
  { title: 'How to sell a home (PDF)', url: 'https://static.chimeroi.com/servicetool-temp/How%20to%20sell%20a%20home.pdf' },
];

export const COLORS = {
  bg: '#ffffff', text: '#111827', muted: '#6b7280', primary: '#0f4c81',
  card: '#f3f4f6', border: '#e5e7eb',
};

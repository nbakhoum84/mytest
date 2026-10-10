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
  bg: '#ffffff', text: '#14213d', muted: '#6b7280', primary: '#14213d',
  accent: '#dbae77', accentDark: '#b8894f', card: '#f5f3ef', border: '#e7e2d9',
};

// Ratehub.ca widgets, same loader and keys as the website's calculators page.
export const RATEHUB_LOADER = 'https://www.ratehub.ca/scripts/rh-widget-loader.js';
export const RATEHUB = {
  payment: { slug: 'mortgage-payment-calculator', title: 'Mortgage Calculator', frameTitle: 'Ratehub.ca mortgage calculator', key: 'PaymentCalculator' },
  rates: { slug: 'mortgage-rate-comparison-table', title: '', frameTitle: "Ratehub.ca's mortgage comparison table - compare today's best mortgage rates", key: 'ProductTableMortgages' },
  afford: { slug: 'mortgage-affordability-calculator', title: 'Mortgage Affordability Calculator', frameTitle: 'Ratehub.ca mortgage affordability calculator', key: 'AffordabilityCalculator' },
  cmhc: { slug: 'mortgage-cmhc-insurance-calculator', title: 'Mortgage CMHC Calculator', frameTitle: 'Ratehub.ca mortgage cmhc calculator', key: 'DownPaymentCalculator' },
  ptt: { slug: 'mortgage-land-transfer-tax-calculator', title: 'Mortgage Land Transfer Tax Calculator', frameTitle: 'Ratehub.ca land transfer tax calculator', key: 'LandTransferTaxCalculator' },
};
export const CALCULATORS_PAGE = `${SITE_URL}/mortgage-calculators`;


// Header logo (loaded from the web; falls back to the bundled logo if it can't load).
export const LOGO_URL = 'https://cdn.lofty.com/image/fs/400919269340348/website/135866/cmsbuild/2026923_d682dca9df114f5a.jpeg';

// Download links for the app itself (shown at the bottom of the Home tab).
// Paste the Android .apk build link and the iPhone link (TestFlight or Expo Go/Snack) here.
// A button with an empty link shows as "Link coming soon".
export const APP_LINKS = {
  android: '',
  ios: '',
};

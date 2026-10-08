import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// ---- src/config.js
const SITE_URL = 'https://home-nader.com';
const SITE_HOST = 'home-nader.com';

const AGENT = {
  name: 'Nader Bakhoum, PMP, P.Eng.',
  brokerage: 'eXp Realty',
  phone: '+16046127228',
  phoneDisplay: '+1 (604) 612-7228',
  email: 'info@home-nader.com',
  address: '7565 132 St, Surrey, BC V3W 1K5',
  whatsapp: 'https://wa.me/qr/2B6Q4SLSEIHYI1',
  calendly: 'https://calendly.com/nbakhoum84/your-future-property',
};

const CITIES = [
  'Abbotsford', 'Burnaby', 'Coquitlam', 'Delta', 'Langley', 'New Westminster',
  'Port Coquitlam', 'Port Moody', 'Richmond', 'South Surrey', 'Surrey',
  'Vancouver', 'White Rock',
];

const slug = (city) => city.toLowerCase().replace(/\s+/g, '-');

// URL patterns taken from the site's navigation menu (verified for Burnaby;
// other cities are assumed to follow the same pattern).
const CATEGORIES = [
  { key: 'residential', label: 'Residential', url: (c) => `${SITE_URL}/${slug(c)}-listings` },
  { key: 'commercial', label: 'Commercial', url: (c) => `${SITE_URL}/${slug(c)}` },
  { key: 'presales', label: 'Presales / New', url: (c) => `${SITE_URL}/presales-${slug(c)}` },
  { key: 'sold', label: 'Sold', url: (c) => `${SITE_URL}/${slug(c)}-sold-listings` },
];

const RESOURCES = [
  { title: 'Buyer’s guide', url: `${SITE_URL}/home-buyers-guide` },
  { title: 'FAQ', url: `${SITE_URL}/faq` },
  { title: 'Blog & market news', url: `${SITE_URL}/blog` },
  { title: 'How to buy a home (PDF)', url: 'https://static.chimeroi.com/servicetool-temp/How%20to%20buy%20a%20home.pdf' },
  { title: 'How to sell a home (PDF)', url: 'https://static.chimeroi.com/servicetool-temp/How%20to%20sell%20a%20home.pdf' },
];

const COLORS = {
  bg: '#ffffff', text: '#14213d', muted: '#6b7280', primary: '#14213d',
  accent: '#dbae77', accentDark: '#b8894f', card: '#f5f3ef', border: '#e7e2d9',
};

// Ratehub.ca widgets, same loader and keys as the website's calculators page.
const RATEHUB_LOADER = 'https://www.ratehub.ca/scripts/rh-widget-loader.js';
const RATEHUB = {
  payment: { slug: 'mortgage-payment-calculator', title: 'Mortgage Calculator', frameTitle: 'Ratehub.ca mortgage calculator', key: 'PaymentCalculator' },
  rates: { slug: 'mortgage-rate-comparison-table', title: '', frameTitle: "Ratehub.ca's mortgage comparison table - compare today's best mortgage rates", key: 'ProductTableMortgages' },
  afford: { slug: 'mortgage-affordability-calculator', title: 'Mortgage Affordability Calculator', frameTitle: 'Ratehub.ca mortgage affordability calculator', key: 'AffordabilityCalculator' },
  cmhc: { slug: 'mortgage-cmhc-insurance-calculator', title: 'Mortgage CMHC Calculator', frameTitle: 'Ratehub.ca mortgage cmhc calculator', key: 'DownPaymentCalculator' },
  ptt: { slug: 'mortgage-land-transfer-tax-calculator', title: 'Mortgage Land Transfer Tax Calculator', frameTitle: 'Ratehub.ca land transfer tax calculator', key: 'LandTransferTaxCalculator' },
};
const CALCULATORS_PAGE = `${SITE_URL}/mortgage-calculators`;

// Banner photo on the Home tab (loaded from the web; replace with a bundled file for production).
const HERO_IMAGE = 'https://www.bucketlistpublications.com/wp-content/uploads/2012/08/Downtown-Vancouver.jpg';

// ---- src/logo.js
const LOGO = { uri: 'data:image/png;base64,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' };

// ---- src/calc.js
// Pure calculator math (no React). Canadian fixed-rate mortgages compound semi-annually.

const num = (s) => parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;

const monthlyRate = (annualPct) => Math.pow(1 + annualPct / 100 / 2, 2 / 12) - 1;

function pmt(principal, annualPct, years) {
  const n = Math.round(years * 12);
  if (principal <= 0 || n <= 0) return 0;
  if (annualPct <= 0) return principal / n;
  const r = monthlyRate(annualPct);
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

function balanceAfter(principal, annualPct, years, months) {
  const n = Math.round(years * 12);
  if (principal <= 0 || n <= 0) return 0;
  const m = Math.min(months, n);
  if (annualPct <= 0) return principal * (1 - m / n);
  const r = monthlyRate(annualPct);
  const p = pmt(principal, annualPct, years);
  return Math.max(principal * Math.pow(1 + r, m) - (p * (Math.pow(1 + r, m) - 1)) / r, 0);
}

// One row per year: interest paid, principal paid, ending balance.
function yearlySchedule(principal, annualPct, years) {
  const rows = [];
  let prev = principal;
  for (let y = 1; y <= years; y++) {
    const bal = balanceAfter(principal, annualPct, years, y * 12);
    const paid = pmt(principal, annualPct, years) * 12;
    const principalPaid = prev - bal;
    rows.push({ year: y, principal: principalPaid, interest: Math.max(paid - principalPaid, 0), balance: bal });
    prev = bal;
  }
  return rows;
}

// Turns a down payment entered as $ or % into dollars.
const downInDollars = (price, value, mode) => (mode === '%' ? (price * value) / 100 : value);

// ---- CMHC mortgage default insurance ---------------------------------------
// Rules as of the Dec 2024 changes; verify against CMHC before relying on them.
const CMHC = {
  maxInsuredPrice: 1500000,
  minDownTier1: 0.05, // on first $500k
  minDownTier2: 0.10, // on $500k to $1.5M
  longAmortSurcharge: 0.20, // % added when amortization is over 25 years
};

function minimumDown(price) {
  if (price <= 500000) return price * CMHC.minDownTier1;
  if (price < CMHC.maxInsuredPrice) return 500000 * CMHC.minDownTier1 + (price - 500000) * CMHC.minDownTier2;
  return price * 0.2;
}

function cmhcInsurance({ price, down, amortYears }) {
  const loan = Math.max(price - down, 0);
  const downPct = price > 0 ? (down / price) * 100 : 0;
  const res = { loan, downPct, minDown: minimumDown(price), ratePct: 0, premium: 0, total: loan, status: 'ok', message: '' };
  if (price <= 0) return res;
  if (downPct >= 20) { res.message = 'Down payment is 20% or more, so mortgage insurance is not required.'; return res; }
  if (price >= CMHC.maxInsuredPrice) { res.status = 'blocked'; res.message = 'Homes at $1.5M or more need at least 20% down (not insurable).'; return res; }
  if (down < res.minDown) { res.status = 'blocked'; res.message = `Minimum down payment for this price is $${Math.round(res.minDown).toLocaleString('en-CA')}.`; return res; }
  let rate = downPct >= 15 ? 2.8 : downPct >= 10 ? 3.1 : 4.0;
  if (amortYears > 25) rate += CMHC.longAmortSurcharge;
  res.ratePct = rate;
  res.premium = (loan * rate) / 100;
  res.total = loan + res.premium;
  return res;
}

// ---- BC Property Transfer Tax ---------------------------------------------
// Rates and exemption thresholds as of 2024; they change, so verify with the BC government.
const BC_PTT = {
  tiers: [ // [upper bound, rate]
    [200000, 0.01],
    [2000000, 0.02],
    [3000000, 0.03],
    [Infinity, 0.05], // 3% + 2% additional on residential value above $3M
  ],
  firstTimeFull: 835000,
  firstTimePartialTo: 860000,
  newBuildFull: 1100000,
  newBuildPartialTo: 1150000,
};

function bcTransferTax({ price, firstTime, newBuild }) {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of BC_PTT.tiers) {
    if (price > lower) tax += (Math.min(price, upper) - lower) * rate;
    lower = upper;
  }
  const full = tax;
  let payable = tax;
  let note = '';
  const exempt = (fullUpTo, partialTo, label) => {
    if (price <= fullUpTo) return { payable: 0, note: `${label} exemption applies: no transfer tax.` };
    if (price < partialTo) return { payable: (tax * (price - fullUpTo)) / (partialTo - fullUpTo), note: `Partial ${label.toLowerCase()} exemption applies.` };
    return null;
  };
  const options = [];
  if (firstTime) options.push(exempt(BC_PTT.firstTimeFull, BC_PTT.firstTimePartialTo, 'First-time buyer'));
  if (newBuild) options.push(exempt(BC_PTT.newBuildFull, BC_PTT.newBuildPartialTo, 'Newly built home'));
  for (const o of options) if (o && o.payable < payable) { payable = o.payable; note = o.note; }
  return { full, payable, note };
}

// ---- Affordability -----------------------------------------------------------
// Uses common lender limits: GDS 39% and TDS 44%, qualified at max(rate + 2, 5.25%).
const AFFORD = { gds: 0.39, tds: 0.44, stressAdd: 2, stressFloor: 5.25, hoaShare: 0.5 };

function affordability({ income, down, debts, years, ratePct, taxRatePct, insurance, hoa }) {
  const monthlyIncome = income / 12;
  const qualRate = Math.max(ratePct + AFFORD.stressAdd, AFFORD.stressFloor);
  const f = pmt(1, qualRate, years); // payment per $1 of loan at the qualifying rate
  const t = taxRatePct / 100 / 12; // monthly property tax per $1 of price
  const limit = Math.min(AFFORD.gds * monthlyIncome, AFFORD.tds * monthlyIncome - debts);
  const fixed = insurance / 12 + hoa * AFFORD.hoaShare;
  const loan = Math.max((limit - fixed - t * down) / (f + t), 0);
  const price = loan > 0 ? loan + down : 0;
  const payment = pmt(loan, ratePct, years);
  const tax = (price * taxRatePct) / 100 / 12;
  const qualHousing = loan * f + tax + fixed;
  return {
    qualRate, loan, price,
    payment, tax, insurance: insurance / 12, hoa, total: payment + tax + insurance / 12 + hoa,
    gdsPct: monthlyIncome > 0 ? (qualHousing / monthlyIncome) * 100 : 0,
    tdsPct: monthlyIncome > 0 ? ((qualHousing + debts) / monthlyIncome) * 100 : 0,
  };
}

// ---- src/components/Inputs.js

const money = (v) => '$' + Math.round(v || 0).toLocaleString('en-CA');

function Field({ label, value, onChange, suffix }) {
  return (
    <View style={inputsStyles.field}>
      {label ? <Text style={inputsStyles.label}>{label}</Text> : null}
      <TextInput style={inputsStyles.input} value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder={suffix} />
    </View>
  );
}

// Amount entered either in dollars or as a percentage of the price.
function DownField({ value, onChange, mode, onMode }) {
  return (
    <View style={inputsStyles.field}>
      <View style={inputsStyles.row}>
        <Text style={inputsStyles.label}>Down payment</Text>
        <Chips options={['$', '%']} value={mode} onChange={onMode} />
      </View>
      <TextInput style={inputsStyles.input} value={value} onChangeText={onChange} keyboardType="decimal-pad" />
    </View>
  );
}

function Chips({ options, value, onChange }) {
  return (
    <View style={inputsStyles.chips}>
      {options.map((o) => (
        <TouchableOpacity key={String(o)} onPress={() => onChange(o)} style={[inputsStyles.chip, o === value && inputsStyles.chipOn]}>
          <Text style={[inputsStyles.chipText, o === value && inputsStyles.chipTextOn]}>{String(o)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Pick({ label, options, value, onChange }) {
  return (
    <View style={inputsStyles.field}>
      <Text style={inputsStyles.label}>{label}</Text>
      <Chips options={options} value={value} onChange={onChange} />
    </View>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <TouchableOpacity style={inputsStyles.toggle} onPress={() => onChange(!value)}>
      <View style={[inputsStyles.box, value && inputsStyles.boxOn]}>{value ? <Text style={inputsStyles.tick}>✓</Text> : null}</View>
      <Text style={inputsStyles.toggleText}>{label}</Text>
    </TouchableOpacity>
  );
}

function Result({ title, value, lines = [], tone }) {
  return (
    <View style={[inputsStyles.result, tone === 'warn' && { backgroundColor: '#9a3412' }]}>
      <Text style={inputsStyles.resultLabel}>{title}</Text>
      <Text style={inputsStyles.resultValue}>{value}</Text>
      {lines.map((l, i) => <Text key={i} style={inputsStyles.resultSub}>{l}</Text>)}
    </View>
  );
}

function Breakdown({ rows }) {
  return (
    <View style={inputsStyles.breakdown}>
      {rows.map(([k, v, bold]) => (
        <View key={k} style={inputsStyles.brow}>
          <Text style={[inputsStyles.bkey, bold && inputsStyles.bold]}>{k}</Text>
          <Text style={[inputsStyles.bval, bold && inputsStyles.bold]}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

const Note = ({ children }) => <Text style={inputsStyles.note}>{children}</Text>;

const inputsStyles = StyleSheet.create({
  field: { marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: COLORS.muted, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, marginRight: 8, marginBottom: 6 },
  chipOn: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.text },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  toggle: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  boxOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tick: { color: '#fff', fontWeight: '700' },
  toggleText: { color: COLORS.text, fontSize: 16, flex: 1 },
  result: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, marginTop: 8, marginBottom: 12 },
  resultLabel: { color: '#dbeafe' },
  resultValue: { color: '#fff', fontSize: 34, fontWeight: '700', marginVertical: 4 },
  resultSub: { color: '#dbeafe', marginTop: 2 },
  breakdown: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 12 },
  brow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  bkey: { color: COLORS.muted },
  bval: { color: COLORS.text },
  bold: { fontWeight: '700', color: COLORS.text },
  note: { color: COLORS.muted, fontSize: 12, marginTop: 4, marginBottom: 12 },
});

// ---- src/components/RatehubWidget.js

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Same script tag the website uses, loaded from the website's origin so Ratehub
// sees the same domain as on home-nader.com.
const widgetHtml = (w) => `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>html,body{margin:0;padding:8px;font-family:-apple-system,Roboto,sans-serif;background:#fff}</style>
</head><body>
<script src="${RATEHUB_LOADER}" rh-title="${esc(w.title)}" rh-frame-title="${esc(w.frameTitle)}" rh-widget-key="${esc(w.key)}" async></script>
</body></html>`;

function RatehubWidget({ widget }) {
  const [loading, setLoading] = useState(true);
  const source = useMemo(() => ({ html: widgetHtml(widget), baseUrl: SITE_URL }), [widget]);

  // Widget iframes load inside the page; anything that tries to navigate the whole
  // page elsewhere (e.g. a "compare rates" link) opens in the in-app browser instead.
  const onShouldStart = (req) => {
    if (req.isTopFrame === false) return true;
    const url = req.url || '';
    if (url === 'about:blank' || url === SITE_URL || url === SITE_URL + '/') return true;
    WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url).catch(() => Alert.alert('Could not open the page', url)));
    return false;
  };

  return (
    <View style={rhStyles.root}>
      <WebView
        key={widget.key}
        source={source}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={onShouldStart}
        onLoadEnd={() => setLoading(false)}
        style={rhStyles.web}
      />
      {loading && <ActivityIndicator style={rhStyles.loader} size="large" />}
    </View>
  );
}

const rhStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  web: { flex: 1, backgroundColor: COLORS.bg },
  loader: { position: 'absolute', top: '40%', alignSelf: 'center' },
});

// ---- src/screens/HomeScreen.js

const POPULAR = ['Vancouver', 'Burnaby', 'Surrey', 'Richmond', 'Coquitlam', 'White Rock', 'Langley', 'Delta'];
const residential = CATEGORIES[0];

function HomeScreen({ goTo, openWeb }) {
  return (
    <ScrollView contentContainerStyle={homeStyles.pad} showsVerticalScrollIndicator={false}>
      {/* Top bar */}
      <View style={homeStyles.topBar}>
        <Image source={LOGO} style={homeStyles.logo} resizeMode="contain" />
        <Text style={homeStyles.name}>Home-Nader</Text>
      </View>

      {/* Hero */}
      <View style={homeStyles.hero}>
        <Image source={{ uri: HERO_IMAGE }} style={homeStyles.heroImage} resizeMode="cover" blurRadius={2} />
        <View style={homeStyles.heroTint} pointerEvents="none" />
        <View style={homeStyles.heroContent}>
        <Text style={homeStyles.eyebrow}>METRO VANCOUVER REAL ESTATE</Text>
        <Text style={homeStyles.h1}>Find your dream home</Text>
        <Text style={homeStyles.sub}>Homes, condos and presales across Metro Vancouver.</Text>
        <View style={homeStyles.heroBtns}>
          <TouchableOpacity style={homeStyles.btnGold} onPress={() => goTo('browse')}>
            <Text style={homeStyles.btnGoldText}>Browse</Text>
          </TouchableOpacity>
          <TouchableOpacity style={homeStyles.btnGhost} onPress={() => openWeb(AGENT.calendly)}>
            <Text style={homeStyles.btnGhostText}>Book a call</Text>
          </TouchableOpacity>
        </View>
        </View>
      </View>

      {/* Popular cities */}
      <Text style={homeStyles.h2}>Popular areas</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {POPULAR.map((c) => (
          <TouchableOpacity key={c} style={homeStyles.pill} onPress={() => openWeb(residential.url(c))}>
            <Text style={homeStyles.pillText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Property types */}
      <Text style={homeStyles.h2}>Explore properties</Text>
      <View style={homeStyles.grid}>
        {[
          ['Residential', 'Homes, condos and townhouses'],
          ['Commercial', 'Retail, office and industrial'],
          ['Presales', 'New and under construction'],
          ['Sold', 'Recent sales and market history'],
        ].map(([t, d]) => (
          <TouchableOpacity key={t} style={homeStyles.gridCard} onPress={() => goTo('browse')}>
            <View style={homeStyles.rule} />
            <Text style={homeStyles.cardTitle}>{t}</Text>
            <Text style={homeStyles.cardDesc}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tools */}
      <Text style={homeStyles.h2}>Tools & guides</Text>
      <TouchableOpacity style={homeStyles.listRow} onPress={() => goTo('calc')}>
        <View style={{ flex: 1 }}>
          <Text style={homeStyles.cardTitle}>Mortgage calculators</Text>
          <Text style={homeStyles.cardDesc}>Payment, affordability, rates, CMHC and land transfer tax</Text>
        </View>
        <Text style={homeStyles.chev}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={homeStyles.listRow} onPress={() => goTo('more')}>
        <View style={{ flex: 1 }}>
          <Text style={homeStyles.cardTitle}>Buyer’s guide & resources</Text>
          <Text style={homeStyles.cardDesc}>Guides, FAQ, market news and blog</Text>
        </View>
        <Text style={homeStyles.chev}>›</Text>
      </TouchableOpacity>

      {/* Contact */}
      <View style={homeStyles.contact}>
        <Text style={homeStyles.contactTitle}>Let’s talk</Text>
        <Text style={homeStyles.contactSub}>Free consultation on buying, selling and investing.</Text>
        <View style={homeStyles.contactRow}>
          <ContactBtn label="Call" onPress={() => Linking.openURL(`tel:${AGENT.phone}`)} />
          <ContactBtn label="WhatsApp" onPress={() => Linking.openURL(AGENT.whatsapp)} />
          <ContactBtn label="Email" onPress={() => Linking.openURL(`mailto:${AGENT.email}`)} />
        </View>
      </View>

      <Text style={homeStyles.footer}>{AGENT.brokerage} · {AGENT.address}</Text>
      <Text style={homeStyles.footer}>Listing information is deemed reliable but not guaranteed.</Text>
    </ScrollView>
  );
}

function ContactBtn({ label, onPress }) {
  return (
    <TouchableOpacity style={homeStyles.contactBtn} onPress={onPress}>
      <Text style={homeStyles.contactBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const homeStyles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logo: { width: 56, height: 56, marginRight: 12 },
  name: { fontSize: 24, fontWeight: '700', color: COLORS.text, letterSpacing: 0.3 },

  hero: { backgroundColor: COLORS.primary, borderRadius: 20, marginBottom: 8, overflow: 'hidden' },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,20,40,0.90)' },
  heroContent: { padding: 18 },
  eyebrow: { color: '#f0c98f', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6 },
  h1: { color: '#fff', fontSize: 26, fontWeight: '700', lineHeight: 30, textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  sub: { color: '#ffffff', fontSize: 14, lineHeight: 20, marginTop: 6 },
  heroBtns: { flexDirection: 'row', marginTop: 14 },
  btnGold: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 11, alignItems: 'center', marginRight: 8 },
  btnGoldText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  btnGhost: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  btnGhostText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  h2: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 26, marginBottom: 12 },
  pill: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  pillText: { color: COLORS.text, fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: { width: '48.5%', backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  rule: { width: 28, height: 3, borderRadius: 2, backgroundColor: COLORS.accent, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  cardDesc: { fontSize: 13, color: COLORS.muted, marginTop: 4, lineHeight: 18 },

  listRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  chev: { fontSize: 26, color: COLORS.accentDark, marginLeft: 8 },

  contact: { backgroundColor: COLORS.card, borderRadius: 18, padding: 20, marginTop: 18, borderWidth: 1, borderColor: COLORS.border },
  contactTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  contactSub: { color: COLORS.muted, marginTop: 4, marginBottom: 14 },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between' },
  contactBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginHorizontal: 4 },
  contactBtnText: { color: '#fff', fontWeight: '600' },

  footer: { textAlign: 'center', color: COLORS.muted, fontSize: 12, marginTop: 14 },
});

// ---- src/screens/BrowseScreen.js

function BrowseScreen({ openWeb }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [query, setQuery] = useState('');
  const cities = CITIES.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <View style={browseStyles.root}>
      <View style={browseStyles.chips}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.key} onPress={() => setCategory(cat)}
            style={[browseStyles.chip, cat.key === category.key && browseStyles.chipOn]}>
            <Text style={[browseStyles.chipText, cat.key === category.key && browseStyles.chipTextOn]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput style={browseStyles.search} placeholder="Search city" value={query} onChangeText={setQuery} />
      <FlatList
        data={cities}
        keyExtractor={(c) => c}
        ListEmptyComponent={<Text style={browseStyles.empty}>No matching city.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={browseStyles.row} onPress={() => openWeb(category.url(item), `${item} · ${category.label}`)}>
            <Text style={browseStyles.rowText}>{item}</Text>
            <Text style={browseStyles.arrow}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const browseStyles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.text },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  search: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowText: { fontSize: 16, color: COLORS.text },
  arrow: { fontSize: 20, color: COLORS.muted },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 24 },
});

// ---- src/screens/CalculatorsScreen.js

const TERMS = [10, 15, 20, 25, 30, 40];

const LIST = [
  { key: 'payment', title: 'Mortgage payment', desc: 'Monthly payment with tax, insurance and fees', Comp: PaymentCalc },
  { key: 'afford', title: 'Affordability', desc: 'How much home can you afford on your income?', Comp: AffordCalc },
  { key: 'rates', title: 'Rate comparison', desc: 'Compare mortgage rates side by side', Comp: RatesCalc },
  { key: 'cmhc', title: 'CMHC insurance', desc: 'Mortgage default insurance premium', Comp: CmhcCalc },
  { key: 'ptt', title: 'Land transfer tax (BC)', desc: 'BC Property Transfer Tax', Comp: TransferTaxCalc },
];

function CalculatorsScreen({ goTo }) {
  const [active, setActive] = useState(null);
  const [mode, setMode] = useState('Ratehub');
  const item = LIST.find((l) => l.key === active);

  if (!item) {
    return (
      <ScrollView contentContainerStyle={calcsStyles.pad}>
        {LIST.map((l) => (
          <TouchableOpacity key={l.key} style={calcsStyles.tile} onPress={() => { setMode('Ratehub'); setActive(l.key); }}>
            <Text style={calcsStyles.tileTitle}>{l.title}</Text>
            <Text style={calcsStyles.tileDesc}>{l.desc}</Text>
          </TouchableOpacity>
        ))}
        <Note>Calculators by Ratehub.ca. Estimates only; confirm figures with your lender.</Note>
      </ScrollView>
    );
  }
  const { Comp } = item;
  const widget = RATEHUB[item.key];
  return (
    <View style={{ flex: 1 }}>
      <View style={calcsStyles.head}>
        <TouchableOpacity onPress={() => setActive(null)} hitSlop={10}><Text style={calcsStyles.back}>‹ All calculators</Text></TouchableOpacity>
        <Chips options={['Ratehub', 'Quick']} value={mode} onChange={setMode} />
      </View>
      {mode === 'Ratehub' ? (
        <View style={{ flex: 1 }}>
          <RatehubWidget widget={widget} />
          <TouchableOpacity style={calcsStyles.siteLink} onPress={() => WebBrowser.openBrowserAsync(`${CALCULATORS_PAGE}#${widget.slug}`)}>
            <Text style={calcsStyles.linkText}>Not loading? Open on the website</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={calcsStyles.pad} keyboardShouldPersistTaps="handled">
          <Text style={calcsStyles.h1}>{item.title}</Text>
          <Comp goTo={goTo} />
        </ScrollView>
      )}
    </View>
  );
}

function PaymentCalc() {
  const [price, setPrice] = useState('1200000');
  const [down, setDown] = useState('20');
  const [mode, setMode] = useState('%');
  const [years, setYears] = useState(25);
  const [rate, setRate] = useState('4.5');
  const [tax, setTax] = useState('3600');
  const [taxMode, setTaxMode] = useState('$');
  const [ins, setIns] = useState('1200');
  const [hoa, setHoa] = useState('0');
  const [showSched, setShowSched] = useState(false);

  const p = num(price);
  const d = Math.min(downInDollars(p, num(down), mode), p);
  const loan = Math.max(p - d, 0);
  const pi = pmt(loan, num(rate), years);
  const taxMonthly = (taxMode === '%' ? (p * num(tax)) / 100 : num(tax)) / 12;
  const total = pi + taxMonthly + num(ins) / 12 + num(hoa);
  const interest = pi * years * 12 - loan;

  return (
    <View>
      <Field label="Home price ($)" value={price} onChange={setPrice} />
      <DownField value={down} onChange={setDown} mode={mode} onMode={setMode} />
      <Pick label="Loan term (years)" options={TERMS} value={years} onChange={setYears} />
      <Field label="Interest rate (%)" value={rate} onChange={setRate} />
      <View style={calcsStyles.rowBetween}>
        <Text style={calcsStyles.small}>Property tax per year</Text>
        <Chips options={['$', '%']} value={taxMode} onChange={setTaxMode} />
      </View>
      <Field label="" value={tax} onChange={setTax} />
      <Field label="Home insurance ($ / year)" value={ins} onChange={setIns} />
      <Field label="Condo / HOA fees ($ / month)" value={hoa} onChange={setHoa} />

      <Result title="Estimated monthly payment" value={money(total)} lines={[`Mortgage: ${money(loan)} · Total interest: ${money(Math.max(interest, 0))}`]} />
      <Breakdown rows={[
        ['Principal & interest', money(pi)],
        ['Property tax', money(taxMonthly)],
        ['Home insurance', money(num(ins) / 12)],
        ['Condo / HOA fees', money(num(hoa))],
        ['Total per month', money(total), true],
        [`Total over ${years} years`, money(total * years * 12), true],
      ]} />
      <TouchableOpacity style={calcsStyles.linkBtn} onPress={() => setShowSched(!showSched)}>
        <Text style={calcsStyles.linkText}>{showSched ? 'Hide payment schedule' : 'Show payment schedule'}</Text>
      </TouchableOpacity>
      {showSched && (
        <View style={calcsStyles.table}>
          <TRow cells={['Year', 'Principal', 'Interest', 'Balance']} head />
          {yearlySchedule(loan, num(rate), years).map((r) => (
            <TRow key={r.year} cells={[r.year, money(r.principal), money(r.interest), money(r.balance)]} />
          ))}
        </View>
      )}
      <Note>Canadian fixed-rate mortgage, compounded semi-annually. Schedule shows principal and interest only.</Note>
    </View>
  );
}

function AffordCalc({ goTo }) {
  const [income, setIncome] = useState('150000');
  const [down, setDown] = useState('150000');
  const [debts, setDebts] = useState('500');
  const [years, setYears] = useState(25);
  const [rate, setRate] = useState('4.5');
  const [taxRate, setTaxRate] = useState('0.3');
  const [ins, setIns] = useState('1200');
  const [hoa, setHoa] = useState('0');

  const r = affordability({ income: num(income), down: num(down), debts: num(debts), years, ratePct: num(rate), taxRatePct: num(taxRate), insurance: num(ins), hoa: num(hoa) });
  const downPct = r.price > 0 ? (num(down) / r.price) * 100 : 0;
  const ok = r.price > 0;

  return (
    <View>
      <Field label="Annual income ($)" value={income} onChange={setIncome} />
      <Field label="Down payment ($)" value={down} onChange={setDown} />
      <Field label="Other monthly debts ($)" value={debts} onChange={setDebts} />
      <Pick label="Loan term (years)" options={TERMS} value={years} onChange={setYears} />
      <Field label="Interest rate (%)" value={rate} onChange={setRate} />
      <Field label="Property tax rate (% of price per year)" value={taxRate} onChange={setTaxRate} />
      <Field label="Home insurance ($ / year)" value={ins} onChange={setIns} />
      <Field label="Condo / HOA fees ($ / month)" value={hoa} onChange={setHoa} />

      <Result title="Maximum home price" value={ok ? money(r.price) : '$0'} tone={ok ? undefined : 'warn'}
        lines={[ok ? `Mortgage: ${money(r.loan)} · Down payment: ${downPct.toFixed(1)}%` : 'Income is too low for these inputs.']} />
      {ok && (
        <Breakdown rows={[
          ['Principal & interest', money(r.payment)],
          ['Property tax', money(r.tax)],
          ['Home insurance', money(r.insurance)],
          ['Condo / HOA fees', money(r.hoa)],
          ['Total per month', money(r.total), true],
          ['Housing ratio (GDS)', `${r.gdsPct.toFixed(0)}%`],
          ['Debt ratio (TDS)', `${r.tdsPct.toFixed(0)}%`],
        ]} />
      )}
      {ok && downPct < 20 && <Note>Under 20% down, mortgage insurance applies and adds to the mortgage. Use the CMHC calculator to estimate it.</Note>}
      {ok && <TouchableOpacity style={calcsStyles.linkBtn} onPress={() => goTo('browse')}><Text style={calcsStyles.linkText}>View affordable properties</Text></TouchableOpacity>}
      <Note>
        Assumes lenders' common limits (housing costs up to {AFFORD.gds * 100}% and total debt up to {AFFORD.tds * 100}% of gross income), qualified at {r.qualRate.toFixed(2)}% (your rate + 2%, minimum 5.25%). Half of condo fees count toward the limits. Actual approval is up to your lender.
      </Note>
    </View>
  );
}

function RatesCalc() {
  const [loan, setLoan] = useState('960000');
  const [years, setYears] = useState(25);
  const [term, setTerm] = useState(5);
  const [rates, setRates] = useState(['4.19', '4.49', '4.89']);
  const L = num(loan);
  const rows = rates.map((r, i) => {
    const rate = num(r);
    const m = pmt(L, rate, years);
    const paidInTerm = m * term * 12;
    const bal = balanceAfter(L, rate, years, term * 12);
    return { name: 'ABC'[i], rate, monthly: m, interest: paidInTerm - (L - bal), balance: bal };
  });
  const best = rows.reduce((a, b) => (b.interest < a.interest ? b : a), rows[0]);
  const worst = rows.reduce((a, b) => (b.interest > a.interest ? b : a), rows[0]);

  return (
    <View>
      <Field label="Mortgage amount ($)" value={loan} onChange={setLoan} />
      <Pick label="Amortization (years)" options={[15, 20, 25, 30]} value={years} onChange={setYears} />
      <Pick label="Term (years)" options={[1, 2, 3, 4, 5, 7, 10]} value={term} onChange={setTerm} />
      {rates.map((r, i) => (
        <Field key={i} label={`Rate ${'ABC'[i]} (%)`} value={r} onChange={(v) => setRates(rates.map((x, j) => (j === i ? v : x)))} />
      ))}
      <View style={calcsStyles.table}>
        <TRow cells={['', 'Rate', 'Monthly', `Interest (${term}y)`]} head />
        {rows.map((r) => (
          <TRow key={r.name} cells={[r.name, `${r.rate}%`, money(r.monthly), money(r.interest)]} highlight={r === best} />
        ))}
      </View>
      <Result title={`Best option over ${term} years`} value={`Rate ${best.name} · ${best.rate}%`}
        lines={[`Saves ${money(worst.interest - best.interest)} in interest vs the highest rate`, `Balance after ${term} years: ${money(best.balance)}`]} />
      <Note>Assumes the rate stays fixed for the whole term and payments are monthly. Does not include fees or penalties.</Note>
    </View>
  );
}

function CmhcCalc() {
  const [price, setPrice] = useState('900000');
  const [down, setDown] = useState('10');
  const [mode, setMode] = useState('%');
  const [years, setYears] = useState(25);
  const p = num(price);
  const d = Math.min(downInDollars(p, num(down), mode), p);
  const r = cmhcInsurance({ price: p, down: d, amortYears: years });
  const blocked = r.status === 'blocked';

  return (
    <View>
      <Field label="Home price ($)" value={price} onChange={setPrice} />
      <DownField value={down} onChange={setDown} mode={mode} onMode={setMode} />
      <Pick label="Amortization (years)" options={[25, 30]} value={years} onChange={setYears} />
      <Result title="Insurance premium" value={blocked ? 'Not available' : money(r.premium)} tone={blocked ? 'warn' : undefined}
        lines={[r.message || `Premium rate ${r.ratePct}% of the mortgage (down payment ${r.downPct.toFixed(1)}%)`]} />
      {!blocked && (
        <Breakdown rows={[
          ['Home price', money(p)],
          ['Down payment', money(d)],
          ['Mortgage before premium', money(r.loan)],
          ['Insurance premium', money(r.premium)],
          ['Total mortgage', money(r.total), true],
        ]} />
      )}
      <Note>Premium is normally added to the mortgage. Uses CMHC tiers: 4.00% (5–9.99% down), 3.10% (10–14.99%), 2.80% (15–19.99%), plus 0.20% when amortization is over 25 years. Homes of $1.5M+ need 20% down. Confirm with your lender.</Note>
    </View>
  );
}

function TransferTaxCalc() {
  const [price, setPrice] = useState('1200000');
  const [first, setFirst] = useState(false);
  const [newBuild, setNewBuild] = useState(false);
  const r = bcTransferTax({ price: num(price), firstTime: first, newBuild });

  return (
    <View>
      <Field label="Purchase price ($)" value={price} onChange={setPrice} />
      <Toggle label="First-time home buyer" value={first} onChange={setFirst} />
      <Toggle label="Newly built home" value={newBuild} onChange={setNewBuild} />
      <Result title="Property transfer tax" value={money(r.payable)} lines={[r.note || `Tax before any exemption: ${money(r.full)}`]} />
      <Breakdown rows={[
        ['Purchase price', money(num(price))],
        ['Tax before exemptions', money(r.full)],
        ['Tax payable', money(r.payable), true],
      ]} />
      <Note>
        BC rates: 1% on the first $200,000, 2% up to $2M, 3% above $2M, plus 2% on residential value above $3M. First-time buyer exemption: full up to ${BC_PTT.firstTimeFull.toLocaleString('en-CA')}, partial to ${BC_PTT.firstTimePartialTo.toLocaleString('en-CA')}. New-home exemption: full up to ${BC_PTT.newBuildFull.toLocaleString('en-CA')}, partial to ${BC_PTT.newBuildPartialTo.toLocaleString('en-CA')}. Eligibility rules apply, and thresholds change, so verify with the BC government.
      </Note>
    </View>
  );
}

function TRow({ cells, head, highlight }) {
  return (
    <View style={[calcsStyles.trow, head && calcsStyles.thead, highlight && calcsStyles.thl]}>
      {cells.map((c, i) => (
        <Text key={i} style={[calcsStyles.tcell, i === 0 && { flex: 0.6 }, head && calcsStyles.tbold]}>{c}</Text>
      ))}
    </View>
  );
}

const calcsStyles = StyleSheet.create({
  pad: { padding: 16 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  back: { color: COLORS.primary, fontSize: 16, marginBottom: 6 },
  siteLink: { alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  h1: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  tile: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 10 },
  tileTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  tileDesc: { color: COLORS.muted, marginTop: 2 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  small: { color: COLORS.muted },
  linkBtn: { paddingVertical: 10 },
  linkText: { color: COLORS.primary, fontWeight: '600', fontSize: 16 },
  table: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, overflow: 'hidden', marginBottom: 12 },
  trow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  thead: { backgroundColor: COLORS.card, borderTopWidth: 0 },
  thl: { backgroundColor: '#dcfce7' },
  tcell: { flex: 1, fontSize: 13, color: COLORS.text },
  tbold: { fontWeight: '700' },
});

// ---- src/screens/MoreScreen.js

function MoreScreen({ openWeb }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  // No backend: opens the user's mail app with the message prefilled.
  const send = () => {
    if (!name.trim() || !message.trim()) {
      Alert.alert('Missing info', 'Please enter your name and a message.');
      return;
    }
    const body = `${message}\n\n${name}${phone ? `\n${phone}` : ''}`;
    Linking.openURL(`mailto:${AGENT.email}?subject=${encodeURIComponent('Inquiry from the app')}&body=${encodeURIComponent(body)}`);
  };

  return (
    <ScrollView contentContainerStyle={moreStyles.pad} keyboardShouldPersistTaps="handled">
      <Text style={moreStyles.h2}>Resources</Text>
      {RESOURCES.map((r) => (
        <TouchableOpacity key={r.title} style={moreStyles.row} onPress={() => openWeb(r.url, r.title)}>
          <Text style={moreStyles.rowText}>{r.title}</Text>
          <Text style={moreStyles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <Text style={[moreStyles.h2, { marginTop: 28 }]}>Contact</Text>
      <TextInput style={moreStyles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={moreStyles.input} placeholder="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={[moreStyles.input, { height: 100 }]} placeholder="Message" value={message} onChangeText={setMessage} multiline textAlignVertical="top" />
      <TouchableOpacity style={moreStyles.btn} onPress={send}><Text style={moreStyles.btnText}>Send email</Text></TouchableOpacity>

      <Text style={moreStyles.info}>{AGENT.phoneDisplay} · {AGENT.email}</Text>
      <Text style={moreStyles.info}>{AGENT.address}</Text>
    </ScrollView>
  );
}

const moreStyles = StyleSheet.create({
  pad: { padding: 16 },
  h2: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowText: { fontSize: 16, color: COLORS.text },
  arrow: { fontSize: 20, color: COLORS.muted },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 16 },
  btn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  info: { color: COLORS.muted, textAlign: 'center', marginTop: 12 },
});

// ---- App.js

const TABS = [
  { key: 'home', label: 'Home' },
  { key: 'browse', label: 'Browse' },
  { key: 'calc', label: 'Calculators' },
  { key: 'more', label: 'More' },
];

function App() {
  const [tab, setTab] = useState('home');
  // Website pages open in the system in-app browser (Safari View Controller on iPhone,
  // Chrome Custom Tabs on Android); its Done/Close button returns to the app.
  const openWeb = async (url) => {
    try {
      await WebBrowser.openBrowserAsync(url, { toolbarColor: COLORS.bg, controlsColor: COLORS.primary });
    } catch {
      Linking.openURL(url).catch(() => Alert.alert('Could not open the page', url));
    }
  };

  const props = { goTo: setTab, openWeb };
  const Screen = { home: HomeScreen, browse: BrowseScreen, calc: CalculatorsScreen, more: MoreScreen }[tab];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={appStyles.root}>
        <StatusBar style="auto" />
        <View style={{ flex: 1 }}><Screen {...props} /></View>
        <View style={appStyles.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity key={t.key} style={appStyles.tab} onPress={() => setTab(t.key)}>
              <Text style={[appStyles.tabText, tab === t.key && appStyles.tabOn]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const appStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { color: COLORS.muted, fontSize: 13 },
  tabOn: { color: COLORS.accentDark, fontWeight: '700' },
});

export default App;

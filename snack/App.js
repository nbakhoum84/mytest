import React, { useState } from 'react';
import { Alert, FlatList, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  bg: '#ffffff', text: '#111827', muted: '#6b7280', primary: '#0f4c81',
  card: '#f3f4f6', border: '#e5e7eb',
};

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

// ---- src/screens/HomeScreen.js

function HomeScreen({ goTo, openWeb }) {
  return (
    <ScrollView contentContainerStyle={homeStyles.pad}>
      <View style={homeStyles.hero}>
        <Text style={homeStyles.h1}>Find your home in Metro Vancouver</Text>
        <Text style={homeStyles.sub}>{AGENT.name} · {AGENT.brokerage}</Text>
        <TouchableOpacity style={homeStyles.cta} onPress={() => goTo('browse')}>
          <Text style={homeStyles.ctaText}>Browse listings</Text>
        </TouchableOpacity>
      </View>

      <Text style={homeStyles.h2}>Quick actions</Text>
      <Tile label="Mortgage calculators" desc="Payment, affordability, rates, CMHC, land transfer tax" onPress={() => goTo('calc')} />
      <Tile label="Book a free consultation" desc="Investment & ROI analysis" onPress={() => openWeb(AGENT.calendly, 'Book a consultation')} />
      <Tile label="Call Nader" desc={AGENT.phoneDisplay} onPress={() => Linking.openURL(`tel:${AGENT.phone}`)} />
      <Tile label="WhatsApp" desc="Chat directly" onPress={() => Linking.openURL(AGENT.whatsapp)} />
      <Tile label="Guides & resources" desc="Buyer’s guide, FAQ, blog" onPress={() => goTo('more')} />
    </ScrollView>
  );
}

function Tile({ label, desc, onPress }) {
  return (
    <TouchableOpacity style={homeStyles.tile} onPress={onPress}>
      <Text style={homeStyles.tileLabel}>{label}</Text>
      <Text style={homeStyles.tileDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const homeStyles = StyleSheet.create({
  pad: { padding: 16 },
  hero: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 24, marginBottom: 24 },
  h1: { color: '#fff', fontSize: 26, fontWeight: '700' },
  sub: { color: '#dbeafe', marginTop: 8 },
  cta: { backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginTop: 20 },
  ctaText: { color: COLORS.primary, fontWeight: '700' },
  h2: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  tile: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 10 },
  tileLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  tileDesc: { color: COLORS.muted, marginTop: 2 },
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
  const item = LIST.find((l) => l.key === active);

  if (!item) {
    return (
      <ScrollView contentContainerStyle={calcsStyles.pad}>
        {LIST.map((l) => (
          <TouchableOpacity key={l.key} style={calcsStyles.tile} onPress={() => setActive(l.key)}>
            <Text style={calcsStyles.tileTitle}>{l.title}</Text>
            <Text style={calcsStyles.tileDesc}>{l.desc}</Text>
          </TouchableOpacity>
        ))}
        <Note>Estimates only. Rates, limits and tax rules change, so confirm figures with your lender.</Note>
      </ScrollView>
    );
  }
  const { Comp } = item;
  return (
    <ScrollView contentContainerStyle={calcsStyles.pad} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => setActive(null)} hitSlop={10}><Text style={calcsStyles.back}>‹ All calculators</Text></TouchableOpacity>
      <Text style={calcsStyles.h1}>{item.title}</Text>
      <Comp goTo={goTo} />
    </ScrollView>
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
  back: { color: COLORS.primary, fontSize: 16, marginBottom: 8 },
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
  tabOn: { color: COLORS.primary, fontWeight: '700' },
});

export default App;

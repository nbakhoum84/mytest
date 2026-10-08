import React, { useState } from 'react';
import { Alert, FlatList, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
      <Tile label="Mortgage calculator" desc="Estimate your monthly payment" onPress={() => goTo('calc')} />
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

// ---- src/screens/CalculatorScreen.js

// Canadian mortgages compound semi-annually.
function monthlyPayment(principal, annualRatePct, years) {
  const n = years * 12;
  if (principal <= 0 || n <= 0) return 0;
  if (annualRatePct <= 0) return principal / n;
  const monthlyRate = Math.pow(1 + annualRatePct / 100 / 2, 2 / 12) - 1;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
}

const money = (v) => '$' + Math.round(v).toLocaleString('en-CA');

function CalculatorScreen() {
  const [price, setPrice] = useState('1200000');
  const [down, setDown] = useState('240000');
  const [rate, setRate] = useState('4.5');
  const [years, setYears] = useState('25');

  const num = (s) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
  const principal = Math.max(num(price) - num(down), 0);
  const monthly = monthlyPayment(principal, num(rate), num(years));
  const total = monthly * num(years) * 12;

  return (
    <ScrollView contentContainerStyle={calcStyles.pad} keyboardShouldPersistTaps="handled">
      <Field label="Home price ($)" value={price} onChange={setPrice} />
      <Field label="Down payment ($)" value={down} onChange={setDown} />
      <Field label="Interest rate (%)" value={rate} onChange={setRate} />
      <Field label="Amortization (years)" value={years} onChange={setYears} />
      <View style={calcStyles.result}>
        <Text style={calcStyles.resultLabel}>Estimated monthly payment</Text>
        <Text style={calcStyles.resultValue}>{money(monthly)}</Text>
        <Text style={calcStyles.resultSub}>Mortgage: {money(principal)} · Total interest: {money(Math.max(total - principal, 0))}</Text>
      </View>
      <Text style={calcStyles.note}>Estimate only. Excludes insurance, property tax and fees.</Text>
    </ScrollView>
  );
}

function Field({ label, value, onChange }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={calcStyles.label}>{label}</Text>
      <TextInput style={calcStyles.input} value={value} onChangeText={onChange} keyboardType="decimal-pad" />
    </View>
  );
}

const calcStyles = StyleSheet.create({
  pad: { padding: 16 },
  label: { color: COLORS.muted, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 16 },
  result: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, marginTop: 8 },
  resultLabel: { color: '#dbeafe' },
  resultValue: { color: '#fff', fontSize: 36, fontWeight: '700', marginVertical: 4 },
  resultSub: { color: '#dbeafe' },
  note: { color: COLORS.muted, fontSize: 12, marginTop: 12 },
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
  { key: 'calc', label: 'Calculator' },
  { key: 'more', label: 'More' },
];

function App() {
  const [tab, setTab] = useState('home');
  // Website pages open in the phone's browser (Safari on iPhone).
  const openWeb = (url) =>
    Linking.openURL(url).catch(() => Alert.alert('Could not open the page', url));

  const props = { goTo: setTab, openWeb };
  const Screen = { home: HomeScreen, browse: BrowseScreen, calc: CalculatorScreen, more: MoreScreen }[tab];

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

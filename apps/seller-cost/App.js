import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { estimateSellerCosts, money } from './src/costs';

const C = { bg: '#fff', text: '#111827', muted: '#6b7280', primary: '#0f6b4c', card: '#f3f4f6', border: '#e5e7eb', bad: '#b91c1c' };

const STEPS = [
  'Meet a realtor & agree on list price',
  'Sign listing agreement',
  'Declutter, clean & stage',
  'Professional photos',
  'Collect strata documents (if any)',
  'List and hold showings',
  'Review offers & negotiate',
  'Remove subjects',
  'Arrange mortgage payout & lawyer',
  'Hand over keys on possession day',
];

const num = (s) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0;

function Field({ label, value, onChange }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={value} onChangeText={onChange} />
    </>
  );
}

function Costs() {
  const [price, setPrice] = useState('1000000');
  const [mortgage, setMortgage] = useState('0');
  const [penalty, setPenalty] = useState('0');
  const [legal, setLegal] = useState('1500');
  const [prep, setPrep] = useState('1500');
  const [first, setFirst] = useState('7');
  const [rest, setRest] = useState('3');
  const p = num(price);
  const { items, sellingCosts, netProceeds, note } = estimateSellerCosts({
    price: p, mortgage: num(mortgage), penalty: num(penalty), legal: num(legal), prep: num(prep),
    firstRate: num(first) / 100, restRate: num(rest) / 100,
  });
  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.h1}>Seller Cost</Text>
      <Field label="Expected sale price (CAD)" value={price} onChange={setPrice} />
      <Field label="Mortgage balance to pay out" value={mortgage} onChange={setMortgage} />
      <Field label="Prepayment penalty (if any)" value={penalty} onChange={setPenalty} />
      <Field label="Legal fees (before GST)" value={legal} onChange={setLegal} />
      <Field label="Staging, photos & cleaning" value={prep} onChange={setPrep} />
      <Field label="Commission % on first $100,000" value={first} onChange={setFirst} />
      <Field label="Commission % on the balance" value={rest} onChange={setRest} />
      <View style={styles.row}>
        <Text style={styles.text}>Sale price</Text>
        <Text style={styles.text}>{money(p)}</Text>
      </View>
      {items.map((i) => (
        <View key={i.label} style={styles.row}>
          <Text style={styles.text}>{i.label}</Text>
          <Text style={styles.text}>-{money(i.amount)}</Text>
        </View>
      ))}
      <View style={styles.row}>
        <Text style={styles.text}>Total selling costs</Text>
        <Text style={styles.text}>{money(sellingCosts)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>Mortgage payout</Text>
        <Text style={styles.text}>-{money(num(mortgage))}</Text>
      </View>
      <View style={[styles.row, styles.total]}>
        <Text style={[styles.totalText, netProceeds < 0 && { color: C.bad }]}>Estimated net proceeds</Text>
        <Text style={[styles.totalText, netProceeds < 0 && { color: C.bad }]}>{money(netProceeds)}</Text>
      </View>
      {note && <Text style={[styles.note, { color: C.bad }]}>{note}</Text>}
      <Text style={styles.note}>Estimate only. Commission is negotiable; defaults are a typical BC structure (7% of the first $100,000, 3% of the balance) plus 5% GST. Excludes property tax and strata adjustments, moving costs and any tax owing on the sale (a principal residence is normally exempt from capital gains tax). Confirm figures with your realtor and lawyer.</Text>
    </ScrollView>
  );
}

function Checklist() {
  const [done, setDone] = useState({});
  const count = Object.values(done).filter(Boolean).length;
  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.h1}>Seller checklist ({count}/{STEPS.length})</Text>
      {STEPS.map((s, i) => (
        <TouchableOpacity key={s} style={styles.step} onPress={() => setDone({ ...done, [i]: !done[i] })}>
          <Text style={styles.box}>{done[i] ? '☑' : '☐'}</Text>
          <Text style={[styles.text, done[i] && styles.struck]}>{s}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export default function App() {
  const [tab, setTab] = useState('costs');
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="auto" />
        <View style={{ flex: 1 }}>{tab === 'costs' ? <Costs /> : <Checklist />}</View>
        <View style={styles.tabs}>
          {[['costs', 'Costs'], ['list', 'Checklist']].map(([k, l]) => (
            <TouchableOpacity key={k} style={styles.tab} onPress={() => setTab(k)}>
              <Text style={[styles.tabText, tab === k && styles.tabOn]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  pad: { padding: 20 },
  h1: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 16 },
  label: { color: C.muted, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12, fontSize: 18, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  text: { color: C.text, fontSize: 16, flexShrink: 1 },
  total: { backgroundColor: C.card, paddingHorizontal: 10, marginTop: 8, borderBottomWidth: 0, borderRadius: 8 },
  totalText: { color: C.primary, fontSize: 18, fontWeight: '700' },
  note: { color: C.muted, fontSize: 12, marginTop: 16 },
  step: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  box: { fontSize: 22, marginRight: 12, color: C.primary },
  struck: { textDecorationLine: 'line-through', color: C.muted },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { color: C.muted, fontSize: 13 },
  tabOn: { color: C.primary, fontWeight: '700' },
});

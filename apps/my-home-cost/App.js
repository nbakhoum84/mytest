import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { estimateClosingCosts, money } from './src/costs';

const C = { bg: '#fff', text: '#111827', muted: '#6b7280', primary: '#0f4c81', card: '#f3f4f6', border: '#e5e7eb' };

const STEPS = [
  'Get mortgage pre-approval',
  'Set budget incl. closing costs',
  'Find and view homes',
  'Submit offer with subjects',
  'Book home inspection',
  'Remove subjects & pay deposit',
  'Arrange home insurance',
  'Final walk-through',
  'Sign at lawyer/notary',
  'Get keys on possession day',
];

function Costs() {
  const [price, setPrice] = useState('900000');
  const [ftb, setFtb] = useState(false);
  const p = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
  const { items, total } = estimateClosingCosts({ price: p, firstTimeBuyer: ftb });
  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.h1}>Closing cost estimator</Text>
      <Text style={styles.label}>Purchase price (CAD)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />
      <View style={styles.row}>
        <Text style={styles.label}>First-time buyer exemption</Text>
        <Switch value={ftb} onValueChange={setFtb} />
      </View>
      {items.map((i) => (
        <View key={i.label} style={styles.row}>
          <Text style={styles.text}>{i.label}</Text>
          <Text style={styles.text}>{money(i.amount)}</Text>
        </View>
      ))}
      <View style={[styles.row, styles.total]}>
        <Text style={styles.totalText}>Estimated total</Text>
        <Text style={styles.totalText}>{money(total)}</Text>
      </View>
      <Text style={styles.note}>Estimate only. Exemption shown applies up to $835,000; confirm eligibility with your lawyer. Excludes GST on new builds and adjustments.</Text>
    </ScrollView>
  );
}

function Checklist() {
  const [done, setDone] = useState({});
  const count = Object.values(done).filter(Boolean).length;
  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.h1}>Buyer checklist ({count}/{STEPS.length})</Text>
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

import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AFFORD, CMHC, FREQUENCIES, affordability, cmhcInsurance, downInDollars, minimumDown, money, mortgagePayment, num } from './src/mortgage';

const PHONE = '+16046127228';

const C = { bg: '#fff', text: '#111827', muted: '#6b7280', primary: '#0f4c81', card: '#f3f4f6', border: '#e5e7eb', warn: '#b91c1c' };

function Field({ label, value, onChange }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={value} onChangeText={onChange} />
    </>
  );
}

function Choice({ options, value, onChange }) {
  return (
    <View style={styles.choice}>
      {options.map(([k, l]) => (
        <TouchableOpacity key={k} style={[styles.chip, value === k && styles.chipOn]} onPress={() => onChange(k)}>
          <Text style={[styles.chipText, value === k && styles.chipTextOn]}>{l}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Row({ label, value, total }) {
  return (
    <View style={[styles.row, total && styles.total]}>
      <Text style={total ? styles.totalText : styles.text}>{label}</Text>
      <Text style={total ? styles.totalText : styles.text}>{value}</Text>
    </View>
  );
}

function DownPayment({ price, down, setDown, mode, setMode }) {
  return (
    <>
      <Text style={styles.label}>Down payment</Text>
      <View style={styles.inline}>
        <TextInput style={[styles.input, { flex: 1 }]} keyboardType="numeric" value={down} onChangeText={setDown} />
        <Choice options={[['%', '%'], ['$', '$']]} value={mode} onChange={(m) => {
          // Switching between % and $ converts the amount already entered.
          if (m === mode) return;
          const d = num(down);
          setDown(String(m === '$' ? Math.round((price * d) / 100) : price ? +((d / price) * 100).toFixed(2) : 0));
          setMode(m);
        }} />
      </View>
      <Text style={styles.note}>Minimum down for this price: {money(minimumDown(price))}</Text>
    </>
  );
}

function Payment() {
  const [price, setPrice] = useState('900000');
  const [down, setDown] = useState('10');
  const [mode, setMode] = useState('%');
  const [rate, setRate] = useState('4.5');
  const [years, setYears] = useState('25');
  const [freq, setFreq] = useState('monthly');
  const p = num(price);
  const d = downInDollars(p, num(down), mode);
  const r = mortgagePayment({ price: p, down: d, ratePct: num(rate), years: num(years), frequency: freq });
  const ins = r.insurance;
  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.h1}>Mortgage payment</Text>
      <Field label="Purchase price (CAD)" value={price} onChange={setPrice} />
      <DownPayment price={p} down={down} setDown={setDown} mode={mode} setMode={setMode} />
      <Field label="Interest rate (%)" value={rate} onChange={setRate} />
      <Field label="Amortization (years)" value={years} onChange={setYears} />
      <Text style={styles.label}>Payment frequency</Text>
      <Choice options={Object.entries(FREQUENCIES).map(([k, f]) => [k, f.label])} value={freq} onChange={setFreq} />
      {ins.status === 'blocked' ? (
        <Text style={[styles.note, { color: C.warn }]}>{ins.message}</Text>
      ) : (
        <>
          <Row label="Down payment" value={`${money(d)} (${ins.downPct.toFixed(1)}%)`} />
          <Row label="CMHC insurance" value={money(ins.premium)} />
          <Row label="Mortgage amount" value={money(r.loan)} />
          <Row label={`${FREQUENCIES[freq].label} payment`} value={money(r.amount)} total />
          <Row label="Balance after 5-year term" value={money(r.termBalance)} />
          <Row label="Total interest" value={money(r.totalInterest)} />
          <Row label="Paid off in" value={`${r.payoffYears.toFixed(1)} years`} />
          {!!ins.message && <Text style={styles.note}>{ins.message}</Text>}
        </>
      )}
      <Text style={styles.note}>Estimate only. Canadian fixed rates compound semi-annually. Your lender's figures may differ slightly.</Text>
    </ScrollView>
  );
}

function Affordability() {
  const [income, setIncome] = useState('150000');
  const [down, setDown] = useState('100000');
  const [debts, setDebts] = useState('500');
  const [rate, setRate] = useState('4.5');
  const [years, setYears] = useState('25');
  const [tax, setTax] = useState('0.3');
  const [heat, setHeat] = useState('100');
  const [strata, setStrata] = useState('0');
  const a = affordability({ income: num(income), down: num(down), debts: num(debts), years: num(years), ratePct: num(rate), taxRatePct: num(tax), heat: num(heat), hoa: num(strata) });
  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.h1}>What can I afford?</Text>
      <Field label="Household income per year" value={income} onChange={setIncome} />
      <Field label="Down payment ($)" value={down} onChange={setDown} />
      <Field label="Monthly debt payments (car, loans, cards)" value={debts} onChange={setDebts} />
      <Field label="Interest rate (%)" value={rate} onChange={setRate} />
      <Field label="Amortization (years)" value={years} onChange={setYears} />
      <Field label="Property tax (% of price per year)" value={tax} onChange={setTax} />
      <Field label="Heating per month" value={heat} onChange={setHeat} />
      <Field label="Strata fees per month" value={strata} onChange={setStrata} />
      <Row label="Maximum home price" value={money(a.price)} total />
      <Row label="Mortgage amount" value={money(a.loan)} />
      <Row label="Monthly mortgage payment" value={money(a.payment)} />
      <Row label="Monthly housing cost" value={money(a.total)} />
      <Row label="Stress-test rate" value={`${a.qualRate.toFixed(2)}%`} />
      <Row label="GDS / TDS" value={`${a.gdsPct.toFixed(0)}% / ${a.tdsPct.toFixed(0)}%`} />
      <Text style={styles.note}>Estimate only. Lenders qualify you at the higher of your rate + {AFFORD.stressAdd}% or {AFFORD.stressFloor}%, with housing costs up to {AFFORD.gds * 100}% of income (GDS) and all debts up to {AFFORD.tds * 100}% (TDS). Under 20% down, CMHC insurance is added on top and the price must stay under $1.5M.</Text>
    </ScrollView>
  );
}

function Insurance() {
  const [price, setPrice] = useState('900000');
  const [down, setDown] = useState('10');
  const [mode, setMode] = useState('%');
  const [years, setYears] = useState('25');
  const p = num(price);
  const ins = cmhcInsurance({ price: p, down: downInDollars(p, num(down), mode), years: num(years) });
  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.h1}>CMHC insurance</Text>
      <Field label="Purchase price (CAD)" value={price} onChange={setPrice} />
      <DownPayment price={p} down={down} setDown={setDown} mode={mode} setMode={setMode} />
      <Field label="Amortization (years)" value={years} onChange={setYears} />
      {ins.status === 'blocked' ? (
        <Text style={[styles.note, { color: C.warn }]}>{ins.message}</Text>
      ) : (
        <>
          <Row label="Mortgage before insurance" value={money(ins.loan)} />
          <Row label="Premium rate" value={`${ins.ratePct.toFixed(2)}%`} />
          <Row label="CMHC premium" value={money(ins.premium)} total />
          <Row label="PST on premium (7%, due at closing)" value={money(ins.premium * 0.07)} />
          <Row label="Total mortgage" value={money(ins.total)} />
          {!!ins.message && <Text style={styles.note}>{ins.message}</Text>}
        </>
      )}
      <Text style={styles.h2}>Premium rates</Text>
      {CMHC.tiers.map(([min, rate], i) => (
        <Row key={min} label={`${min}% to ${i === 0 ? '19.99' : CMHC.tiers[i - 1][0] - 0.01}% down`} value={`${rate.toFixed(2)}%`} />
      ))}
      <Text style={styles.note}>Add {CMHC.longAmortSurcharge.toFixed(2)}% for amortizations over 25 years (30 years is allowed for first-time buyers and new builds). No insurance is needed with 20% or more down. Rules as of December 2024; confirm with your lender.</Text>
    </ScrollView>
  );
}

const TABS = [['pay', 'Payment', Payment], ['afford', 'Afford', Affordability], ['cmhc', 'CMHC', Insurance]];

export default function App() {
  const [tab, setTab] = useState('pay');
  const Screen = TABS.find(([k]) => k === tab)[2];
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="auto" />
        <View style={{ flex: 1 }}><Screen /></View>
        <View style={styles.contact}>
          {[['tel', 'Call Nader'], ['sms', 'Text Nader']].map(([s, l]) => (
            <TouchableOpacity key={s} style={styles.contactBtn} onPress={() => Linking.openURL(`${s}:${PHONE}`)}>
              <Text style={styles.contactText}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.tabs}>
          {TABS.map(([k, l]) => (
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
  h2: { fontSize: 17, fontWeight: '700', color: C.text, marginTop: 24, marginBottom: 4 },
  label: { color: C.muted, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12, fontSize: 18, marginBottom: 16, color: C.text },
  inline: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  choice: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  chipOn: { borderColor: C.primary, backgroundColor: C.primary },
  chipText: { color: C.text, fontSize: 14 },
  chipTextOn: { color: '#fff', fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  text: { color: C.text, fontSize: 16, flexShrink: 1 },
  total: { backgroundColor: C.card, paddingHorizontal: 10, marginTop: 8, borderBottomWidth: 0, borderRadius: 8 },
  totalText: { color: C.primary, fontSize: 18, fontWeight: '700', flexShrink: 1 },
  note: { color: C.muted, fontSize: 12, marginTop: 8, marginBottom: 8 },
  contact: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 8 },
  contactBtn: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: C.primary },
  contactText: { color: '#fff', fontWeight: '700' },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { color: C.muted, fontSize: 13 },
  tabOn: { color: C.primary, fontWeight: '700' },
});

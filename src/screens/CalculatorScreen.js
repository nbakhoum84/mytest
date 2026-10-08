import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../config';

// Canadian mortgages compound semi-annually.
export function monthlyPayment(principal, annualRatePct, years) {
  const n = years * 12;
  if (principal <= 0 || n <= 0) return 0;
  if (annualRatePct <= 0) return principal / n;
  const monthlyRate = Math.pow(1 + annualRatePct / 100 / 2, 2 / 12) - 1;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
}

const money = (v) => '$' + Math.round(v).toLocaleString('en-CA');

export default function CalculatorScreen() {
  const [price, setPrice] = useState('1200000');
  const [down, setDown] = useState('240000');
  const [rate, setRate] = useState('4.5');
  const [years, setYears] = useState('25');

  const num = (s) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
  const principal = Math.max(num(price) - num(down), 0);
  const monthly = monthlyPayment(principal, num(rate), num(years));
  const total = monthly * num(years) * 12;

  return (
    <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
      <Field label="Home price ($)" value={price} onChange={setPrice} />
      <Field label="Down payment ($)" value={down} onChange={setDown} />
      <Field label="Interest rate (%)" value={rate} onChange={setRate} />
      <Field label="Amortization (years)" value={years} onChange={setYears} />
      <View style={styles.result}>
        <Text style={styles.resultLabel}>Estimated monthly payment</Text>
        <Text style={styles.resultValue}>{money(monthly)}</Text>
        <Text style={styles.resultSub}>Mortgage: {money(principal)} · Total interest: {money(Math.max(total - principal, 0))}</Text>
      </View>
      <Text style={styles.note}>Estimate only. Excludes insurance, property tax and fees.</Text>
    </ScrollView>
  );
}

function Field({ label, value, onChange }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="decimal-pad" />
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 16 },
  label: { color: COLORS.muted, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 16 },
  result: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, marginTop: 8 },
  resultLabel: { color: '#dbeafe' },
  resultValue: { color: '#fff', fontSize: 36, fontWeight: '700', marginVertical: 4 },
  resultSub: { color: '#dbeafe' },
  note: { color: COLORS.muted, fontSize: 12, marginTop: 12 },
});

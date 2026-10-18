import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../config';

export const money = (v) => '$' + Math.round(v || 0).toLocaleString('en-CA');

export function Field({ label, value, onChange, suffix }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder={suffix} />
    </View>
  );
}

// Amount entered either in dollars or as a percentage of the price.
export function DownField({ value, onChange, mode, onMode }) {
  return (
    <View style={styles.field}>
      <View style={styles.row}>
        <Text style={styles.label}>Down payment</Text>
        <Chips options={['$', '%']} value={mode} onChange={onMode} />
      </View>
      <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="decimal-pad" />
    </View>
  );
}

export function Chips({ options, value, onChange }) {
  return (
    <View style={styles.chips}>
      {options.map((o) => (
        <TouchableOpacity key={String(o)} onPress={() => onChange(o)} style={[styles.chip, o === value && styles.chipOn]}>
          <Text style={[styles.chipText, o === value && styles.chipTextOn]}>{String(o)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function Pick({ label, options, value, onChange }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Chips options={options} value={value} onChange={onChange} />
    </View>
  );
}

export function Toggle({ label, value, onChange }) {
  return (
    <TouchableOpacity style={styles.toggle} onPress={() => onChange(!value)}>
      <View style={[styles.box, value && styles.boxOn]}>{value ? <Text style={styles.tick}>✓</Text> : null}</View>
      <Text style={styles.toggleText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Result({ title, value, lines = [], tone }) {
  return (
    <View style={[styles.result, tone === 'warn' && { backgroundColor: '#9a3412' }]}>
      <Text style={styles.resultLabel}>{title}</Text>
      <Text style={styles.resultValue}>{value}</Text>
      {lines.map((l, i) => <Text key={i} style={styles.resultSub}>{l}</Text>)}
    </View>
  );
}

export function Breakdown({ rows }) {
  return (
    <View style={styles.breakdown}>
      {rows.map(([k, v, bold]) => (
        <View key={k} style={styles.brow}>
          <Text style={[styles.bkey, bold && styles.bold]}>{k}</Text>
          <Text style={[styles.bval, bold && styles.bold]}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

export const Note = ({ children }) => <Text style={styles.note}>{children}</Text>;

const styles = StyleSheet.create({
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

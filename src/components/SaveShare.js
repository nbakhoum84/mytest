import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../config';
import { addSaved } from '../storage';
import { shareResult, success, tap } from '../device';

// Save / Share buttons shown under a calculator result.
export default function SaveShare({ calc, title, value, rows }) {
  const [saved, setSaved] = useState(false);
  const item = { calc, title, value, rows: rows.map(([k, v]) => [k, v]) };

  const onSave = async () => {
    await addSaved(item);
    success();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  const onShare = () => { tap(); shareResult(item); };

  return (
    <View style={styles.row}>
      <TouchableOpacity style={[styles.btn, styles.save]} onPress={onSave}>
        <Text style={styles.saveText}>{saved ? 'Saved ✓' : 'Save result'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.share]} onPress={onShare}>
        <Text style={styles.shareText}>Share</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 12 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  save: { backgroundColor: COLORS.primary, marginRight: 8 },
  saveText: { color: '#fff', fontWeight: '700' },
  share: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  shareText: { color: COLORS.text, fontWeight: '700' },
});

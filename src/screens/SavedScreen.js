import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../config';
import { listFavorites, listSaved, removeSaved, toggleFavorite, updateSaved } from '../storage';
import { scheduleReminder, shareResult, takePhoto, tap } from '../device';

const REMIND = [['Tomorrow', 86400], ['In a week', 7 * 86400], ['In a month', 30 * 86400]];

export default function SavedScreen({ openWeb }) {
  const [saved, setSaved] = useState([]);
  const [favs, setFavs] = useState([]);
  const [open, setOpen] = useState(null);

  const refresh = useCallback(async () => {
    setSaved(await listSaved());
    setFavs(await listFavorites());
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const del = (id) => Alert.alert('Delete this saved result?', '', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await removeSaved(id); refresh(); } },
  ]);
  const photo = async (id) => {
    const uri = await takePhoto();
    if (uri) { await updateSaved(id, { photo: uri }); refresh(); }
  };
  const remind = (item) => Alert.alert('Remind me to review this', item.title, [
    ...REMIND.map(([label, seconds]) => ({
      text: label,
      onPress: async () => {
        const ok = await scheduleReminder({ title: 'Saved calculation', body: `${item.title}: ${item.value}. Tap to review it.`, seconds });
        if (ok) Alert.alert('Reminder set', label);
      },
    })),
    { text: 'Cancel', style: 'cancel' },
  ]);

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.h2}>Favorite areas</Text>
      {favs.length === 0 && <Text style={styles.empty}>Tap the star next to a city in Browse to save it here.</Text>}
      {favs.map((f) => (
        <View key={f.id} style={styles.row}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => openWeb(f.url, f.label)}>
            <Text style={styles.rowText}>{f.label}</Text>
          </TouchableOpacity>
          <TouchableOpacity hitSlop={10} onPress={async () => { await toggleFavorite(f); refresh(); }}>
            <Text style={styles.star}>★</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={[styles.h2, { marginTop: 24 }]}>Saved calculations</Text>
      {saved.length === 0 && <Text style={styles.empty}>Use "Save result" under any calculator to keep it here.</Text>}
      {saved.map((s) => (
        <View key={s.id} style={styles.card}>
          <TouchableOpacity onPress={() => setOpen(open === s.id ? null : s.id)}>
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={styles.cardValue}>{s.value}</Text>
            <Text style={styles.date}>{new Date(s.createdAt).toLocaleDateString('en-CA')}</Text>
          </TouchableOpacity>
          {open === s.id && s.rows.map(([k, v]) => (
            <View key={k} style={styles.brow}><Text style={styles.bkey}>{k}</Text><Text style={styles.bval}>{v}</Text></View>
          ))}
          {s.photo ? <Image source={{ uri: s.photo }} style={styles.photo} /> : null}
          <View style={styles.actions}>
            <Action label="Share" onPress={() => { tap(); shareResult(s); }} />
            <Action label={s.photo ? 'Retake photo' : 'Add photo'} onPress={() => photo(s.id)} />
            <Action label="Remind me" onPress={() => remind(s)} />
            <Action label="Delete" danger onPress={() => del(s.id)} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const Action = ({ label, onPress, danger }) => (
  <TouchableOpacity style={styles.action} onPress={onPress}>
    <Text style={[styles.actionText, danger && { color: '#b91c1c' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  pad: { padding: 16 },
  h2: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  empty: { color: COLORS.muted },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowText: { fontSize: 16, color: COLORS.text },
  star: { fontSize: 22, color: COLORS.accentDark, paddingLeft: 12 },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTitle: { color: COLORS.muted },
  cardValue: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  date: { color: COLORS.muted, fontSize: 12, marginTop: 2, marginBottom: 6 },
  brow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  bkey: { color: COLORS.muted, flex: 1, paddingRight: 8 },
  bval: { color: COLORS.text },
  photo: { width: '100%', height: 160, borderRadius: 8, marginTop: 10 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  action: { paddingVertical: 8, paddingRight: 16 },
  actionText: { color: COLORS.primary, fontWeight: '600' },
});

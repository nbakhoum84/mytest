import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CATEGORIES, CITIES, COLORS } from '../config';

export default function BrowseScreen({ openWeb }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [query, setQuery] = useState('');
  const cities = CITIES.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()));
  const extras = category.extras && !query.trim() ? category.extras : [];

  return (
    <View style={styles.root}>
      <View style={styles.chips}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.key} onPress={() => setCategory(cat)}
            style={[styles.chip, cat.key === category.key && styles.chipOn]}>
            <Text style={[styles.chipText, cat.key === category.key && styles.chipTextOn]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput style={styles.search} placeholder="Search city" value={query} onChangeText={setQuery} />
      <FlatList
        data={cities}
        initialNumToRender={100}
        keyExtractor={(c) => c}
        ListHeaderComponent={extras.length ? (
          <View style={styles.extras}>
            {extras.map((e) => (
              <TouchableOpacity key={e.label} style={styles.extraCard} onPress={() => openWeb(e.url, e.label)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.extraTitle}>{e.label}</Text>
                  <Text style={styles.extraDesc}>{e.desc}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.sectionLabel}>Presales by city</Text>
          </View>
        ) : null}
        ListEmptyComponent={<Text style={styles.empty}>No matching city.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => openWeb(category.url(item), `${item} · ${category.label}`)}>
            <Text style={[styles.rowText, { flex: 1 }]}>{item}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.text },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  search: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowText: { fontSize: 16, color: COLORS.text },
  arrow: { fontSize: 20, color: COLORS.muted },
  extras: { marginBottom: 4 },
  extraCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: COLORS.accent, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 10 },
  extraTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  extraDesc: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.muted, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 8 },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 24 },
});

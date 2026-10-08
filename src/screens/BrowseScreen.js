import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CATEGORIES, CITIES, COLORS } from '../config';

export default function BrowseScreen({ openWeb }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [query, setQuery] = useState('');
  const cities = CITIES.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()));

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
        keyExtractor={(c) => c}
        ListEmptyComponent={<Text style={styles.empty}>No matching city.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => openWeb(category.url(item), `${item} · ${category.label}`)}>
            <Text style={styles.rowText}>{item}</Text>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowText: { fontSize: 16, color: COLORS.text },
  arrow: { fontSize: 20, color: COLORS.muted },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 24 },
});

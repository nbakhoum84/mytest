import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CATEGORIES, CITIES, COLORS } from '../config';
import { listFavorites, toggleFavorite } from '../storage';
import { findNearestCity, success, tap } from '../device';

export default function BrowseScreen({ openWeb }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [query, setQuery] = useState('');
  const [favs, setFavs] = useState([]);
  const [locating, setLocating] = useState(false);
  useEffect(() => { listFavorites().then(setFavs); }, []);
  const favOf = (city) => ({ id: `${category.key}:${city}`, label: `${city} · ${category.label}`, url: category.url(city) });
  const isFav = (city) => favs.some((f) => f.id === `${category.key}:${city}`);
  const onStar = async (city) => {
    const nowFav = await toggleFavorite(favOf(city));
    if (nowFav) success(); else tap();
    setFavs(await listFavorites());
  };
  const nearMe = async () => {
    setLocating(true);
    const hit = await findNearestCity();
    setLocating(false);
    if (hit) { success(); openWeb(category.url(hit.city), `${hit.city} · ${category.label}`); }
  };
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
      <TouchableOpacity style={styles.near} onPress={nearMe} disabled={locating}>
        <Text style={styles.nearText}>{locating ? 'Finding your location…' : '◎  Listings near me'}</Text>
      </TouchableOpacity>
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
            <TouchableOpacity hitSlop={10} onPress={() => onStar(item)}>
              <Text style={[styles.star, isFav(item) && styles.starOn]}>{isFav(item) ? '★' : '☆'}</Text>
            </TouchableOpacity>
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
  near: { backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  nearText: { color: '#fff', fontWeight: '700' },
  star: { fontSize: 22, color: COLORS.muted, paddingHorizontal: 12 },
  starOn: { color: COLORS.accentDark },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 24 },
});

// Small on-device store (AsyncStorage: the phone's storage, or localStorage on the web build).
// Nothing leaves the phone. Every call is wrapped so a storage error never crashes the app.
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'homenader:';

export async function load(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function save(key, value) {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ---- Saved calculations: a snapshot of a result (title, headline value, breakdown rows) ----
export async function listSaved() {
  return load('saved', []);
}

export async function addSaved({ calc, title, value, rows }) {
  const items = await listSaved();
  const item = { id: uid(), calc, title, value, rows, createdAt: Date.now(), photo: null };
  await save('saved', [item, ...items].slice(0, 100));
  return item;
}

export async function updateSaved(id, patch) {
  const items = await listSaved();
  await save('saved', items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
}

export async function removeSaved(id) {
  const items = await listSaved();
  await save('saved', items.filter((i) => i.id !== id));
}

// ---- Favorites: a city + category page the client wants to come back to ----
export async function listFavorites() {
  return load('favorites', []);
}

export async function toggleFavorite(fav) {
  const items = await listFavorites();
  const exists = items.some((f) => f.id === fav.id);
  const next = exists ? items.filter((f) => f.id !== fav.id) : [{ ...fav, createdAt: Date.now() }, ...items];
  await save('favorites', next);
  return !exists;
}

// ---- Profile (on this phone only) ----
export const loadProfile = () => load('profile', { name: '', phone: '', email: '' });
export const saveProfile = (p) => save('profile', p);

// ---- App lock setting ----
export const loadLock = () => load('lock', false);
export const saveLock = (v) => save('lock', !!v);

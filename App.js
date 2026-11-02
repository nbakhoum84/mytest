import React, { useEffect, useState } from 'react';
import { Alert, AppState, BackHandler, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import CalculatorsScreen from './src/screens/CalculatorsScreen';
import MoreScreen from './src/screens/MoreScreen';
import SavedScreen from './src/screens/SavedScreen';
import { loadLock } from './src/storage';
import { unlock } from './src/device';
import { COLORS } from './src/config';
import { useEmbedded } from './src/embed';

const TABS = [
  { key: 'home', label: 'Home' },
  { key: 'browse', label: 'Browse' },
  { key: 'calc', label: 'Calculators' },
  { key: 'saved', label: 'Saved' },
  { key: 'more', label: 'More' },
];

export default function App() {
  const [tab, setTab] = useState('home');
  const { embedded } = useEmbedded(tab);

  // Optional Face ID / fingerprint lock (turned on in More > Privacy & security). Native only.
  // 'checking' hides the app for a moment at launch so nothing flashes before the lock appears.
  const [lockState, setLockState] = useState(Platform.OS === 'web' ? 'open' : 'checking');
  const tryUnlock = async () => { if (await unlock()) setLockState('open'); };
  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    loadLock().then((on) => {
      if (on) { setLockState('locked'); tryUnlock(); } else setLockState('open');
    });
    // Re-lock when the app has been in the background (not for the brief Face ID prompt itself).
    const sub = AppState.addEventListener('change', async (st) => {
      if (st === 'background' && (await loadLock())) setLockState('locked');
      if (st === 'active') { if ((await loadLock()) && lockStateRef.current === 'locked') tryUnlock(); }
    });
    return () => sub.remove();
  }, []);
  const lockStateRef = React.useRef(lockState);
  lockStateRef.current = lockState;

  // Android back button: from another tab go back to Home; on Home let Android close the app.
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (tab === 'home') return false;
      setTab('home');
      return true;
    });
    return () => sub.remove();
  }, [tab]);

  // Website pages open in the system in-app browser (Safari View Controller on iPhone,
  // Chrome Custom Tabs on Android); its Done/Close button returns to the app.
  const openWeb = async (url) => {
    try {
      await WebBrowser.openBrowserAsync(url, { toolbarColor: COLORS.bg, controlsColor: COLORS.primary });
    } catch {
      Linking.openURL(url).catch(() => Alert.alert('Could not open the page', url));
    }
  };

  const props = { goTo: setTab, openWeb };
  const Screen = { home: HomeScreen, browse: BrowseScreen, calc: CalculatorsScreen, saved: SavedScreen, more: MoreScreen }[tab];

  if (lockState !== 'open') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.root, styles.lock]}>
          <StatusBar style="dark" />
          {lockState === 'locked' && (
            <>
              <Text style={styles.lockTitle}>home-nader</Text>
              <Text style={styles.lockSub}>Locked</Text>
              <TouchableOpacity style={styles.lockBtn} onPress={tryUnlock}><Text style={styles.lockBtnText}>Unlock</Text></TouchableOpacity>
            </>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} dataSet={{ embed: 'root' }}>
        <StatusBar style="auto" />
        <View style={{ flex: 1 }} dataSet={{ embed: 'screen' }}><Screen {...props} /></View>
        <View style={[styles.tabs, embedded && styles.tabsTop]} dataSet={{ embed: 'tabs' }}>
          {TABS.map((t) => (
            <TouchableOpacity key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
              <Text style={[styles.tabText, tab === t.key && styles.tabOn]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, ...(Platform.OS === 'web' ? { width: '100%', maxWidth: 520, alignSelf: 'center' } : {}) },
  lock: { alignItems: 'center', justifyContent: 'center' },
  lockTitle: { fontSize: 26, fontWeight: '700', color: COLORS.text },
  lockSub: { color: COLORS.muted, marginTop: 4, marginBottom: 20 },
  lockBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10 },
  lockBtnText: { color: '#fff', fontWeight: '700' },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border },
  // Inside the website page the tabs sit above the content (the page scrolls, so a bottom bar would be out of reach).
  tabsTop: { order: -1, zIndex: 10, backgroundColor: COLORS.bg, borderTopWidth: 0, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { color: COLORS.muted, fontSize: 13 },
  tabOn: { color: COLORS.accentDark, fontWeight: '700' },
});

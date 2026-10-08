import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import CalculatorScreen from './src/screens/CalculatorScreen';
import MoreScreen from './src/screens/MoreScreen';
import WebScreen from './src/components/WebScreen';
import { COLORS } from './src/config';

const TABS = [
  { key: 'home', label: 'Home' },
  { key: 'browse', label: 'Browse' },
  { key: 'calc', label: 'Calculator' },
  { key: 'more', label: 'More' },
];

export default function App() {
  const [tab, setTab] = useState('home');
  const [web, setWeb] = useState(null); // { url, title }
  const openWeb = useCallback((url, title) => setWeb({ url, title }), []);
  const closeWeb = useCallback(() => setWeb(null), []);

  const props = { goTo: setTab, openWeb };
  const Screen = { home: HomeScreen, browse: BrowseScreen, calc: CalculatorScreen, more: MoreScreen }[tab];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="auto" />
        <View style={{ flex: 1 }}><Screen {...props} /></View>
        <View style={styles.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
              <Text style={[styles.tabText, tab === t.key && styles.tabOn]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <WebScreen url={web?.url} title={web?.title} onClose={closeWeb} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { color: COLORS.muted, fontSize: 13 },
  tabOn: { color: COLORS.primary, fontWeight: '700' },
});

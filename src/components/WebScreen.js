import React, { useRef, useState, useEffect } from 'react';
import { ActivityIndicator, BackHandler, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../config';

// Full-screen in-app browser for pages on the website.
// The Modal gets its own SafeAreaProvider (insets are not shared across modals on iOS),
// and the main "Back to app" button sits at the bottom, away from the notch.
export default function WebScreen({ url, title, onClose }) {
  const ref = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (url) { setLoading(true); setCanGoBack(false); }
  }, [url]);

  useEffect(() => {
    if (!url) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) ref.current?.goBack();
      else onClose();
      return true;
    });
    return () => sub.remove();
  }, [url, canGoBack, onClose]);

  return (
    <Modal visible={!!url} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.root}>
          <View style={styles.bar}>
            <TouchableOpacity onPress={onClose} hitSlop={12}><Text style={styles.link}>✕ Close</Text></TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(url)} hitSlop={12}><Text style={styles.link}>Browser</Text></TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            {url ? (
              <WebView
                ref={ref}
                source={{ uri: url }}
                onNavigationStateChange={(s) => setCanGoBack(s.canGoBack)}
                onLoadEnd={() => setLoading(false)}
                domStorageEnabled
                allowsBackForwardNavigationGestures
              />
            ) : null}
            {loading && <ActivityIndicator style={styles.loader} size="large" />}
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.footBtn, !canGoBack && styles.disabled]} disabled={!canGoBack} onPress={() => ref.current?.goBack()}>
              <Text style={styles.footText}>‹ Page back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footBtn, styles.primary]} onPress={onClose}>
              <Text style={[styles.footText, { color: '#fff' }]}>Back to app</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { flex: 1, textAlign: 'center', fontWeight: '600', color: COLORS.text, marginHorizontal: 8 },
  link: { color: COLORS.primary, fontSize: 16 },
  loader: { position: 'absolute', top: '50%', alignSelf: 'center' },
  footer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  footBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 8, marginHorizontal: 4, backgroundColor: COLORS.card },
  primary: { backgroundColor: COLORS.primary },
  disabled: { opacity: 0.4 },
  footText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});

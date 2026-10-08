import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, BackHandler, Linking, Platform, RefreshControl, ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const SITE_URL = 'https://home-nader.com/';
const SITE_HOST = 'home-nader.com';

export default function App() {
  const webRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webRef.current) {
        webRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const onShouldStart = useCallback((req) => {
    try {
      const url = new URL(req.url);
      const internal = url.hostname === SITE_HOST || url.hostname.endsWith('.' + SITE_HOST);
      if (internal || req.url.startsWith('about:')) return true;
      Linking.openURL(req.url);
      return false;
    } catch {
      return true;
    }
  }, []);

  const reload = () => {
    setFailed(false);
    setLoading(true);
    webRef.current?.reload();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        {failed ? (
          <View style={styles.center}>
            <Text style={styles.msg}>Can't reach the site. Check your connection.</Text>
            <TouchableOpacity style={styles.btn} onPress={reload}>
              <Text style={styles.btnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ flex: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); webRef.current?.reload(); }} enabled={!canGoBack} />}
          >
            <WebView
              ref={webRef}
              source={{ uri: SITE_URL }}
              onNavigationStateChange={(s) => setCanGoBack(s.canGoBack)}
              onLoadEnd={() => { setLoading(false); setRefreshing(false); }}
              onError={() => { setFailed(true); setLoading(false); setRefreshing(false); }}
              onHttpError={() => setFailed(true)}
              onShouldStartLoadWithRequest={onShouldStart}
              allowsBackForwardNavigationGestures
              javaScriptEnabled
              domStorageEnabled
              sharedCookiesEnabled
              setSupportMultipleWindows={false}
            />
          </ScrollView>
        )}
        {loading && !failed && (
          <View style={styles.loader} pointerEvents="none">
            <ActivityIndicator size="large" />
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  msg: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  btn: { backgroundColor: '#111', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontSize: 16 },
  loader: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});

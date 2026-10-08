import React, { useRef, useState, useEffect } from 'react';
import { ActivityIndicator, BackHandler, Linking, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../config';

// Full-screen in-app browser for pages on the website.
export default function WebScreen({ url, title, onClose }) {
  const ref = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);

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
      <SafeAreaView style={styles.root}>
        <View style={styles.bar}>
          <TouchableOpacity onPress={onClose}><Text style={styles.link}>Close</Text></TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(url)}><Text style={styles.link}>Browser</Text></TouchableOpacity>
        </View>
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
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { flex: 1, textAlign: 'center', fontWeight: '600', color: COLORS.text, marginHorizontal: 8 },
  link: { color: COLORS.primary, fontSize: 16 },
  loader: { position: 'absolute', top: '50%', alignSelf: 'center' },
});

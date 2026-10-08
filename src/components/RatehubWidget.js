import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import { COLORS, RATEHUB_LOADER, SITE_URL } from '../config';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Same script tag the website uses, loaded from the website's origin so Ratehub
// sees the same domain as on home-nader.com.
export const widgetHtml = (w) => `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>html,body{margin:0;padding:8px;font-family:-apple-system,Roboto,sans-serif;background:#fff}</style>
</head><body>
<script src="${RATEHUB_LOADER}" rh-title="${esc(w.title)}" rh-frame-title="${esc(w.frameTitle)}" rh-widget-key="${esc(w.key)}" async></script>
</body></html>`;

export default function RatehubWidget({ widget }) {
  const [loading, setLoading] = useState(true);
  const source = useMemo(() => ({ html: widgetHtml(widget), baseUrl: SITE_URL }), [widget]);

  // Widget iframes load inside the page; anything that tries to navigate the whole
  // page elsewhere (e.g. a "compare rates" link) opens in the in-app browser instead.
  const onShouldStart = (req) => {
    if (req.isTopFrame === false) return true;
    const url = req.url || '';
    if (url === 'about:blank' || url === SITE_URL || url === SITE_URL + '/') return true;
    WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url).catch(() => Alert.alert('Could not open the page', url)));
    return false;
  };

  return (
    <View style={styles.root}>
      <WebView
        key={widget.key}
        source={source}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={onShouldStart}
        onLoadEnd={() => setLoading(false)}
        style={styles.web}
      />
      {loading && <ActivityIndicator style={styles.loader} size="large" />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  web: { flex: 1, backgroundColor: COLORS.bg },
  loader: { position: 'absolute', top: '40%', alignSelf: 'center' },
});

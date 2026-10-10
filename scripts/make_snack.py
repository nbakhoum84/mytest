"""Builds snack/App.js (single-file copy of the app for https://snack.expo.dev).

Run from the project root:  python3 scripts/make_snack.py
Needs Pillow (pip install pillow) to make the small embedded logo and banner images.
"""
import base64
import io
import re
from PIL import Image

ORDER = [
    ('src/config.js', ''), ('src/logo.js', 'logo'), ('src/hero.js', 'hero'), ('src/calc.js', 'calc'),
    ('src/components/Inputs.js', 'inputs'), ('src/components/RatehubWidget.js', 'rh'),
    ('src/screens/HomeScreen.js', 'home'), ('src/screens/BrowseScreen.js', 'browse'),
    ('src/screens/CalculatorsScreen.js', 'calcs'), ('src/screens/MoreScreen.js', 'more'), ('App.js', 'app'),
]

HEADER = """import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
"""


def data_uri(path, size, fmt, **opts):
    img = Image.open(path).convert('RGB')
    img = img.resize(size, Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, fmt, optimize=True, **opts)
    mime = 'image/png' if fmt == 'PNG' else 'image/jpeg'
    return f"data:{mime};base64," + base64.b64encode(buf.getvalue()).decode()


def main():
    logo = data_uri('assets/logo.png', (160, 160), 'PNG')
    with Image.open('assets/hero.jpg') as h:
        w, ht = h.size
    hero = data_uri('assets/hero.jpg', (640, round(640 * ht / w)), 'JPEG', quality=70)
    replacements = {
        'src/logo.js': f"const LOGO = {{ uri: '{logo}' }};\n",
        'src/hero.js': f"const HERO = {{ uri: '{hero}' }};\n",
    }
    out = [HEADER]
    for f, prefix in ORDER:
        s = replacements.get(f) or open(f, encoding='utf8').read()
        s = re.sub(r"^import[\s\S]*?;\n", "", s, flags=re.M)
        s = re.sub(r"^export default ", "", s, flags=re.M)
        s = re.sub(r"^export ", "", s, flags=re.M)
        if prefix and 'const styles' in s:
            s = re.sub(r"\bstyles\b", prefix + "Styles", s)
        out.append(f"// ---- {f}\n" + s)
    with open('snack/App.js', 'w', encoding='utf8') as fh:
        fh.write("\n".join(out) + "\nexport default App;\n")
    print('snack/App.js written')


if __name__ == '__main__':
    main()

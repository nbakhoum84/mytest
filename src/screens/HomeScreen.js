import React, { useEffect, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AGENT, CATEGORIES, COLORS, LOGO_URL } from '../config';
import { HERO } from '../hero';
import { LOGO } from '../logo';

const POPULAR = ['Vancouver', 'Burnaby', 'Surrey', 'Richmond', 'Coquitlam', 'White Rock', 'Langley', 'Delta'];
const residential = CATEGORIES[0];

export default function HomeScreen({ goTo, openWeb }) {
  return (
    <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <HeaderLogo />
        <Text style={styles.name}>Home-Nader</Text>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroLayer} pointerEvents="none">
          <Image source={HERO} style={styles.heroImage} resizeMode="cover" blurRadius={2} />
          <View style={styles.heroTint} />
        </View>
        <View style={styles.heroContent}>
        <Text style={styles.eyebrow}>METRO VANCOUVER REAL ESTATE</Text>
        <Text style={styles.h1}>Find your dream home</Text>
        <Text style={styles.sub}>Homes, condos and presales across Metro Vancouver.</Text>
        <View style={styles.heroBtns}>
          <TouchableOpacity style={styles.btnGold} onPress={() => goTo('browse')}>
            <Text style={styles.btnGoldText}>Browse</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnGhost} onPress={() => openWeb(AGENT.calendly)}>
            <Text style={styles.btnGhostText}>Book a call</Text>
          </TouchableOpacity>
        </View>
        </View>
      </View>

      {/* Popular cities */}
      <Text style={styles.h2}>Popular areas</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {POPULAR.map((c) => (
          <TouchableOpacity key={c} style={styles.pill} onPress={() => openWeb(residential.url(c))}>
            <Text style={styles.pillText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Property types */}
      <Text style={styles.h2}>Explore properties</Text>
      <View style={styles.grid}>
        {[
          ['Residential', 'Homes, condos and townhouses'],
          ['Commercial', 'Retail, office and industrial'],
          ['Presales', 'New and under construction'],
          ['Sold', 'Recent sales and market history'],
        ].map(([t, d]) => (
          <TouchableOpacity key={t} style={styles.gridCard} onPress={() => goTo('browse')}>
            <View style={styles.rule} />
            <Text style={styles.cardTitle}>{t}</Text>
            <Text style={styles.cardDesc}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tools */}
      <Text style={styles.h2}>Tools & guides</Text>
      <TouchableOpacity style={styles.listRow} onPress={() => goTo('calc')}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Mortgage calculators</Text>
          <Text style={styles.cardDesc}>Payment, affordability, rates, CMHC and land transfer tax</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.listRow} onPress={() => goTo('more')}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Buyer’s guide & resources</Text>
          <Text style={styles.cardDesc}>Guides, FAQ, market news and blog</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>

      {/* Contact */}
      <View style={styles.contact}>
        <Text style={styles.contactTitle}>Let’s talk</Text>
        <Text style={styles.contactSub}>Free consultation on buying, selling and investing.</Text>
        <View style={styles.contactRow}>
          <ContactBtn label="Call" onPress={() => Linking.openURL(`tel:${AGENT.phone}`)} />
          <ContactBtn label="WhatsApp" onPress={() => Linking.openURL(AGENT.whatsapp)} />
          <ContactBtn label="Email" onPress={() => Linking.openURL(`mailto:${AGENT.email}`)} />
        </View>
      </View>

      <Text style={styles.footer}>{AGENT.brokerage} · {AGENT.address}</Text>
      <Text style={styles.footer}>Listing information is deemed reliable but not guaranteed.</Text>
    </ScrollView>
  );
}

// Remote logo sized to its own shape; falls back to the bundled logo if it can't load.
function HeaderLogo() {
  const [failed, setFailed] = useState(false);
  const [ratio, setRatio] = useState(1);
  useEffect(() => {
    Image.getSize(LOGO_URL, (w, h) => { if (w && h) setRatio(w / h); }, () => setFailed(true));
  }, []);
  const height = 56;
  const width = Math.min(height * ratio, 160);
  return (
    <Image
      source={failed ? LOGO : { uri: LOGO_URL }}
      style={{ width: failed ? height : width, height, marginRight: 12 }}
      resizeMode="contain"
      onError={() => setFailed(true)}
    />
  );
}

function ContactBtn({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.contactBtn} onPress={onPress}>
      <Text style={styles.contactBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logo: { width: 56, height: 56, marginRight: 12 },
  name: { fontSize: 24, fontWeight: '700', color: COLORS.text, letterSpacing: 0.3 },

  hero: { backgroundColor: COLORS.primary, borderRadius: 20, marginBottom: 8, overflow: 'hidden' },
  // Explicit offsets (not StyleSheet.absoluteFillObject, which is missing in newer React Native).
  // The layer is positioned, so the photo never affects the banner's height.
  heroLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  heroTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,20,40,0.85)' },
  heroContent: { padding: 18 },
  eyebrow: { color: '#f0c98f', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6 },
  h1: { color: '#fff', fontSize: 26, fontWeight: '700', lineHeight: 30, textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  sub: { color: '#ffffff', fontSize: 14, lineHeight: 20, marginTop: 6 },
  heroBtns: { flexDirection: 'row', marginTop: 14 },
  btnGold: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 11, alignItems: 'center', marginRight: 8 },
  btnGoldText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  btnGhost: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  btnGhostText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  h2: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 26, marginBottom: 12 },
  pill: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  pillText: { color: COLORS.text, fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: { width: '48.5%', backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  rule: { width: 28, height: 3, borderRadius: 2, backgroundColor: COLORS.accent, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  cardDesc: { fontSize: 13, color: COLORS.muted, marginTop: 4, lineHeight: 18 },

  listRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  chev: { fontSize: 26, color: COLORS.accentDark, marginLeft: 8 },

  contact: { backgroundColor: COLORS.card, borderRadius: 18, padding: 20, marginTop: 18, borderWidth: 1, borderColor: COLORS.border },
  contactTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  contactSub: { color: COLORS.muted, marginTop: 4, marginBottom: 14 },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between' },
  contactBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginHorizontal: 4 },
  contactBtnText: { color: '#fff', fontWeight: '600' },

  footer: { textAlign: 'center', color: COLORS.muted, fontSize: 12, marginTop: 14 },
});

import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AGENT, CATEGORIES, COLORS } from '../config';

const POPULAR = ['Vancouver', 'Burnaby', 'Surrey', 'Richmond', 'Coquitlam', 'White Rock', 'Langley', 'Delta'];
const residential = CATEGORIES[0];

export default function HomeScreen({ goTo, openWeb }) {
  return (
    <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.avatar}><Text style={styles.avatarText}>NB</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Nader Bakhoum</Text>
          <Text style={styles.creds}>PMP, P.Eng. · {AGENT.brokerage}</Text>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>METRO VANCOUVER REAL ESTATE</Text>
        <Text style={styles.h1}>Discover your dream home</Text>
        <Text style={styles.sub}>Residential, commercial and presale properties, with expert guidance from search to keys.</Text>
        <View style={styles.heroBtns}>
          <TouchableOpacity style={styles.btnGold} onPress={() => goTo('browse')}>
            <Text style={styles.btnGoldText}>Browse listings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnGhost} onPress={() => openWeb(AGENT.calendly)}>
            <Text style={styles.btnGhostText}>Book a consultation</Text>
          </TouchableOpacity>
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
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: COLORS.accent, fontWeight: '700', letterSpacing: 1 },
  name: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  creds: { fontSize: 13, color: COLORS.muted, marginTop: 1 },

  hero: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 24, marginBottom: 8 },
  eyebrow: { color: COLORS.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  h1: { color: '#fff', fontSize: 30, fontWeight: '700', lineHeight: 36 },
  sub: { color: '#cbd5e1', fontSize: 15, lineHeight: 22, marginTop: 12 },
  heroBtns: { marginTop: 22 },
  btnGold: { backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnGoldText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  btnGhost: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  btnGhostText: { color: '#fff', fontWeight: '600', fontSize: 16 },

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

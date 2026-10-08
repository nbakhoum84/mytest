import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AGENT, COLORS } from '../config';

export default function HomeScreen({ goTo, openWeb }) {
  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <View style={styles.hero}>
        <Text style={styles.h1}>Find your home in Metro Vancouver</Text>
        <Text style={styles.sub}>{AGENT.name} · {AGENT.brokerage}</Text>
        <TouchableOpacity style={styles.cta} onPress={() => goTo('browse')}>
          <Text style={styles.ctaText}>Browse listings</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.h2}>Quick actions</Text>
      <Tile label="Mortgage calculator" desc="Estimate your monthly payment" onPress={() => goTo('calc')} />
      <Tile label="Book a free consultation" desc="Investment & ROI analysis" onPress={() => openWeb(AGENT.calendly, 'Book a consultation')} />
      <Tile label="Call Nader" desc={AGENT.phoneDisplay} onPress={() => Linking.openURL(`tel:${AGENT.phone}`)} />
      <Tile label="WhatsApp" desc="Chat directly" onPress={() => Linking.openURL(AGENT.whatsapp)} />
      <Tile label="Guides & resources" desc="Buyer’s guide, FAQ, blog" onPress={() => goTo('more')} />
    </ScrollView>
  );
}

function Tile({ label, desc, onPress }) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 16 },
  hero: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 24, marginBottom: 24 },
  h1: { color: '#fff', fontSize: 26, fontWeight: '700' },
  sub: { color: '#dbeafe', marginTop: 8 },
  cta: { backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginTop: 20 },
  ctaText: { color: COLORS.primary, fontWeight: '700' },
  h2: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  tile: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 10 },
  tileLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  tileDesc: { color: COLORS.muted, marginTop: 2 },
});

import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AGENT, COLORS, RESOURCES } from '../config';

export default function MoreScreen({ openWeb }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  // No backend: opens the user's mail app with the message prefilled.
  const send = () => {
    if (!name.trim() || !message.trim()) {
      Alert.alert('Missing info', 'Please enter your name and a message.');
      return;
    }
    const body = `${message}\n\n${name}${phone ? `\n${phone}` : ''}`;
    Linking.openURL(`mailto:${AGENT.email}?subject=${encodeURIComponent('Inquiry from the app')}&body=${encodeURIComponent(body)}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
      <Text style={styles.h2}>Resources</Text>
      {RESOURCES.map((r) => (
        <TouchableOpacity key={r.title} style={styles.row} onPress={() => openWeb(r.url, r.title)}>
          <Text style={styles.rowText}>{r.title}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <Text style={[styles.h2, { marginTop: 28 }]}>Contact</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={[styles.input, { height: 100 }]} placeholder="Message" value={message} onChangeText={setMessage} multiline textAlignVertical="top" />
      <TouchableOpacity style={styles.btn} onPress={send}><Text style={styles.btnText}>Send email</Text></TouchableOpacity>

      <Text style={styles.info}>{AGENT.phoneDisplay} · {AGENT.email}</Text>
      <Text style={styles.info}>{AGENT.address}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 16 },
  h2: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowText: { fontSize: 16, color: COLORS.text },
  arrow: { fontSize: 20, color: COLORS.muted },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 16 },
  btn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  info: { color: COLORS.muted, textAlign: 'center', marginTop: 12 },
});

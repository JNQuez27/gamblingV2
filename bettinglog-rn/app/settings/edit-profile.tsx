import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../src/core/hooks/useAuth';

// Edit the display name and bio stored in the `profiles` table.
export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState('');

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Edit profile</Text>

      <View style={styles.field}>
        <Text style={styles.label}>DISPLAY NAME</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={Colors.textLight}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>BIO</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={bio}
          onChangeText={setBio}
          placeholder="A short note to yourself…"
          placeholderTextColor={Colors.textLight}
          multiline
        />
      </View>

      <TouchableOpacity style={styles.save} onPress={() => router.back()}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg, padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 12, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, marginBottom: 6 },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    fontSize: 15,
    color: Colors.text,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  save: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 17, alignItems: 'center', marginTop: 8 },
  saveText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});

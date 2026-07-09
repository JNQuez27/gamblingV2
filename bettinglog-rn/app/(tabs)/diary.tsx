import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';

const MOOD_EMOJIS = ['😔', '😕', '😐', '🙂', '😊'];
const MOOD_LABELS = ['Struggling', 'Low', 'Neutral', 'Good', 'Great'];

const ENTRIES = [
  {
    id: 1,
    date: 'Today, 9:41 AM',
    mood: 4,
    title: 'Noticed myself getting frustrated',
    preview: 'Someone cut me off in traffic and I felt the familiar heat rising. Instead of honoring my reaction...',
    tags: ['anger', 'awareness'],
  },
  {
    id: 2,
    date: 'Yesterday, 7:15 PM',
    mood: 3,
    title: 'A moment of unexpected calm',
    preview: 'My coworker disagreed with me in the meeting. I took a breath. I listened. It felt different...',
    tags: ['progress', 'work'],
  },
  {
    id: 3,
    date: 'Mon, Mar 20',
    mood: 2,
    title: 'Tough morning',
    preview: "Woke up with a lot of tension. Couldn't identify exactly what was bothering me, but I sat with it...",
    tags: ['anxiety', 'reflection'],
  },
];

export default function DiaryScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [entryText, setEntryText] = useState('');
  const [showCompose, setShowCompose] = useState(false);

  const handleSave = () => {
    setShowCompose(false);
    setEntryText('');
    setSelectedMood(null);
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#e8f4fd', '#d4eaf7', '#c8e8e0']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>My Diary</Text>
              <Text style={styles.subtitle}>Your private reflection space</Text>
            </View>
            <TouchableOpacity onPress={() => setShowCompose(true)} style={styles.newBtnWrap}>
              <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.newBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.newBtnText}>+ New Entry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Compose panel */}
          {showCompose && (
            <View style={styles.composeCard}>
              <Text style={styles.composeTitle}>How are you feeling?</Text>

              {/* Mood selector */}
              <View style={styles.moodRow}>
                {MOOD_EMOJIS.map((emoji, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedMood(i)}
                    style={[styles.moodBtn, selectedMood === i && styles.moodBtnActive]}
                  >
                    <Text style={{ fontSize: 20 }}>{emoji}</Text>
                    <Text style={styles.moodLabel}>{MOOD_LABELS[i]}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.textarea}
                value={entryText}
                onChangeText={setEntryText}
                placeholder="What's on your mind? Write freely, without judgment..."
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <View style={styles.composeBtns}>
                <TouchableOpacity onPress={() => setShowCompose(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!entryText.trim()}
                  style={{ flex: 2 }}
                >
                  <LinearGradient
                    colors={entryText.trim() ? [Colors.secondaryDark, Colors.secondary] : [Colors.border, Colors.border]}
                    style={styles.saveBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={[styles.saveText, !entryText.trim() && { color: Colors.textLight }]}>Save Entry</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Past entries */}
          <Text style={styles.sectionTitle}>Past Entries</Text>
          {ENTRIES.map((entry) => (
            <TouchableOpacity key={entry.id} style={styles.entryCard} activeOpacity={0.7}>
              <View style={styles.entryTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.entryDate}>{entry.date}</Text>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                </View>
                <Text style={{ fontSize: 24 }}>{MOOD_EMOJIS[entry.mood]}</Text>
              </View>
              <Text style={styles.entryPreview}>{entry.preview}</Text>
              <View style={styles.tagsRow}>
                {entry.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 24 },
  header: { padding: 24, paddingTop: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  newBtnWrap: { borderRadius: 14, overflow: 'hidden' },
  newBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  newBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  body: { padding: 24, gap: 12 },
  composeCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  composeTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  moodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  moodBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 2, borderColor: 'transparent', backgroundColor: Colors.bg, alignItems: 'center', gap: 4 },
  moodBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  moodLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '500' },
  textarea: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
    lineHeight: 22,
  },
  composeBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  saveBtn: { paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  saveText: { fontSize: 14, fontWeight: '600', color: Colors.white },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 4 },
  entryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  entryDate: { fontSize: 10, color: Colors.textLight, letterSpacing: 0.5 },
  entryTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, marginTop: 4 },
  entryPreview: { fontSize: 13, color: Colors.textMuted, lineHeight: 20, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: Colors.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.primaryLight },
  tagText: { fontSize: 11, color: Colors.primaryDark, fontWeight: '500' },
});

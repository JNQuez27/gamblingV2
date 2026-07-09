import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../constants/colors';

const CATEGORIES = ['All', 'Anger', 'Anxiety', 'Habits', 'Mindfulness'];

const ARTICLES = [
  { id: 1, category: 'Mindfulness', title: 'The 6-Second Rule: Why Pausing Changes Everything', desc: 'Science shows that waiting just 6 seconds before reacting reduces the emotional charge significantly.', readTime: '4 min read', icon: '⏸️', color: '#eff6ff', border: '#bfdbfe' },
  { id: 2, category: 'Anger', title: 'Understanding Your Anger Triggers', desc: 'Recognize the patterns that set you off — and learn to interrupt them before they escalate.', readTime: '6 min read', icon: '🌋', color: '#fef2f2', border: '#fecaca' },
  { id: 3, category: 'Habits', title: 'How Small Pauses Build Big Change', desc: 'Micro-moments of awareness compound into lasting behavioral shifts over time.', readTime: '5 min read', icon: '🌱', color: '#f0fdf4', border: '#bbf7d0' },
  { id: 4, category: 'Anxiety', title: 'Breaking the Rumination Loop', desc: 'When your mind replays the same scenario endlessly — here\'s how to gently step out.', readTime: '7 min read', icon: '🔄', color: '#fdf4ff', border: '#e9d5ff' },
  { id: 5, category: 'Mindfulness', title: 'Body Scan: Checking In With Yourself', desc: 'A simple 3-minute practice to notice physical tension and release it before it becomes emotion.', readTime: '3 min read', icon: '🧘', color: '#fefce8', border: '#fde68a' },
];

const PRACTICES = [
  { icon: '🌬️', label: 'Box Breathing', duration: '3 min', desc: 'Calm your nervous system' },
  { icon: '🧠', label: 'Thought Journal', duration: '5 min', desc: 'Examine one belief' },
  { icon: '🚶', label: 'Mindful Walk', duration: '10 min', desc: 'Grounded movement' },
];

export default function LearnScreen() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#e8f4fd', '#d4eaf7', '#c8e8e0']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.title}>Learn & Grow</Text>
          <Text style={styles.subtitle}>Gentle guidance at your own pace</Text>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={Colors.textLight} strokeWidth="2" strokeLinecap="round">
              <Circle cx="11" cy="11" r="8" />
              <Line x1="21" y1="21" x2="16.65" y2="16.65" />
            </Svg>
            <Text style={styles.searchText}>Search articles...</Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Category filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
            {CATEGORIES.map((cat, i) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(i)}
                style={[styles.catBtn, activeCategory === i && styles.catBtnActive]}
              >
                <Text style={[styles.catText, activeCategory === i && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quick Practices */}
          <Text style={styles.sectionTitle}>Quick Practices</Text>
          <View style={styles.practicesRow}>
            {PRACTICES.map((p) => (
              <TouchableOpacity key={p.label} style={styles.practiceCard} activeOpacity={0.7}>
                <Text style={{ fontSize: 22 }}>{p.icon}</Text>
                <Text style={styles.practiceLabel}>{p.label}</Text>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{p.duration}</Text>
                </View>
                <Text style={styles.practiceDesc}>{p.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Articles */}
          <Text style={styles.sectionTitle}>Featured Articles</Text>
          {ARTICLES.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={[styles.articleCard, { backgroundColor: article.color, borderColor: article.border }]}
              activeOpacity={0.75}
            >
              <View style={styles.articleIcon}>
                <Text style={{ fontSize: 24 }}>{article.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.articleMeta}>
                  <Text style={styles.articleCat}>{article.category}</Text>
                  <Text style={styles.articleTime}>{article.readTime}</Text>
                </View>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleDesc}>{article.desc}</Text>
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
  title: { fontSize: 22, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 4, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchText: { fontSize: 14, color: Colors.textLight },
  body: { padding: 24, gap: 12 },
  catScroll: { marginHorizontal: -24, marginBottom: 8 },
  catContent: { paddingHorizontal: 24, gap: 8 },
  catBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  catBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 13, color: Colors.textMuted },
  catTextActive: { color: Colors.white, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 4 },
  practicesRow: { flexDirection: 'row', gap: 10 },
  practiceCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  practiceLabel: { fontSize: 12, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  durationBadge: { backgroundColor: Colors.bg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  durationText: { fontSize: 10, color: Colors.secondaryDark, fontWeight: '600' },
  practiceDesc: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', lineHeight: 14 },
  articleCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  articleIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  articleMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  articleCat: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.8 },
  articleTime: { fontSize: 11, color: Colors.textLight },
  articleTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, lineHeight: 20, marginBottom: 5 },
  articleDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
});

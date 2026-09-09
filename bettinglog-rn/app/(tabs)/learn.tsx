import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { MENTAL_HEALTH_TERMS } from '@/constants/mentalHealthTerms';
import type { GamblingCategory } from '@/constants/gamblingApps';
import { getChosenApps, categoriesFor } from '@/services/gamblingProfile';
import {
  IconBulb,
  IconTarget,
  IconUsers,
  IconWind,
  IconWaves,
  IconLeaf,
  IconExternalLink,
  IconPlus,
  IconMinus,
} from '@/components/ui/icons';

type ResourceIcon = React.ComponentType<{ size?: number; color?: string }>;

// Categories drive real filtering of the resource list below.
const CATEGORIES = ['All', 'Understand', 'Tools', 'Support'] as const;

const CATEGORY_META: Record<string, { Icon: ResourceIcon; accent: string; tint: string }> = {
  Understand: { Icon: IconBulb, accent: '#c78a2a', tint: '#fdf3e0' },
  Tools: { Icon: IconTarget, accent: Colors.primaryDark, tint: '#eef4fb' },
  Support: { Icon: IconUsers, accent: Colors.secondaryDark, tint: '#e9f5ef' },
};

// Real-world learning resources - reputable, free organizations. Tapping a
// card opens the actual site in the browser (no API key needed). `topics` tags
// a card to a gambling type so the Learn screen can float the ones that match
// what the user reported using; untagged cards are universal.
type Resource = {
  source: string;
  title: string;
  desc: string;
  category: 'Understand' | 'Tools' | 'Support';
  url: string;
  topics?: GamblingCategory[];
};

const RESOURCES: Resource[] = [
  {
    source: 'HelpGuide.org',
    title: 'How gambling hooks the brain - and how to break the cycle',
    desc: 'A plain-language guide to problem gambling: signs, triggers, and recovery steps.',
    category: 'Understand',
    url: 'https://www.helpguide.org/mental-health/addiction/gambling-addiction-and-problem-gambling',
  },
  {
    source: 'GambleAware',
    title: 'Free, confidential advice about your gambling',
    desc: 'Self-assessment, spending calculators, and practical safer-gambling advice.',
    category: 'Understand',
    url: 'https://www.gambleaware.org/',
  },
  {
    source: 'SMART Recovery',
    title: 'CBT-based tools and worksheets for beating urges',
    desc: 'Science-backed exercises - urge logs, cost-benefit analysis, change plans.',
    category: 'Tools',
    url: 'https://smartrecovery.org/gambling-addiction',
  },
  {
    source: 'GamCare',
    title: 'Self-guided workbook to cut down or stop',
    desc: 'Step-by-step modules from the team behind the National Gambling Helpline.',
    category: 'Tools',
    url: 'https://www.gamcare.org.uk/self-help/self-help-resources/',
  },
  {
    source: 'Gambling Therapy',
    title: 'Free online groups and 1-to-1 emotional support, worldwide',
    desc: 'A global service with group sessions and a multilingual support community.',
    category: 'Support',
    url: 'https://gamblingtherapy.org/',
  },
  {
    source: 'Gamblers Anonymous',
    title: 'Find a meeting near you; take the 20-questions self-test',
    desc: 'The long-running fellowship of people recovering together.',
    category: 'Support',
    url: 'https://gamblersanonymous.org/',
  },
  {
    source: 'NHS (UK)',
    title: 'Help for problems with gambling',
    desc: 'Signs to watch for, self-help steps, and where to get free treatment.',
    category: 'Understand',
    url: 'https://www.nhs.uk/live-well/addiction-support/gambling-addiction/',
  },
  {
    source: 'Mayo Clinic',
    title: 'Compulsive gambling: symptoms and causes',
    desc: 'A clear medical overview of how the disorder develops and its risk factors.',
    category: 'Understand',
    url: 'https://www.mayoclinic.org/diseases-conditions/compulsive-gambling/symptoms-causes/syc-20355178',
  },
  {
    source: 'GamCare',
    title: 'Money and debt: getting back in control',
    desc: 'Practical steps to block payments, manage debt, and protect your finances.',
    category: 'Tools',
    url: 'https://www.gamcare.org.uk/self-help/managing-your-money/',
  },
  {
    source: 'Gambling Therapy',
    title: 'Self-help tools and daily practice exercises',
    desc: 'Downloadable worksheets and coping techniques you can start today.',
    category: 'Tools',
    url: 'https://www.gamblingtherapy.org/self-help/',
  },
  {
    source: 'Gam-Anon',
    title: 'Support for family and friends of a gambler',
    desc: 'You are affected too - a fellowship for the people around the gambler.',
    category: 'Support',
    url: 'https://www.gam-anon.org/',
  },

  // Type-specific cards - surfaced first for users who reported that kind of app.
  {
    source: 'NCPG',
    title: 'Sports betting: the fast-bet trap',
    desc: 'Why in-play and app betting speed up losses, and how to slow the cycle down.',
    category: 'Understand',
    url: 'https://www.ncpgambling.org/',
    topics: ['sports'],
  },
  {
    source: 'HelpGuide.org',
    title: 'Casino & slots apps: built to keep you playing',
    desc: 'The design tricks behind slots and online casino games - and how to resist them.',
    category: 'Understand',
    url: 'https://www.helpguide.org/mental-health/addiction/gambling-addiction-and-problem-gambling',
    topics: ['casino'],
  },
  {
    source: 'GamCare',
    title: 'Fast, repeated betting: getting back in control',
    desc: 'Practical steps for high-frequency betting like e-sabong and quick rounds.',
    category: 'Tools',
    url: 'https://www.gamcare.org.uk/self-help/self-help-resources/',
    topics: ['e-sabong'],
  },
  {
    source: 'GambleAware',
    title: 'Lottery & scratchcards: the "harmless" habit that adds up',
    desc: 'Why frequent lotto play still matters, and how to set limits that hold.',
    category: 'Understand',
    url: 'https://www.gambleaware.org/',
    topics: ['lottery'],
  },
  {
    source: 'SMART Recovery',
    title: 'Poker & skill games: the "I can win it back" urge',
    desc: 'CBT tools for games where skill masks the real financial risk.',
    category: 'Tools',
    url: 'https://smartrecovery.org/gambling-addiction',
    topics: ['poker'],
  },
];

// Friendly labels + a couple of type-specific insights per gambling category,
// used to focus the "Today's focus" card and the resource ordering.
const CATEGORY_LABEL: Record<GamblingCategory, string> = {
  casino: 'casino & slots',
  sports: 'sports betting',
  'e-sabong': 'e-sabong',
  lottery: 'lottery',
  poker: 'poker',
  other: 'gambling',
};

const CATEGORY_TIPS: Partial<Record<GamblingCategory, string[]>> = {
  sports: [
    'Live "in-play" odds are engineered to keep you betting every minute - the faster the bet, the faster the loss.',
    'A "sure thing" parlay is the house edge stacked several times over. The more legs, the worse your odds.',
  ],
  casino: [
    'Slots and casino apps never "warm up" - every spin is independent. A cold streak is not "due" to end.',
    'Near-misses are designed to feel like almost-wins. They are losses dressed up to keep you spinning.',
  ],
  'e-sabong': [
    'Quick, back-to-back rounds give urges no time to fade. Building in a pause between rounds is a real tool.',
    'High-frequency betting hides how fast money adds up - log each round for one day and read it back.',
  ],
  lottery: [
    'Daily draws and scratchcards feel small, but frequency is the cost. Add up a month of tickets.',
    'The jackpot odds do not change with a "lucky" number or shop. Every ticket is the same long shot.',
  ],
  poker: [
    'Skill narrows the house edge but never removes variance - a good player can still lose for a long time.',
    'Chasing to "win it back" turns a bad night into a worse one. Set a stop-loss before you sit down.',
  ],
};

// A pool of short, evidence-based insights. One is surfaced as "Today's focus",
// rotating by the calendar day so the screen shows something fresh daily.
const DAILY_TIPS = [
  'Urges are like waves - they rise, peak, and always fall. Most pass within 10 to 15 minutes if you do not act.',
  'Delay, do not decide. Telling yourself "not now, maybe in an hour" breaks the automatic pull.',
  'Remove the shortcut. Deleting the app or logging out adds friction that buys you time to think.',
  'Name the trigger. Boredom, stress, and payday are common - spotting yours is half the battle.',
  'Tell one person you trust. Secrecy feeds gambling; sharing your goal makes it real.',
  'Track every bet for a week without judgment. The numbers speak louder than any lecture.',
  'Chasing losses is the trap. The odds do not remember your last bet - the house edge never changes.',
  'Plan the money before payday. Money that has a job (bills, savings) is money that cannot be bet.',
  'Replace, do not just remove. Line up a walk, a call, or a game for the moment an urge hits.',
  'Small wins compound. One bet-free day is proof it is possible; stack them one at a time.',
  'HALT: Hungry, Angry, Lonely, Tired. These states weaken control - address them first.',
  'Self-exclusion is a strength, not a defeat. Blocking access is a decision your future self will thank you for.',
  'Progress is not a straight line. A slip you log honestly is data, not failure.',
  'Celebrate the bet-free days and how you feel, not just the numbers. Notice what is getting easier.',
];

// Guided practices with real steps - tap to expand and follow along.
const PRACTICES = [
  {
    Icon: IconWind,
    accent: Colors.primaryDark,
    label: 'Box Breathing',
    duration: '3 min',
    desc: 'Calm your nervous system',
    steps: [
      'Breathe in through your nose for 4 counts.',
      'Hold for 4 counts.',
      'Breathe out slowly for 4 counts.',
      'Hold empty for 4 counts - repeat for 3 minutes.',
    ],
  },
  {
    Icon: IconWaves,
    accent: '#c78a2a',
    label: 'Urge Surfing',
    duration: '10 min',
    desc: 'Ride the urge until it passes',
    steps: [
      "Notice the urge without acting - name it: 'this is an urge'.",
      'Find where it sits in your body (chest, hands, stomach).',
      'Watch it like a wave: it rises, peaks, and always falls.',
      'Breathe through the peak - most urges pass within 10 minutes.',
    ],
  },
  {
    Icon: IconLeaf,
    accent: Colors.secondaryDark,
    label: 'Mindful Walk',
    duration: '10 min',
    desc: 'Grounded movement, phone-free',
    steps: [
      'Leave your phone (and betting apps) behind.',
      'Walk at an easy pace; notice 5 things you can see.',
      'Notice 3 things you can hear and 2 you can feel.',
      'When gambling thoughts surface, return to your senses.',
    ],
  },
];

export default function LearnScreen() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [query, setQuery] = useState('');
  const [openTerm, setOpenTerm] = useState<string | null>(null);
  const [openPractice, setOpenPractice] = useState<string | null>(null);

  const q = query.trim().toLowerCase();

  // The gambling types the user reported using. 'other'/"Others" carries no
  // focus, so it falls through to the default (random) rotation.
  const [focusCats, setFocusCats] = useState<GamblingCategory[]>([]);
  useEffect(() => {
    getChosenApps()
      .then((apps) => setFocusCats(categoriesFor(apps).filter((c) => c !== 'other')))
      .catch(() => {});
  }, []);
  const focused = focusCats.length > 0;
  const focusLabel = focusCats.map((c) => CATEGORY_LABEL[c]).join(', ');

  // Day-of-epoch: changes at midnight, drives the daily rotation below.
  const dayIndex = Math.floor(Date.now() / 86_400_000);

  // Today's focus: a type-specific insight when the user has a focus, else the
  // general rotating tip.
  const todayTip = useMemo(() => {
    if (focused) {
      const pool = CATEGORY_TIPS[focusCats[dayIndex % focusCats.length]];
      if (pool && pool.length) return pool[dayIndex % pool.length];
    }
    return DAILY_TIPS[dayIndex % DAILY_TIPS.length];
  }, [focused, focusCats, dayIndex]);

  // Focused: float resources matching the user's types first, then universal
  // cards, then the rest. Unfocused: rotate by the day so nothing feels stale.
  const orderedResources = useMemo(() => {
    if (!focused) {
      const shift = dayIndex % RESOURCES.length;
      return [...RESOURCES.slice(shift), ...RESOURCES.slice(0, shift)];
    }
    const rank = (r: Resource) => {
      if (r.topics?.some((t) => focusCats.includes(t))) return 0; // matches user's type
      if (!r.topics) return 1; // universal
      return 2; // tagged for a different type
    };
    return [...RESOURCES].sort((a, b) => rank(a) - rank(b));
  }, [focused, focusCats, dayIndex]);

  // Search + category filtering both actually apply to the resource list.
  const filteredResources = useMemo(() => {
    const cat = CATEGORIES[activeCategory];
    return orderedResources.filter((r) => {
      if (cat !== 'All' && r.category !== cat) return false;
      if (!q) return true;
      return `${r.source} ${r.title} ${r.desc}`.toLowerCase().includes(q);
    });
  }, [orderedResources, activeCategory, q]);

  // The search box also narrows the glossary.
  const filteredTerms = useMemo(
    () =>
      q
        ? MENTAL_HEALTH_TERMS.filter((t) => `${t.term} ${t.short} ${t.detail}`.toLowerCase().includes(q))
        : MENTAL_HEALTH_TERMS,
    [q],
  );

  const openResource = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <LinearGradient colors={Colors.headerGradient} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.title}>Learn & Grow</Text>
          <Text style={styles.subtitle}>Real-world help, at your own pace</Text>

          {/* Working search */}
          <View style={styles.searchBar}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={Colors.textLight} strokeWidth="2" strokeLinecap="round">
              <Circle cx="11" cy="11" r="8" />
              <Line x1="21" y1="21" x2="16.65" y2="16.65" />
            </Svg>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search resources and terms…"
              placeholderTextColor={Colors.textLight}
              accessibilityLabel="Search resources and terms"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear search">
                <Text style={styles.searchClear}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Today's focus - a short insight that rotates every day */}
          <View style={styles.todayCard}>
            <View style={styles.todayIcon}>
              <IconBulb size={18} color="#c78a2a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.todayLabel}>TODAY'S FOCUS</Text>
              <Text style={styles.todayText}>{todayTip}</Text>
            </View>
          </View>

          {/* Category filter - actually filters the list below */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
            {CATEGORIES.map((cat, i) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(i)}
                style={[styles.catBtn, activeCategory === i && styles.catBtnActive]}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityState={{ selected: activeCategory === i }}
                accessibilityLabel={`${cat} resources`}
              >
                <Text style={[styles.catText, activeCategory === i && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quick Practices - tap to expand the guided steps */}
          <Text style={styles.sectionTitle}>Quick Practices</Text>
          <View style={styles.practiceCol}>
            {PRACTICES.map((p) => {
              const open = openPractice === p.label;
              return (
                <TouchableOpacity
                  key={p.label}
                  style={styles.practiceCard}
                  activeOpacity={0.75}
                  onPress={() => setOpenPractice(open ? null : p.label)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  accessibilityLabel={`${p.label}, ${p.duration}. ${p.desc}. Tap to ${open ? 'collapse' : 'see the steps'}`}
                >
                  <View style={styles.practiceHead}>
                    <View style={[styles.practiceIcon, { backgroundColor: p.accent + '14' }]}>
                      <p.Icon size={18} color={p.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.practiceLabel}>{p.label}</Text>
                      <Text style={styles.practiceDesc}>{p.desc}</Text>
                    </View>
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>{p.duration}</Text>
                    </View>
                    {open ? <IconMinus size={14} color={Colors.textMuted} /> : <IconPlus size={14} color={Colors.textMuted} />}
                  </View>
                  {open && (
                    <View style={styles.stepsWrap}>
                      {p.steps.map((s, si) => (
                        <View key={si} style={styles.stepRow}>
                          <View style={[styles.stepNum, { backgroundColor: p.accent + '14' }]}>
                            <Text style={[styles.stepNumText, { color: p.accent }]}>{si + 1}</Text>
                          </View>
                          <Text style={styles.stepText}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Real-world resources */}
          <View>
            <Text style={styles.sectionTitle}>Learn From the Real World</Text>
            <Text style={styles.sectionCaption}>
              {focused
                ? `Focused on your ${focusLabel} use - trusted, free organizations`
                : 'Trusted, free organizations - each card opens the real site'}
            </Text>
          </View>
          {filteredResources.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>Nothing matches "{query}" in this category.</Text>
            </View>
          ) : (
            filteredResources.map((r) => {
              const meta = CATEGORY_META[r.category];
              return (
                <TouchableOpacity
                  key={r.url}
                  style={styles.resourceCard}
                  activeOpacity={0.75}
                  onPress={() => openResource(r.url)}
                  accessibilityRole="link"
                  accessibilityLabel={`${r.title} - ${r.source}. Opens in browser.`}
                >
                  <View style={[styles.resourceIcon, { backgroundColor: meta.tint }]}>
                    <meta.Icon size={18} color={meta.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.resourceMeta}>
                      <Text style={[styles.resourceSource, { color: meta.accent }]}>{r.source}</Text>
                      <Text style={styles.resourceCat}>{r.category}</Text>
                    </View>
                    <Text style={styles.resourceTitle}>{r.title}</Text>
                    <Text style={styles.resourceDesc}>{r.desc}</Text>
                  </View>
                  <IconExternalLink size={15} color={Colors.textLight} />
                </TouchableOpacity>
              );
            })
          )}

          {/* Know the terms - gambling ↔ mental health glossary */}
          <Text style={styles.sectionTitle}>Know the Terms</Text>
          <Text style={styles.glossaryIntro}>
            Naming what you feel is the first step to controlling it. Tap a term to expand.
          </Text>
          <View style={styles.glossaryCard}>
            {filteredTerms.length === 0 && (
              <Text style={styles.noResultsText}>No terms match "{query}".</Text>
            )}
            {filteredTerms.map((t, i) => {
              const open = openTerm === t.term;
              return (
                <View key={t.term}>
                  {i > 0 && <View style={styles.glossaryDivider} />}
                  <TouchableOpacity
                    onPress={() => setOpenTerm(open ? null : t.term)}
                    style={styles.glossaryRow}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    accessibilityLabel={`${t.term}: ${t.short}`}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.glossaryTerm}>{t.term}</Text>
                      <Text style={styles.glossaryShort}>{t.short}</Text>
                      {open && <Text style={styles.glossaryDetail}>{t.detail}</Text>}
                    </View>
                    {open ? <IconMinus size={14} color={Colors.textMuted} /> : <IconPlus size={14} color={Colors.textMuted} />}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
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
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text, paddingVertical: 10 },
  searchClear: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  body: { padding: 24, gap: 12 },
  catScroll: { marginHorizontal: -24, marginBottom: 4 },
  catContent: { paddingHorizontal: 24, gap: 8 },
  catBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  catTextActive: { color: Colors.white, fontWeight: '700' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 6 },
  sectionCaption: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  todayCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#fff4e0',
    borderRadius: 18,
    padding: 14,
  },
  todayIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center' },
  todayLabel: { fontSize: 11, fontWeight: '700', color: '#c78a2a', letterSpacing: 1, marginBottom: 3 },
  todayText: { fontSize: 13, color: Colors.text, lineHeight: 19 },

  // Practices
  practiceCol: { gap: 10 },
  practiceCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    padding: 14,
    shadowColor: '#22303e',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  practiceHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  practiceIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  practiceLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  practiceDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  durationBadge: { backgroundColor: Colors.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  durationText: { fontSize: 11, color: Colors.secondaryDark, fontWeight: '700' },
  stepsWrap: { marginTop: 14, gap: 10 },
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumText: { fontSize: 11, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 13, color: Colors.textMuted, lineHeight: 19 },

  // Resources
  resourceCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    shadowColor: '#22303e',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  resourceIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  resourceMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  resourceSource: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  resourceCat: { fontSize: 11, color: Colors.textLight },
  resourceTitle: { fontSize: 14.5, fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: 3 },
  resourceDesc: { fontSize: 12.5, color: Colors.textMuted, lineHeight: 18 },
  noResults: { backgroundColor: Colors.bgCard, borderRadius: 16, padding: 20, alignItems: 'center' },
  noResultsText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },

  // Glossary
  glossaryIntro: { fontSize: 12, color: Colors.textLight, marginTop: -6 },
  glossaryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#22303e',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  glossaryDivider: { height: 1, backgroundColor: Colors.border },
  glossaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 13 },
  glossaryTerm: { fontSize: 14, fontWeight: '700', color: Colors.text },
  glossaryShort: { fontSize: 12, color: Colors.textMuted, marginTop: 2, lineHeight: 17 },
  glossaryDetail: { fontSize: 12.5, color: Colors.textMuted, marginTop: 8, lineHeight: 19, borderLeftWidth: 3, borderLeftColor: Colors.primaryLight, paddingLeft: 10 },
  glossaryChevron: { fontSize: 18, color: Colors.textLight, fontWeight: '600' },
});

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { styles } from '../styles';
import { useAppContext } from '../../context/app-context';

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const moodOptions = [
  { emoji: '😄', label: 'Great',      value: 'great' },
  { emoji: '🙂', label: 'Good',       value: 'good' },
  { emoji: '😐', label: 'Okay',       value: 'okay' },
  { emoji: '😌', label: 'Calm',       value: 'calm' },
  { emoji: '💪', label: 'In Control', value: 'in-control' },
  { emoji: '😔', label: 'Struggling', value: 'struggling' },
  { emoji: '😰', label: 'Anxious',    value: 'anxious' },
  { emoji: '😤', label: 'Tempted',    value: 'tempted' },
  { emoji: '😶', label: 'Neutral',    value: 'neutral' },
  { emoji: '😢', label: 'Sad',        value: 'sad' },
  { emoji: '😠', label: 'Angry',      value: 'angry' },
  { emoji: '🥱', label: 'Tired',      value: 'tired' },
];

const MOOD_EMOJI_MAP: Record<string, string> = {
  great:        '😄',
  good:         '🙂',
  okay:         '😐',
  calm:         '😌',
  'in-control': '💪',
  struggling:   '😔',
  anxious:      '😰',
  tempted:      '😤',
  neutral:      '😶',
  sad:          '😢',
  angry:        '😠',
  tired:        '🥱',
};

const DEFAULT_DONE_EMOJI = '';

const checkInPrompts = [
  "What's keeping you strong today?",
  "What's one thing you're proud of this week?",
  "How are you really feeling right now?",
  "What helped you stay on track today?",
];

const conversionItems = [
  { id: 'rice', icon: '🍚', name: 'sacks of rice (5kg)', price: 280, color: 'bg-amber-50 border-amber-100' },
  { id: 'load', icon: '📱', name: 'mobile load (₱100)', price: 100, color: 'bg-blue-50 border-blue-100' },
  { id: 'meal', icon: '🍱', name: 'full meals for the family', price: 150, color: 'bg-green-50 border-green-100' },
  { id: 'medicine', icon: '💊', name: 'days of medicine', price: 50, color: 'bg-red-50 border-red-100' },
  { id: 'school', icon: '📚', name: 'school supplies sets', price: 200, color: 'bg-purple-50 border-purple-100' },
  { id: 'savings', icon: '🏦', name: 'months of small savings', price: 500, color: 'bg-teal-50 border-teal-100' },
];

interface ConvertCardProps {
  icon: string;
  count: number;
  itemName: string;
  unitPrice: number;
  colorClass: string;
}

const ConvertCard: React.FC<ConvertCardProps> = ({ icon, count, itemName, unitPrice, colorClass }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, border: '1.5px solid' }}
    className={colorClass}
  >
    <span style={{ fontSize: 28, lineHeight: 1 }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <p style={{ fontWeight: 800, fontSize: 18, margin: 0, color: 'var(--color-text, #1a1a2e)', lineHeight: 1.1 }}>
        {count < 1 ? 'Less than 1' : `${count.toLocaleString()}x`}
      </p>
      <p style={{ fontSize: 12, color: 'var(--color-text-light, #888)', margin: '2px 0 0' }}>{itemName}</p>
    </div>
    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-light, #aaa)', background: 'rgba(0,0,0,0.05)', borderRadius: 8, padding: '3px 7px', letterSpacing: '0.04em' }}>
      ₱{unitPrice} each
    </span>
  </motion.div>
);

const WeeklyStreak: React.FC = () => {
  const { streak, streakMarked, markStreak, addDiaryEntry, diaryEntries } = useAppContext();

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [promptIndex] = useState(() => Math.floor(Math.random() * checkInPrompts.length));

  const [amount, setAmount] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [conversions, setConversions] = useState<(typeof conversionItems[0] & { count: number })[]>([]);

  const numAmount = parseFloat(amount) || 0;
  const todayIndex = streakMarked ? streak - 1 : streak;

  /** Count consecutive days with diary entries going back from today. */
  function computedStreak(): number {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (diaryEntries[dateStr]) {
        count++;
      } else {
        // Allow today to count even if the entry was just added this session
        if (i === 0 && (submitted || streakMarked)) {
          count++;
        }
        break;
      }
    }
    return count;
  }

  function todayDateStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  /** Returns the YYYY-MM-DD date string for a given week-day index */
  function dateForDayIndex(i: number): string {
    const today = new Date();
    const diff = todayIndex - i;
    const d = new Date(today);
    d.setDate(today.getDate() - diff);
    return d.toISOString().split('T')[0];
  }

  /** Returns the emoji to show inside a completed day circle */
  function getEmojiForDay(i: number): string {
    // Today just submitted — use freshly selected mood
    if (submitted && i === todayIndex && selectedMood) {
      return MOOD_EMOJI_MAP[selectedMood] ?? DEFAULT_DONE_EMOJI;
    }
    // Already marked before this session
    if (streakMarked && i === todayIndex) {
      const entry = diaryEntries[todayDateStr()];
      return (entry ? MOOD_EMOJI_MAP[entry.mood] : null) ?? DEFAULT_DONE_EMOJI;
    }
    // Past days — look up diary entry by date
    const entry = diaryEntries[dateForDayIndex(i)];
    return (entry ? MOOD_EMOJI_MAP[entry.mood] : null) ?? DEFAULT_DONE_EMOJI;
  }

  function handleDayClick(i: number) {
    if (i === todayIndex && !streakMarked && !submitted) {
      setShowCheckIn((prev) => !prev);
    }
  }

  function handleSubmit() {
    if (!selectedMood) return;
    addDiaryEntry(todayDateStr(), {
      mood: selectedMood,
      note: note.trim(),
      timestamp: new Date().toISOString(),
    });
    markStreak();
    setSubmitted(true);
    setTimeout(() => setShowCheckIn(false), 2200);
  }

  function handleConvert() {
    if (numAmount <= 0) return;
    setConversions(conversionItems.map((item) => ({ ...item, count: Math.floor(numAmount / item.price) })));
    setShowResults(true);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAmount(e.target.value);
    if (showResults) setShowResults(false);
  }

  return (
    <>
      <div style={styles.weeklyStreakContainer}>
        <div style={styles.weeklyStreakHeader}>
          <div>
            <h2 style={styles.weeklyStreakTitle}>Weekly Streak</h2>
            <p style={styles.weeklyStreakSubtitle}>Keep the momentum going</p>
          </div>
          <div style={styles.streakCounter}>
            <span style={{ fontSize: '18px' }}>🔥</span>
            <span style={styles.streakCount}>{computedStreak()}</span>
          </div>
        </div>

        <div style={styles.weekDaysContainer}>
          {weekDays.map((day, i) => {
            const isDone =
              i < todayIndex ||
              (submitted && i === todayIndex) ||
              (streakMarked && i === todayIndex);
            const isToday = i === todayIndex;
            const isTappable = isToday && !streakMarked && !submitted;

            return (
              <div key={i} style={styles.dayContainer}>
                <motion.div
                  whileHover={isTappable ? { scale: 1.1 } : {}}
                  whileTap={isTappable ? { scale: 0.95 } : {}}
                  onClick={() => handleDayClick(i)}
                  style={{
                    ...styles.dayCircle,
                    background: isDone
                      ? 'rgba(79,154,116,0.10)'
                      : isTappable
                      ? 'transparent'
                      : 'var(--color-bg)',
                    border: isDone
                      ? '2px solid rgba(79,154,116,0.35)'
                      : isTappable
                      ? '2px dashed var(--color-secondary)'
                      : 'none',
                    boxShadow: 'none',
                    cursor: isTappable ? 'pointer' : 'default',
                  }}
                >
                  {isDone ? (
                    (() => {
                      const emoji = getEmojiForDay(i);
                      return emoji ? (
                        <motion.span
                          initial={submitted && i === todayIndex ? { scale: 0 } : false}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                          style={{ fontSize: 20, lineHeight: 1, display: 'flex' }}
                        >
                          {emoji}
                        </motion.span>
                      ) : null;
                    })()
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 500 }}>
                      {isTappable ? '✚' : i + 1}
                    </span>
                  )}
                </motion.div>
                <span
                  style={{
                    ...styles.dayLabel,
                    color: isToday ? 'var(--color-secondary-dark)' : 'var(--color-text-light)',
                    fontWeight: isToday ? 700 : 400,
                  }}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showCheckIn && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
              background: 'var(--color-card, #ffffff)',
              borderRadius: 20,
              padding: 20,
              marginTop: 12,
              boxShadow: '0 8px 32px rgba(79,154,116,0.13)',
              border: '1.5px solid rgba(79,154,116,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0, color: 'var(--color-text)' }}>Daily Check-in</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '3px 0 0', fontStyle: 'italic', lineHeight: 1.4 }}>
                  &ldquo;{checkInPrompts[promptIndex]}&rdquo;
                </p>
              </div>
            </div>

            {/* Mood scroll strip */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              {/* fade hint right */}
              <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: 28,
                background: 'linear-gradient(to left, var(--color-card, #fff) 40%, transparent)',
                pointerEvents: 'none', zIndex: 1, borderRadius: '0 14px 14px 0',
              }} />
              <div style={{
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                paddingBottom: 4,
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
              }}
                className="hide-scrollbar"
              >
                {moodOptions.map((mood) => {
                  const isSelected = selectedMood === mood.value;
                  return (
                    <motion.button
                      key={mood.value}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => !submitted && setSelectedMood(mood.value)}
                      style={{
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        padding: '10px 10px 8px',
                        borderRadius: 14,
                        border: isSelected ? '2px solid var(--color-secondary)' : '2px solid transparent',
                        background: isSelected ? 'rgba(79,154,116,0.08)' : 'var(--color-bg, #f5f5f5)',
                        cursor: submitted ? 'default' : 'pointer',
                        transition: 'all 0.18s ease',
                        minWidth: 58,
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{mood.emoji}</span>
                      <span style={{
                        fontSize: 9,
                        fontWeight: 600,
                        color: isSelected ? 'var(--color-secondary-dark)' : 'var(--color-text-light)',
                        letterSpacing: '0.03em',
                        whiteSpace: 'nowrap',
                      }}>
                        {mood.label}
                      </span>
                    </motion.button>
                  );
                })}
                {/* spacer so last item clears the fade */}
                <div style={{ flexShrink: 0, width: 20 }} />
              </div>
            </div>

            <textarea
              value={note}
              onChange={(e) => !submitted && setNote(e.target.value)}
              placeholder="Add a note (optional)..."
              rows={2}
              style={{
                width: '100%',
                borderRadius: 12,
                border: '1.5px solid rgba(0,0,0,0.08)',
                padding: '10px 12px',
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'none',
                background: 'var(--color-bg, #f9f9f9)',
                color: 'var(--color-text)',
                outline: 'none',
                boxSizing: 'border-box' as const,
                marginBottom: 12,
              }}
            />

            {!submitted ? (
              <motion.button
                whileTap={selectedMood ? { scale: 0.97 } : {}}
                onClick={handleSubmit}
                disabled={!selectedMood}
                style={{
                  ...styles.ctaButton,
                  opacity: selectedMood ? 1 : 0.45,
                  cursor: selectedMood ? 'pointer' : 'not-allowed',
                  filter: selectedMood ? 'none' : 'grayscale(0.4)',
                  pointerEvents: selectedMood ? 'auto' : 'none',
                }}
              >
                Mark my streak!
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={styles.ctaButtonCompleted}
              >
                <span style={{ fontSize: 20 }}>🎉</span>
                <div>
                  <p style={styles.ctaButtonCompletedText}>Amazing! Streak marked!</p>
                  <p style={styles.ctaButtonCompletedSubtext}>Keep it going tomorrow.</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Peso converter */}
      <div
        style={{
          background: 'var(--color-card, #ffffff)',
          borderRadius: 20,
          padding: '20px',
          marginTop: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text, #1a1a2e)', margin: '0 0 4px', textAlign: 'center' }}>
          What&apos;s the bet really worth?
        </h2>
        <p style={{ fontSize: 11, color: 'var(--color-text-light, #888)', textAlign: 'center', margin: '0 0 16px' }}>
          Type how much you were about to bet
        </p>

        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 26,
              fontWeight: 800,
              color: 'var(--color-text-light, #bbb)',
              pointerEvents: 'none',
            }}
          >
            ₱
          </span>
          <input
            type="number"
            value={amount}
            onChange={handleInputChange}
            placeholder="0"
            style={{
              width: '100%',
              background: 'var(--color-bg, #f5f5f5)',
              border: '2px solid transparent',
              borderRadius: 14,
              padding: '14px 16px 14px 40px',
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--color-text, #1a1a2e)',
              outline: 'none',
              boxSizing: 'border-box' as const,
              textAlign: 'center',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-secondary)')}
            onBlur={(e) => (e.target.style.borderColor = 'transparent')}
          />
        </div>

        <motion.button
          whileTap={numAmount > 0 ? { scale: 0.97 } : {}}
          onClick={handleConvert}
          disabled={numAmount <= 0}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '13px',
            borderRadius: 14,
            border: 'none',
            background: numAmount > 0 ? 'linear-gradient(135deg, var(--color-secondary-dark), var(--color-secondary))' : 'var(--color-bg, #eee)',
            color: numAmount > 0 ? '#fff' : 'var(--color-text-light, #bbb)',
            fontWeight: 700,
            fontSize: 14,
            cursor: numAmount > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            opacity: numAmount > 0 ? 1 : 0.5,
            pointerEvents: numAmount > 0 ? 'auto' : 'none',
            fontFamily: 'inherit',
          }}
        >
          <span>See in real things</span>
          <ArrowRight size={16} />
        </motion.button>

        <AnimatePresence>
          {showResults && conversions.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{ visible: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
              style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-light, #aaa)',
                  margin: '0 0 4px 4px',
                }}
              >
                That ₱{numAmount.toLocaleString()} could&apos;ve been...
              </p>
              {conversions.map((item) => (
                <ConvertCard
                  key={item.id}
                  icon={item.icon}
                  count={item.count}
                  itemName={item.name}
                  unitPrice={item.price}
                  colorClass={item.color}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default WeeklyStreak;
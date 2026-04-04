import { motion } from 'framer-motion';
import { MOOD_MAP } from '../../constants';
import type { DiaryEntry } from '../../types';

// ─── NotesList ────────────────────────────────────────────────────────────────

const NotesList = ({ diaryEntries, streak }: {
  diaryEntries: Record<string, DiaryEntry>;
  streak: number;
}) => {
  const entries = Object.entries(diaryEntries)
    .sort(([a], [b]) => b.localeCompare(a));

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--color-text-muted)' }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>📓</p>
        <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>No entries yet</p>
        <p style={{ fontSize: 13, margin: 0 }}>Complete your daily check-in to start your diary.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 24px 24px' }}>
      {entries.map(([dateStr, entry], idx) => {
        const mood = MOOD_MAP[entry.mood];
        const dateLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
          weekday: 'short', month: 'short', day: 'numeric',
        });
        const dayNum = streak - (Object.keys(diaryEntries).sort((a, b) => b.localeCompare(a)).indexOf(dateStr));
        return (
          <motion.div
            key={dateStr}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.25 }}
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: '16px',
              marginBottom: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: 'var(--color-text-light)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Day {dayNum} · {dateLabel}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>
                  {mood?.label ?? entry.mood} check-in
                </p>
              </div>
              <span style={{ fontSize: 28 }}>{mood?.emoji ?? '❓'}</span>
            </div>
            {entry.note ? (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{entry.note}"
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-light)' }}>No note written.</p>
            )}
            <p style={{ margin: '10px 0 0', fontSize: 11, color: 'var(--color-text-light)' }}>
              {new Date(entry.timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default NotesList;

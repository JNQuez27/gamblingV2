import React from 'react';
import { styles } from '@/app/diary/components/legacy/styles';

const moodEmojis = ['😔', '😕', '😐', '🙂', '😊'];
const moodLabels = ['Struggling', 'Low', 'Neutral', 'Good', 'Great'];

interface ComposeEntryProps {
  entryText: string;
  setEntryText: (text: string) => void;
  selectedMood: number | null;
  setSelectedMood: (mood: number | null) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ComposeEntry: React.FC<ComposeEntryProps> = ({
  entryText,
  setEntryText,
  selectedMood,
  setSelectedMood,
  onSave,
  onCancel,
}) => (
  <div style={styles.composeContainer}>
    <h3 style={styles.h3}>How are you feeling?</h3>
    <div style={styles.moodSelectorContainer}>
      {moodEmojis.map((emoji, i) => (
        <button
          key={i}
          onClick={() => setSelectedMood(i)}
          style={{
            ...styles.moodButton,
            border: selectedMood === i ? '2px solid var(--color-primary)' : '2px solid transparent',
            background: selectedMood === i ? 'var(--color-primary-light)' : 'var(--color-bg)',
          }}
        >
          <span style={styles.moodEmoji}>{emoji}</span>
          <span style={styles.moodLabel}>{moodLabels[i]}</span>
        </button>
      ))}
    </div>
    <textarea
      value={entryText}
      onChange={(e) => setEntryText(e.target.value)}
      placeholder="What's on your mind? Write freely, without judgment..."
      rows={5}
      style={styles.textarea}
    />
    <div style={styles.composeActions}>
      <button onClick={onCancel} style={styles.cancelButton}>
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={!entryText.trim()}
        style={{
          ...styles.saveButton,
          background: entryText.trim()
            ? 'linear-gradient(135deg, var(--color-secondary-dark), var(--color-secondary))'
            : 'var(--color-border)',
          color: entryText.trim() ? 'white' : 'var(--color-text-light)',
          cursor: entryText.trim() ? 'pointer' : 'not-allowed',
          boxShadow: entryText.trim() ? '0 4px 12px rgba(79,154,116,0.3)' : 'none',
        }}
      >
        Save Entry
      </button>
    </div>
  </div>
);

export default ComposeEntry;

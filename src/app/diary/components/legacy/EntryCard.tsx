import React from 'react';
import { styles } from '@/app/diary/components/legacy/styles';

const moodEmojis = ['😔', '😕', '😐', '🙂', '😊'];

export interface Entry {
  id: number;
  date: string;
  mood: number;
  title: string;
  preview: string;
  tags: string[];
}

interface EntryCardProps {
  entry: Entry;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry }) => (
  <div style={styles.entryCard}>
    <div style={styles.entryHeader}>
      <div>
        <p style={styles.entryDate}>{entry.date}</p>
        <p style={styles.entryTitle}>{entry.title}</p>
      </div>
      <span style={styles.entryMood}>{moodEmojis[entry.mood]}</span>
    </div>
    <p style={styles.entryPreview}>{entry.preview}</p>
    <div style={styles.tagsContainer}>
      {entry.tags.map((tag) => (
        <span key={tag} style={styles.tag}>
          #{tag}
        </span>
      ))}
    </div>
  </div>
);

export default EntryCard;

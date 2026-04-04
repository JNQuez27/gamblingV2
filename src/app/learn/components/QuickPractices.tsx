import React from 'react';
import { styles } from '../styles';

const practices = [
  { icon: "🌬️", label: "Box Breathing", duration: "3 min", desc: "Calm your nervous system" },
  { icon: "🧠", label: "Thought Journal", duration: "5 min", desc: "Examine one belief" },
  { icon: "🚶", label: "Mindful Walk", duration: "10 min", desc: "Grounded movement" },
];

const QuickPractices = () => (
  <div>
    <h3 style={styles.h3}>Quick Practices</h3>
    <div style={styles.quickPracticesContainer}>
      {practices.map((p) => (
        <button key={p.label} style={styles.practiceButton}>
          <span style={styles.practiceIcon}>{p.icon}</span>
          <span style={styles.practiceLabel}>{p.label}</span>
          <span style={styles.practiceDuration}>{p.duration}</span>
          <span style={styles.practiceDesc}>{p.desc}</span>
        </button>
      ))}
    </div>
  </div>
);

export default QuickPractices;

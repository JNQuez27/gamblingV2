import React from 'react';
import { styles } from '../styles';

const insights = [
  { icon: '😤', label: 'Anger pattern', desc: 'Identified on Tuesday • 3 triggers', color: '#fee2e2', border: '#fca5a5' },
  { icon: '🧘', label: 'Mindful moment', desc: 'Logged on Monday • 4 min pause', color: '#f0fdf4', border: '#86efac' },
];

const RecentInsights = () => (
  <div>
    <h3 style={styles.h3}>Recent Insights</h3>
    {insights.map((insight) => (
      <div
        key={insight.label}
        style={{
          ...styles.insightCard,
          background: insight.color,
          border: `1px solid ${insight.border}`,
        }}
      >
        <span style={styles.insightIcon}>{insight.icon}</span>
        <div>
          <p style={styles.insightTitle}>{insight.label}</p>
          <p style={styles.insightDesc}>{insight.desc}</p>
        </div>
      </div>
    ))}
  </div>
);

export default RecentInsights;

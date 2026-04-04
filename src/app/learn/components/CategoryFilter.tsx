import React from 'react';
import { styles } from '../styles';

const categories = ["All", "Anger", "Anxiety", "Habits", "Mindfulness"];

const CategoryFilter = () => (
  <div style={styles.categoryFilter}>
    {categories.map((cat, i) => (
      <button
        key={cat}
        style={{
          ...styles.categoryButton,
          padding: '7px 16px',
          borderRadius: '20px',
          border: i === 0 ? 'none' : '1.5px solid var(--color-border)',
          background: i === 0 ? 'var(--color-primary)' : 'var(--color-bg-card)',
          color: i === 0 ? 'white' : 'var(--color-text-muted)',
          fontSize: '13px',
          fontWeight: i === 0 ? 600 : 400,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          boxShadow: i === 0 ? '0 2px 8px rgba(91,155,213,0.3)' : 'none',
        }}
      >
        {cat}
      </button>
    ))}
  </div>
);

export default CategoryFilter;

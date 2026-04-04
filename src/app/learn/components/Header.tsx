import React from 'react';
import { styles } from '../styles';

const Header = () => (
  <div style={styles.header}>
    <h1 style={styles.headerTitle}>Learn & Grow</h1>
    <p style={styles.headerSubtitle}>Gentle guidance at your own pace</p>
    <div style={styles.searchBar}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-text-light)"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span style={styles.searchText}>Search articles...</span>
    </div>
  </div>
);

export default Header;

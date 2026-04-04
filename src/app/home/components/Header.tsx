import React from 'react';
import Link from 'next/link';
import { styles } from '../styles';

const Header = () => (
  <div style={styles.header}>
    <div style={styles.headerContent}>
      <div>
        <h1 style={styles.headerTitle}>Hello, Juan 👋</h1>
        <p style={styles.headerSubtitle}>Ready to reflect today?</p>
      </div>
      <div style={styles.headerActions}>
        <button style={styles.notificationButton}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <Link href="/profile">
          <div style={styles.avatar}>J</div>
        </Link>
      </div>
    </div>
  </div>
);

export default Header;

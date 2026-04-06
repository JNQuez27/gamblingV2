import React from 'react';
import Link from 'next/link';
import { styles } from '../styles';
import NotificationBell from './NotificationBell';

const Header = () => (
  <div style={styles.header}>
    <div style={styles.headerContent}>
      <div>
        <h1 style={styles.headerTitle}>Hello, Juan 👋</h1>
        <p style={styles.headerSubtitle}>Ready to reflect today?</p>
      </div>
      <div style={styles.headerActions}>
        <NotificationBell />
        <Link href="/profile">
          <div style={styles.avatar}>J</div>
        </Link>
      </div>
    </div>
  </div>
);

export default Header;

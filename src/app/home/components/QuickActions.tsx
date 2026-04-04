import React from 'react';
import Link from 'next/link';
import { styles } from '../styles';

const quickActions = [
  { icon: '✍️', label: 'Write in diary', href: '/diary' },
  { icon: '📚', label: 'Learn something', href: '/learn' },
  { icon: '🔔', label: 'Set reminder', href: '/settings' },
];

const QuickActions = () => (
  <div>
    <h3 style={styles.h3}>Quick Actions</h3>
    <div style={styles.quickActionsContainer}>
      {quickActions.map((action) => (
        <Link key={action.href} href={action.href} style={styles.quickActionLink}>
          <div style={styles.quickActionCard}>
            <span style={styles.quickActionIcon}>{action.icon}</span>
            <span style={styles.quickActionLabel}>{action.label}</span>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default QuickActions;

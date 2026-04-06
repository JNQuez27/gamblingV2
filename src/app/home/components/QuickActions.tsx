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
    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
      {quickActions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          style={{ flex: 1, textDecoration: 'none', display: 'flex' }}
        >
          <div
            style={{
              ...styles.quickActionCard,
              flex: 1,
              height: 88,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '0 8px',
              boxSizing: 'border-box',
            }}
          >
            <span style={styles.quickActionIcon}>{action.icon}</span>
            <span style={{ ...styles.quickActionLabel, textAlign: 'center', lineHeight: 1.3 }}>
              {action.label}
            </span>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default QuickActions;
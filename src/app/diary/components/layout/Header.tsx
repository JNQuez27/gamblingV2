import React from 'react';
import { BookOpen, Map } from 'lucide-react';
import { styles } from '../../styles';

interface HeaderProps {
  onNewEntry: () => void;
  view: 'map' | 'notes';
  onViewChange: (view: 'map' | 'notes') => void;
}

const Header: React.FC<HeaderProps> = ({ onNewEntry, view, onViewChange }) => (
  <div style={{ position: 'sticky', top: 0, zIndex: 20 }}>
    <div style={styles.header}>
      <div style={styles.headerContent}>
        <div>
          <h1 style={styles.headerTitle}>My Diary</h1>
          <p style={styles.headerSubtitle}>Your private reflection space</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={onNewEntry} style={styles.newEntryButton}>
            <span style={{ fontSize: '16px' }}>+</span> New Entry
          </button>
        </div>
      </div>
    </div>

    <div
      style={{
        display: 'flex',
        gap: 6,
        margin: '12px 24px 0',
      }}
    >
      {([
        { key: 'map', label: 'Journey Map', icon: <Map size={11} /> },
        { key: 'notes', label: 'Diary Notes', icon: <BookOpen size={11} /> },
      ] as const).map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => onViewChange(key)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '7px 0',
            borderRadius: 10,
            border: '1px solid transparent',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: view === key ? 'white' : 'transparent',
            color: view === key ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
            boxShadow: view === key ? '0 4px 10px rgba(0,0,0,0.08)' : 'none',
            fontFamily: 'inherit',
          }}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  </div>
);

export default Header;

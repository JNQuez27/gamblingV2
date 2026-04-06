'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: 'streak' | 'checkin' | 'milestone' | 'tip' | 'reminder';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  accent: string;
  accentBg: string;
}

// ─── Static notification data ─────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'streak',
    title: 'Streak on fire! 🔥',
    message: "You've paused for 3 days straight. Your future self is proud of you.",
    time: 'Just now',
    read: false,
    icon: '🔥',
    accent: '#f97316',
    accentBg: '#fff7ed',
  },
  {
    id: '2',
    type: 'checkin',
    title: 'Daily check-in reminder',
    message: "Don't forget to log how you're feeling today. It only takes a minute.",
    time: '1h ago',
    read: false,
    icon: '🪞',
    accent: '#4f9a74',
    accentBg: '#f0fdf4',
  },
  {
    id: '3',
    type: 'milestone',
    title: 'Milestone unlocked!',
    message: "You've completed your first full week of pausing. That's real progress.",
    time: '2h ago',
    read: false,
    icon: '🏅',
    accent: '#eab308',
    accentBg: '#fefce8',
  },
  {
    id: '4',
    type: 'tip',
    title: 'Mindful moment',
    message: 'When the urge hits, try the 5-minute rule — wait 5 minutes before deciding.',
    time: 'Yesterday',
    read: true,
    icon: '🧘',
    accent: '#a855f7',
    accentBg: '#faf5ff',
  },
  {
    id: '5',
    type: 'reminder',
    title: 'Reality check',
    message: 'The money you saved this week could cover 3 full family meals.',
    time: 'Yesterday',
    read: true,
    icon: '💡',
    accent: '#0ea5e9',
    accentBg: '#f0f9ff',
  },
  {
    id: '6',
    type: 'checkin',
    title: 'How are you holding up?',
    message: "We noticed you haven't checked in yet today. You got this.",
    time: '2 days ago',
    read: true,
    icon: '💬',
    accent: '#4f9a74',
    accentBg: '#f0fdf4',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function dismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: 'relative',
          background: open ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)',
          border: 'none',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
        aria-label="Notifications"
      >
        {/* Bell wiggle on unread */}
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
          transition={{ duration: 0.5, delay: 0.4, repeat: Infinity, repeatDelay: 6 }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={open ? '#1f2937' : 'var(--color-text-muted)'}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </motion.div>

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                border: '1.5px solid white',
              }}
            />
          )}
        </AnimatePresence>
      </button>

      {/* ── Notification panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 5px)',
              left: '-580%',
              transform: 'translateX(-50%)',
              width: 'min(340px, calc(100vw - 32px))',
              maxWidth: 'calc(100vw - 32px)',
              background: '#ffffff',
              borderRadius: 20,
              boxShadow: '0 16px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.06)',
              overflow: 'hidden',
              zIndex: 100,
            }}
          >
            {/* Panel header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px 12px',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1f2937' }}>
                  Notifications
                </p>
                {unreadCount > 0 && (
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b7280' }}>
                    {unreadCount} unread
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#4f9a74',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: 8,
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div
              style={{
                maxHeight: 380,
                overflowY: 'auto',
                scrollbarWidth: 'none',
              }}
              className="hide-scrollbar"
            >
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: '36px 24px',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ fontSize: 28, margin: '0 0 8px' }}>🎉</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#374151' }}>
                    You&apos;re all caught up!
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>
                    No new notifications.
                  </p>
                </div>
              ) : (
                notifications.map((notif, idx) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16, height: 0, padding: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                    onClick={() => markRead(notif.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '13px 18px',
                      background: notif.read ? 'transparent' : `${notif.accentBg}`,
                      borderBottom: '1px solid rgba(0,0,0,0.04)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      position: 'relative',
                    }}
                  >
                    {/* Unread dot */}
                    {!notif.read && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 6,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: notif.accent,
                          flexShrink: 0,
                        }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: notif.accentBg,
                        border: `1.5px solid ${notif.accent}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      {notif.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: '0 0 2px',
                          fontSize: 13,
                          fontWeight: notif.read ? 500 : 700,
                          color: '#1f2937',
                          lineHeight: 1.3,
                        }}
                      >
                        {notif.title}
                      </p>
                      <p
                        style={{
                          margin: '0 0 4px',
                          fontSize: 12,
                          color: '#6b7280',
                          lineHeight: 1.45,
                        }}
                      >
                        {notif.message}
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>
                        {notif.time}
                      </p>
                    </div>

                    {/* Dismiss ✕ */}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#d1d5db',
                        fontSize: 14,
                        cursor: 'pointer',
                        padding: '2px 4px',
                        lineHeight: 1,
                        flexShrink: 0,
                        borderRadius: 6,
                      }}
                      aria-label="Dismiss"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Panel footer */}
            {notifications.length > 0 && (
              <div
                style={{
                  padding: '10px 18px',
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                  textAlign: 'center',
                }}
              >
                <button
                  onClick={() => setNotifications([])}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 11,
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
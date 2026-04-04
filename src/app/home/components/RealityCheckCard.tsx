'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Brain, Heart, FileText, Zap } from 'lucide-react';

const baseCardStyle = {
  borderRadius: 20,
  border: '1px solid',
  padding: '16px',
  position: 'relative' as const,
  overflow: 'hidden' as const,
};

const headerRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 12,
  padding: '0 4px',
};

const headerLabelStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase' as const,
  color: 'var(--color-warning, #d97706)',
};

const dotRowStyle = {
  display: 'flex',
  gap: 6,
};

const dotStyle = {
  height: 6,
  borderRadius: 999,
  transition: 'all 0.3s ease',
  background: 'rgba(0,0,0,0.15)',
};

const realityCheckMessages = [
  {
    label: "The math never lies",
    text: "The casino always wins in the end. Every game is designed that way. Your luck runs out. Their profit doesn't.",
    punchline: "The house always wins — not sometimes. Always.",
    icon: <AlertTriangle size={20} color="#ef4444" />,
    iconBg: '#fee2e2',
    border: '#fecaca',
    accent: ['#fef2f2', '#fee2e2'],
  },
  {
    label: "Near-miss is still a miss",
    text: "Almost winning is still losing. The machine is built to make you feel close on purpose — so you keep trying.",
    punchline: '"Almost" pays zero bills.',
    icon: <Zap size={20} color="#f97316" />,
    iconBg: '#ffedd5',
    border: '#fed7aa',
    accent: ['#fff7ed', '#ffedd5'],
  },
  {
    label: "Your brain is being played",
    text: "Gambling lights up the same part of your brain as drugs. That rush you feel? It's a trap — not a sign you're winning.",
    punchline: "You're not lucky. You're hooked.",
    icon: <Brain size={20} color="#a855f7" />,
    iconBg: '#f3e8ff',
    border: '#e9d5ff',
    accent: ['#faf5ff', '#f3e8ff'],
  },
  {
    label: "Chasing losses makes it worse",
    text: "Betting more to win back what you lost never works. It only makes the hole deeper. Walk away now.",
    punchline: "Stop digging. Just stop.",
    icon: <AlertTriangle size={20} color="#ef4444" />,
    iconBg: '#fee2e2',
    border: '#fecaca',
    accent: ['#fef2f2', '#fee2e2'],
  },
  {
    label: "Add it up honestly",
    text: "You remember the wins. Your brain hides the losses. Write down everything you've spent this month — then decide if it's worth it.",
    punchline: "The real number will surprise you.",
    icon: <FileText size={20} color="#f59e0b" />,
    iconBg: '#fef3c7',
    border: '#fde68a',
    accent: ['#fffbeb', '#fef3c7'],
  },
  {
    label: "Think of who depends on you",
    text: "Someone in your life needs you more than the casino needs your money. Every peso here is taken from them.",
    punchline: "Your family is a better bet.",
    icon: <Heart size={20} color="#f97316" />,
    iconBg: '#ffedd5',
    border: '#fed7aa',
    accent: ['#fff7ed', '#ffedd5'],
  },
];

export default function RealityCheckCard() {
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const currentMsg = realityCheckMessages[currentMsgIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMsgIndex((prev) =>
        prev === realityCheckMessages.length - 1 ? 0 : prev + 1,
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={headerRowStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ position: 'relative', width: 10, height: 10 }}>
            <motion.span
              animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.35)',
              }}
            />
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: '#f59e0b',
              }}
            />
          </div>
          <span style={headerLabelStyle}>Reality Check</span>
        </div>
        <div style={dotRowStyle}>
          {realityCheckMessages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentMsgIndex(i)}
              style={{
                ...dotStyle,
                width: i === currentMsgIndex ? 18 : 6,
                background: i === currentMsgIndex ? '#f59e0b' : 'rgba(0,0,0,0.18)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
              aria-label={`Show message ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMsgIndex}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            ...baseCardStyle,
            borderColor: currentMsg.border,
            background: `linear-gradient(135deg, ${currentMsg.accent[0]}, ${currentMsg.accent[1]})`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: currentMsg.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {currentMsg.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: 'block',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted, #6b7280)',
                marginBottom: 4,
              }}>
                {currentMsg.label}
              </span>
              <p style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--color-text, #1f2937)',
                margin: 0,
                lineHeight: 1.4,
              }}>
                {currentMsg.text}
              </p>
              {currentMsg.punchline && (
                <p style={{
                  fontSize: 12,
                  fontWeight: 600,
                  fontStyle: 'italic',
                  color: 'var(--color-text-muted, #6b7280)',
                  margin: '10px 0 0',
                  paddingTop: 8,
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                }}>
                  {currentMsg.punchline}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
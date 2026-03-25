'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Target, ShieldCheck } from 'lucide-react';

const DECEPTIVE_MESSAGES = [
  {
    label: 'Near-Miss Effect',
    text: "That was close! But a near-win is still a loss. Don't let it trick you into thinking a win is just around the corner.",
    icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
    iconBg: 'bg-red-100',
    border: 'border-red-200',
    accent: 'from-red-50 to-red-100',
  },
  {
    label: "Gambler's Fallacy",
    text: "Seeing a lot of red? That doesn't make black any more likely on the next spin. Each event is independent.",
    icon: <Target className="w-5 h-5 text-blue-500" />,
    iconBg: 'bg-blue-100',
    border: 'border-blue-200',
    accent: 'from-blue-50 to-blue-100',
  },
  {
    label: 'Illusion of Control',
    text: "Feeling lucky? Your superstitions don't influence the outcome. The odds are the same for everyone.",
    icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
    iconBg: 'bg-green-100',
    border: 'border-green-200',
    accent: 'from-green-50 to-green-100',
  },
];

export function RealityCheck() {
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const currentMsg = DECEPTIVE_MESSAGES[currentMsgIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMsgIndex((prevIndex) =>
        prevIndex === DECEPTIVE_MESSAGES.length - 1 ? 0 : prevIndex + 1,
      );
    }, 5000); // Change message every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
            Reality Check
          </span>
        </div>
        <div className="flex space-x-1">
          {DECEPTIVE_MESSAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentMsgIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === currentMsgIndex ? 'w-4 bg-amber-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMsgIndex}
          initial={{
            opacity: 0,
            y: 8,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -8,
            scale: 0.98,
          }}
          transition={{
            duration: 0.35,
            ease: 'easeOut',
          }}
          className={`relative overflow-hidden rounded-2xl border ${currentMsg.border} bg-gradient-to-br ${currentMsg.accent} p-4`}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${currentMsg.iconBg}`}
            >
              {currentMsg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted/70 block mb-1">
                {currentMsg.label}
              </span>
              <p className="text-sm font-semibold text-text-primary leading-snug">
                {currentMsg.text}
              </p>
            </div>
          </div>
          <div className="absolute top-3 right-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500/60"></span>
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

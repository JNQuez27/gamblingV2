'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PauseFrictionModalProps {
  isOpen: boolean;
  amount: number;
  time: number; // in minutes
  onConfirm: () => void;
  onCancel: () => void;
}

export function PauseFrictionModal({
  isOpen,
  amount,
  time,
  onConfirm,
  onCancel,
}: PauseFrictionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-end z-50"
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="w-full bg-background rounded-t-2xl p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Take a moment</h2>
              <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 bg-card p-4 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground">You're about to spend:</div>
              <div className="text-4xl font-bold text-primary">${amount.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">
                For {time} minutes of entertainment
              </div>
            </div>

            <div className="space-y-3 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Consider instead:</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li>• Take a 15 minute walk</li>
                <li>• Call a friend or family member</li>
                <li>• Practice breathing exercises</li>
                <li>• Journal about how you're feeling</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={onCancel} variant="outline" className="rounded-lg">
                I'll Wait
              </Button>
              <Button
                onClick={onConfirm}
                className="bg-destructive hover:bg-destructive/90 rounded-lg"
              >
                Continue Anyway
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface NearMissModalProps {
  isOpen: boolean;
  type: 'avoided' | 'learned';
  message: string;
  onClose: () => void;
}

export function NearMissModal({ isOpen, type, message, onClose }: NearMissModalProps) {
  const isAvoided = type === 'avoided';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-background rounded-2xl p-6 space-y-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-5xl"
              >
                {isAvoided ? '🎉' : '💡'}
              </motion.div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {isAvoided ? 'Great Choice!' : 'Learning Moment'}
              </h2>
              <p className="text-muted-foreground">{message}</p>
            </div>

            <div
              className={`p-4 rounded-lg border-2 ${isAvoided ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'}`}
            >
              <p
                className={`text-sm ${isAvoided ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'}`}
              >
                {isAvoided
                  ? "You recognized a risky moment and chose to pause. That's real strength."
                  : 'Every setback is data. Use this to understand your patterns better.'}
              </p>
            </div>

            <Button
              onClick={onClose}
              className={`w-full rounded-lg ${
                isAvoided ? 'bg-primary hover:bg-primary/90' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              Got it
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

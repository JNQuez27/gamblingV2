'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/context/app-context';
import { motion } from 'framer-motion';

const MOODS = [
  { value: 'terrible', emoji: '😢', label: 'Terrible', color: 'bg-red-100 hover:bg-red-200' },
  { value: 'bad', emoji: '😞', label: 'Bad', color: 'bg-orange-100 hover:bg-orange-200' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: 'bg-yellow-100 hover:bg-yellow-200' },
  { value: 'good', emoji: '😊', label: 'Good', color: 'bg-emerald-100 hover:bg-emerald-200' },
  { value: 'great', emoji: '🤩', label: 'Great', color: 'bg-green-100 hover:bg-green-200' },
];

interface MoodCheckInProps {
  onComplete?: () => void;
}

export function MoodCheckIn({ onComplete }: MoodCheckInProps) {
  const { addMood } = useAppContext();
  const [selectedMood, setSelectedMood] = useState<
    'great' | 'good' | 'okay' | 'bad' | 'terrible' | null
  >(null);
  const [urgeLevel, setUrgeLevel] = useState(5);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedMood) return;

    addMood({
      mood: selectedMood,
      urge: urgeLevel,
      timestamp: new Date(),
      notes: notes || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSelectedMood(null);
      setUrgeLevel(5);
      setNotes('');
      setSubmitted(false);
      onComplete?.();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">How are you feeling?</h1>
          <p className="text-muted-foreground">Your check-in helps us understand your patterns</p>
        </div>

        {/* Mood Selection */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            {MOODS.map((mood) => (
              <motion.button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value as any)}
                className={`p-4 rounded-xl flex items-center gap-4 transition-all border-2 ${
                  selectedMood === mood.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-4xl">{mood.emoji}</span>
                <div className="text-left flex-1">
                  <div className="font-semibold text-foreground">{mood.label}</div>
                </div>
                {selectedMood === mood.value && (
                  <motion.div
                    layoutId="check"
                    className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Urge Level */}
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 p-4 bg-card rounded-xl border border-border"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-4">
                Urge to gamble: <span className="text-primary font-bold">{urgeLevel}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={urgeLevel}
                onChange={(e) => setUrgeLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>No urge</span>
                <span>Strong urge</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Any notes? (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What triggered this mood? What helped?"
                className="rounded-lg resize-none"
                rows={3}
              />
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        {selectedMood && (
          <Button
            onClick={handleSubmit}
            disabled={submitted}
            className="w-full bg-primary hover:bg-primary/90 rounded-lg py-3 font-medium"
          >
            {submitted ? 'Check-in saved!' : 'Save Check-in'}
          </Button>
        )}
      </motion.div>
    </div>
  );
}

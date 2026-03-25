'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMentalHealth } from '@/context/mental-health-context';
import { X, Check } from 'lucide-react';

const EMOTIONS = [
  { id: 'calm', label: 'Calm', emoji: '😌', color: 'from-blue-400 to-blue-600' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', color: 'from-yellow-400 to-orange-500' },
  { id: 'stressed', label: 'Stressed', emoji: '😣', color: 'from-orange-400 to-red-500' },
  { id: 'sad', label: 'Sad', emoji: '😢', color: 'from-slate-400 to-slate-600' },
  { id: 'irritable', label: 'Irritable', emoji: '😤', color: 'from-red-400 to-pink-600' },
  { id: 'happy', label: 'Happy', emoji: '😊', color: 'from-yellow-300 to-yellow-500' },
  { id: 'content', label: 'Content', emoji: '😌', color: 'from-green-400 to-emerald-600' },
] as const;

export function EmotionTracker({ onComplete }: { onComplete?: () => void }) {
  const { addEmotion } = useMentalHealth();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [urgeLevel, setUrgeLevel] = useState(3);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [triggerInput, setTriggerInput] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1);

  const handleAddTrigger = () => {
    if (triggerInput.trim()) {
      setTriggers([...triggers, triggerInput.trim()]);
      setTriggerInput('');
    }
  };

  const handleSubmit = () => {
    if (!selectedEmotion) return;

    addEmotion({
      id: Date.now().toString(),
      date: new Date(),
      emotion: selectedEmotion as any,
      intensity,
      gamblingUrge: urgeLevel,
      triggers: triggers.length > 0 ? triggers : undefined,
      notes: notes || undefined,
    });

    onComplete?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-blue-50/30 to-background pb-32">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">How are you feeling?</h1>
          <p className="text-muted-foreground">
            Take a moment to check in with yourself. This helps us understand your patterns.
          </p>
        </motion.section>

        {/* Step 1: Emotion Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <Card className="p-6 border-2 border-primary/20">
              <h2 className="text-lg font-semibold mb-6 text-foreground">
                Select your primary emotion
              </h2>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3.5 md:grid-cols-4">
                {EMOTIONS.map((emotion) => (
                  <motion.button
                    key={emotion.id}
                    onClick={() => setSelectedEmotion(emotion.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      selectedEmotion === emotion.id
                        ? 'border-primary bg-primary/10 scale-105'
                        : 'border-border hover:border-primary/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-3xl mb-2">{emotion.emoji}</div>
                    <div className="text-xs font-medium">{emotion.label}</div>
                  </motion.button>
                ))}
              </div>
            </Card>

            <Button
              onClick={() => setStep(2)}
              disabled={!selectedEmotion}
              className="w-full py-6 text-base"
              size="lg"
            >
              Continue
            </Button>
          </motion.div>
        )}

        {/* Step 2: Intensity & Urge */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <Card className="p-6 border-2 border-primary/20">
              <h2 className="text-lg font-semibold mb-6 text-foreground">Rate the intensity</h2>

              <div className="space-y-6">
                {/* Emotion Intensity */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-foreground">
                      How intense is this emotion?
                    </label>
                    <span className="text-lg font-bold text-primary">{intensity}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Gambling Urge */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-foreground">
                      Gambling urge strength
                    </label>
                    <span className="text-lg font-bold text-primary">{urgeLevel}/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={urgeLevel}
                    onChange={(e) => setUrgeLevel(Number(e.target.value))}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 py-6"
                size="lg"
              >
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1 py-6" size="lg">
                Next
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Triggers & Notes */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <Card className="p-6 border-2 border-primary/20">
              <h2 className="text-lg font-semibold mb-6 text-foreground">
                What triggered this feeling?
              </h2>

              <div className="space-y-4">
                {/* Trigger Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a trigger (e.g., work stress, boredom)"
                    value={triggerInput}
                    onChange={(e) => setTriggerInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTrigger();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleAddTrigger} variant="outline" size="sm">
                    Add
                  </Button>
                </div>

                {/* Trigger Tags */}
                {triggers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {triggers.map((trigger, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-primary/10 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                      >
                        {trigger}
                        <button
                          onClick={() => setTriggers(triggers.filter((_, i) => i !== idx))}
                          className="text-primary hover:text-primary/70"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-6 border-2 border-primary/20">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Any additional notes?</h2>
              <Textarea
                placeholder="What's on your mind? What helped or didn't help?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1 py-6"
                size="lg"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 py-6 bg-primary text-primary-foreground"
                size="lg"
              >
                <Check size={20} className="mr-2" />
                Save Check-In
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

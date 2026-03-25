'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMentalHealth } from '@/context/mental-health-context';
import { Clock, Play, Star, CheckCircle } from 'lucide-react';

const CATEGORY_EMOJI = {
  anxiety: '🌊',
  sleep: '😴',
  stress: '☀️',
  focus: '🎯',
  'body-scan': '🫀',
  'loving-kindness': '💚',
};

const CATEGORY_COLORS = {
  anxiety: 'from-blue-400 to-blue-600',
  sleep: 'from-indigo-400 to-purple-600',
  stress: 'from-orange-400 to-red-500',
  focus: 'from-green-400 to-emerald-600',
  'body-scan': 'from-pink-400 to-rose-600',
  'loving-kindness': 'from-red-400 to-rose-500',
};

interface MeditationSession {
  id: string;
  title: string;
  category: string;
  duration: number;
}

export function MeditationLibrary() {
  const { meditations, meditationLogs, addMeditationLog, getMeditationStats } = useMentalHealth();
  const [selectedMeditation, setSelectedMeditation] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const stats = {
    totalSessions: meditationLogs.length,
    totalMinutes: meditationLogs.reduce(
      (acc: number, log: { completed: boolean }) => acc + (log.completed ? 1 : 0),
      0,
    ),
    avgRating: 4.5,
  };
  const categories = [...new Set(meditations.map((m: MeditationSession) => m.category))];
  const filteredMeditations = activeCategory
    ? meditations.filter((m: MeditationSession) => m.category === activeCategory)
    : meditations;

  const completedIds = new Set(
    meditationLogs
      .filter((l: { completed: boolean }) => l.completed)
      .map((l: { sessionId: string }) => l.sessionId),
  );

  if (selectedMeditation) {
    const meditation = meditations.find((m) => m.id === selectedMeditation);
    if (!meditation) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-background rounded-2xl p-8 max-w-md w-full"
        >
          <Button
            onClick={() => setSelectedMeditation(null)}
            variant="outline"
            size="sm"
            className="mb-4"
          >
            Back
          </Button>

          <div
            className={`w-full h-40 bg-gradient-to-r ${CATEGORY_COLORS[meditation.category as keyof typeof CATEGORY_COLORS]} rounded-xl mb-6 flex items-center justify-center`}
          >
            <span className="text-5xl">
              {CATEGORY_EMOJI[meditation.category as keyof typeof CATEGORY_EMOJI]}
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-2">{meditation.title}</h2>
          <p className="text-muted-foreground mb-6 flex items-center gap-2">
            <Clock size={16} />
            {meditation.duration} minutes
          </p>

          <p className="text-sm text-muted-foreground mb-6 capitalize">
            Category:{' '}
            <span className="text-foreground font-medium">
              {meditation.category.replace('-', ' ')}
            </span>
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => {
                addMeditationLog({
                  id: Date.now().toString(),
                  sessionId: meditation.id,
                  date: new Date(),
                  completed: true,
                  duration: meditation.duration,
                  mood: 'after',
                  rating: 4,
                });
                setSelectedMeditation(null);
              }}
              className="w-full py-6 bg-primary"
              size="lg"
            >
              <Play size={20} className="mr-2" />
              Start Meditation
            </Button>
            <Button
              onClick={() => setSelectedMeditation(null)}
              variant="outline"
              className="w-full py-6"
              size="lg"
            >
              Maybe Later
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.totalSessions}</div>
          <div className="text-xs text-muted-foreground">Sessions</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.totalMinutes}</div>
          <div className="text-xs text-muted-foreground">Minutes</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.avgRating.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">Avg Rating</div>
        </Card>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Browse by category</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setActiveCategory(null)}
            variant={activeCategory === null ? 'default' : 'outline'}
            size="sm"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setActiveCategory(category)}
              variant={activeCategory === category ? 'default' : 'outline'}
              size="sm"
              className="capitalize"
            >
              {CATEGORY_EMOJI[category as keyof typeof CATEGORY_EMOJI]} {category.replace('-', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Meditations */}
      <div className="grid gap-4">
        {filteredMeditations.map((meditation, idx) => (
          <motion.div
            key={meditation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              onClick={() => setSelectedMeditation(meditation.id)}
              className="p-5 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${CATEGORY_COLORS[meditation.category as keyof typeof CATEGORY_COLORS]} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-lg">
                    {CATEGORY_EMOJI[meditation.category as keyof typeof CATEGORY_EMOJI]}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{meditation.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock size={14} />
                    {meditation.duration} minutes
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {completedIds.has(meditation.id) && (
                    <CheckCircle size={20} className="text-green-600" />
                  )}
                  <Play
                    size={20}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

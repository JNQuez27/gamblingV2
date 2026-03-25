'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMentalHealth, CopingStrategy } from '@/context/mental-health-context';
import { Clock, Star, ChevronRight, Play } from 'lucide-react';

const CATEGORY_ICONS = {
  breathing: '🌬️',
  mindfulness: '🧘',
  physical: '💪',
  cognitive: '🧠',
  social: '👥',
  creative: '🎨',
};

export function CopingStrategies() {
  const { strategies, strategyLogs, addStrategyLog, getMostEffectiveStrategies } =
    useMentalHealth();
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'effective'>('all');
  const [completingId, setCompletingId] = useState<string | null>(null);

  const effectiveStrategies = getMostEffectiveStrategies();
  const displayedStrategies = activeTab === 'effective' ? effectiveStrategies : strategies;

  const handleStartStrategy = (strategyId: string) => {
    setSelectedStrategy(strategyId);
  };

  const handleCompleteStrategy = (strategyId: string, effectiveness: number) => {
    setCompletingId(strategyId);
    addStrategyLog({
      id: Date.now().toString(),
      strategyId,
      date: new Date(),
      effectiveness,
      notes: '',
    });

    setTimeout(() => {
      setSelectedStrategy(null);
      setCompletingId(null);
    }, 1500);
  };

  if (selectedStrategy) {
    const strategy = strategies.find((s) => s.id === selectedStrategy);
    if (!strategy) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-end z-50"
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          className="w-full bg-background rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <Button
                onClick={() => setSelectedStrategy(null)}
                variant="outline"
                className="mb-4"
                size="sm"
              >
                Back
              </Button>
              <h2 className="text-2xl font-bold mb-2">{strategy.name}</h2>
              <p className="text-muted-foreground">{strategy.description}</p>
            </div>

            {/* Duration & Category */}
            <div className="flex gap-4 mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-2 text-sm">
                <Clock size={18} className="text-primary" />
                <span>{strategy.duration} minutes</span>
              </div>
              <div className="text-sm">
                <span className="text-primary font-medium">
                  {CATEGORY_ICONS[strategy.category as keyof typeof CATEGORY_ICONS]}
                </span>
                <span className="ml-2 capitalize">{strategy.category}</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <h3 className="font-semibold text-foreground mb-4">How to practice:</h3>
              <ol className="space-y-3">
                {strategy.instructions.map((instruction, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-4 text-sm text-muted-foreground"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span>{instruction}</span>
                  </motion.li>
                ))}
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setSelectedStrategy(null);
                }}
                variant="outline"
                className="w-full py-6"
              >
                <Play size={20} className="mr-2" />
                Start Timer ({strategy.duration} min)
              </Button>

              <div className="grid grid-cols-3 gap-2">
                {[5, 7, 10].map((rating) => (
                  <Button
                    key={rating}
                    onClick={() => handleCompleteStrategy(selectedStrategy, rating)}
                    disabled={completingId === selectedStrategy}
                    variant={completingId === selectedStrategy ? 'default' : 'outline'}
                    className="py-6"
                  >
                    {completingId === selectedStrategy ? '✓ Logged!' : `${rating}/10`}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          onClick={() => setActiveTab('all')}
          variant={activeTab === 'all' ? 'default' : 'outline'}
          size="sm"
        >
          All Strategies ({strategies.length})
        </Button>
        <Button
          onClick={() => setActiveTab('effective')}
          variant={activeTab === 'effective' ? 'default' : 'outline'}
          size="sm"
        >
          Most Effective
        </Button>
      </div>

      {/* Strategies Grid */}
      <div className="grid gap-4">
        <AnimatePresence>
          {displayedStrategies.map((strategy, idx) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                onClick={() => handleStartStrategy(strategy.id)}
                className="p-5 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {CATEGORY_ICONS[strategy.category as keyof typeof CATEGORY_ICONS]}
                      </span>
                      <h3 className="font-semibold text-foreground">{strategy.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-primary" />
                        {strategy.duration} min
                      </span>
                      {strategy.helpful && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Star size={14} fill="currentColor" />
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

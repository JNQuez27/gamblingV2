'use client';

import { useAppContext } from '@/context/app-context';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SpendingTimeline() {
  const { spending, removeSpending, moods } = useAppContext();

  const sortedSpending = [...spending].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );
  const totalSpending = spending.reduce((sum, s) => sum + s.amount, 0);
  const averageSpending = spending.length > 0 ? (totalSpending / spending.length).toFixed(2) : '0';

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMoodForDate = (date: Date) => {
    return moods.find((m) => m.timestamp.toDateString() === date.toDateString());
  };

  const groupedByDate = sortedSpending.reduce(
    (acc, record) => {
      const dateKey = record.timestamp.toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(record);
      return acc;
    },
    {} as Record<string, typeof spending>,
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background px-6 py-4 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Spending Diary</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your purchases and patterns</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-card rounded-xl border border-border text-center"
          >
            <div className="text-2xl font-bold text-primary">${totalSpending.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">Total</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-card rounded-xl border border-border text-center"
          >
            <div className="text-2xl font-bold text-primary">{spending.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Purchases</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-card rounded-xl border border-border text-center"
          >
            <div className="text-2xl font-bold text-primary">${averageSpending}</div>
            <div className="text-xs text-muted-foreground mt-1">Average</div>
          </motion.div>
        </div>

        {/* Timeline */}
        {sortedSpending.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No purchases recorded yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([dateKey, records], idx) => {
              const date = records[0].timestamp;
              const mood = getMoodForDate(date);
              const dayTotal = records.reduce((sum, r) => sum + r.amount, 0);

              return (
                <motion.div
                  key={dateKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-3"
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-foreground">{formatDate(date)}</div>
                      {mood && (
                        <span className="text-lg">
                          {mood.mood === 'great'
                            ? '🤩'
                            : mood.mood === 'good'
                              ? '😊'
                              : mood.mood === 'okay'
                                ? '😐'
                                : mood.mood === 'bad'
                                  ? '😞'
                                  : '😢'}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-primary">${dayTotal.toFixed(2)}</div>
                  </div>

                  {/* Records */}
                  <div className="space-y-2">
                    {records.map((record) => (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 bg-card rounded-lg border border-border flex items-center justify-between group hover:border-primary/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{record.commodity}</div>
                          {record.notes && (
                            <div className="text-xs text-muted-foreground mt-1">{record.notes}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-semibold text-primary">
                            ${record.amount.toFixed(2)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSpending(record.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

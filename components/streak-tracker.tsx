'use client';

import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { motion } from 'framer-motion';

export function StreakTracker() {
  const { milestones, user } = useAppContext();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Streak Milestones</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-4">
            <div className="text-6xl font-bold text-primary">{user.currentStreak}</div>
            <div className="text-lg">Days</div>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-2">
            Longest Streak: {user.longestStreak} days
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={milestone.unlocked ? 'border-green-500' : ''}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-3">
                  <Award
                    className={milestone.unlocked ? 'text-green-500' : 'text-muted-foreground'}
                  />
                  {milestone.title}
                </CardTitle>
                {milestone.unlocked && <div className="text-xs text-green-500">Unlocked</div>}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{milestone.description}</p>
                {milestone.unlocked && milestone.date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Achieved on: {new Date(milestone.date).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

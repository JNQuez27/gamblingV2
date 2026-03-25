'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BottomNav } from './bottom-nav';
import { Button } from '@/components/ui/button';
import { RealityCheck } from './reality-check';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ConvertCard } from './convert-card';

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const conversionItems = [
  { id: 1, name: 'Cup of Coffee', price: 150, icon: '☕️', color: 'border-yellow-500' },
  { id: 2, name: 'Movie Ticket', price: 350, icon: '🎟️', color: 'border-red-500' },
  { id: 3, name: 'Book', price: 500, icon: '📚', color: 'border-blue-500' },
  { id: 4, name: 'Pair of Sneakers', price: 3000, icon: '👟', color: 'border-green-500' },
  { id: 5, name: 'Smartphone', price: 25000, icon: '📱', color: 'border-purple-500' },
];

interface HomeDashboardProps {
  userName?: string;
  onTabChange?: (tab: 'home' | 'diary' | 'learn' | 'profile') => void;
}

export function HomeDashboard({ userName = 'Juan', onTabChange }: HomeDashboardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'diary' | 'learn' | 'profile'>('home');

  const handleTabChange = (tab: 'home' | 'diary' | 'learn' | 'profile') => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  const [streakDays, setStreakDays] = useState(0);
  const [completedDays, setCompletedDays] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [markedToday, setMarkedToday] = useState(false);
  const [amount, setAmount] = useState('');
  const [numAmount, setNumAmount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [conversions, setConversions] = useState<any[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    setNumAmount(Number(value));
    if (showResults) {
      setShowResults(false);
    }
  };

  const handleConvert = () => {
    if (numAmount > 0) {
      const newConversions = conversionItems
        .map((item) => ({
          ...item,
          count: Math.floor(numAmount / item.price),
        }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count);
      setConversions(newConversions);
      setShowResults(true);
    }
  };

  // Get current day of week (0 = Monday in our array)
  const today = new Date();
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  const handleMarkStreak = () => {
    if (!markedToday) {
      setMarkedToday(true);
      setStreakDays((prev) => prev + 1);
      setCompletedDays((prev) => {
        const newDays = [...prev];
        newDays[currentDayIndex] = true;
        return newDays;
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Hello, {userName} <span className="inline-block">👋</span>
            </h1>
            <p className="mt-1 text-muted-foreground">Ready to reflect today?</p>
          </div>
          <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            Demo
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5">
        <RealityCheck />
        {/* Streak Tracker Section */}
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Your Progress
          </h2>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{streakDays} Day Streak</p>
                <p className="text-sm text-muted-foreground">Keep it up!</p>
              </div>
              <Button onClick={handleMarkStreak} disabled={markedToday}>
                {markedToday ? 'Completed Today' : 'Mark Today'}
              </Button>
            </div>
            <div className="mt-4 flex justify-between">
              {weekDays.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <div
                    className={`mt-2 h-8 w-8 rounded-full flex items-center justify-center ${
                      completedDays[index] ? 'bg-green-500' : 'bg-gray-200'
                    } ${index === currentDayIndex ? 'ring-2 ring-primary' : ''}`}
                  >
                    {completedDays[index] && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-white"
                      >
                        ✓
                      </motion.div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hero Converter */}
        <div className="bg-white rounded-3xl p-6 shadow-soft mb-8 border border-gray-50">
          <h2 className="text-lg font-semibold text-text-primary mb-4 text-center">
            What's the bet worth?
          </h2>
          <div className="relative mb-6">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-bold text-text-muted">
              ₱
            </span>
            <input
              type="number"
              value={amount}
              onChange={handleInputChange}
              placeholder="0"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-6 pl-14 pr-6 text-4xl font-bold text-text-primary focus:outline-none focus:border-primary focus:bg-white transition-colors text-center"
            />
          </div>
          <button
            onClick={handleConvert}
            disabled={numAmount <= 0}
            className={`w-full flex items-center justify-center space-x-2 font-semibold py-4 rounded-xl transition-all ${numAmount > 0 ? 'bg-primary text-white shadow-lg shadow-primary/30 active:scale-[0.98]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            <span>See in real things</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {showResults && conversions.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="space-y-4 mb-8"
            >
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider px-2">
                That equals to...
              </h3>
              {conversions.map((item) => (
                <ConvertCard
                  key={item.id}
                  icon={item.icon}
                  count={item.count}
                  itemName={item.name}
                  unitPrice={item.price}
                  colorClass={item.color}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Bus,
  Utensils,
  BookOpen,
  Coffee,
  Smartphone,
  Ticket,
  Flame,
  Check,
  X,
  ChevronDown,
  Pencil,
} from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { Button } from './ui/button';
import { ConvertCard } from './convert-card';
import { RealityCheck } from './reality-check';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_FULL_LABELS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const MOOD_MAP: Record<
  string,
  {
    emoji: string;
    label: string;
  }
> = {
  calm: {
    emoji: '😌',
    label: 'Calm',
  },
  anxious: {
    emoji: '😟',
    label: 'Anxious',
  },
  neutral: {
    emoji: '😐',
    label: 'Neutral',
  },
  'in-control': {
    emoji: '🎉',
    label: 'In Control',
  },
};

interface DiaryEntry {
  mood: string;
  note: string;
  timestamp: string;
}

function getWeekDays() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  return DAY_LABELS.map((label, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = dateStr === today.toISOString().split('T')[0];
    const isPast = date < today && !isToday;
    const isFuture = date > today && !isToday;
    return {
      label,
      fullLabel: DAY_FULL_LABELS[i],
      dateStr,
      isToday,
      isPast,
      isFuture,
    };
  });
}

const STREAK_MESSAGES = [
  {
    min: 0,
    max: 0,
    text: 'Start your streak today!',
    emoji: '💪',
  },
  {
    min: 1,
    max: 2,
    text: 'Great start! Keep going.',
    emoji: '🌱',
  },
  {
    min: 3,
    max: 4,
    text: "You're building a habit!",
    emoji: '⚡',
  },
  {
    min: 5,
    max: 6,
    text: 'Incredible discipline!',
    emoji: '🔥',
  },
  {
    min: 7,
    max: 999,
    text: 'Unstoppable! Full week!',
    emoji: '👑',
  },
];

const getConversions = (val: number) => {
  const results = [];
  if (val >= 15)
    results.push({
      id: 'jeep',
      icon: <Bus className="w-6 h-6" />,
      count: Math.floor(val / 15),
      name: 'Jeepney rides',
      price: 15,
      color: 'bg-blue-500',
    });
  if (val >= 75)
    results.push({
      id: 'meal',
      icon: <Utensils className="w-6 h-6" />,
      count: Math.floor(val / 75),
      name: 'Campus meals',
      price: 75,
      color: 'bg-green-500',
    });
  if (val >= 50)
    results.push({
      id: 'book',
      icon: <BookOpen className="w-6 h-6" />,
      count: Math.floor(val / 50),
      name: 'Notebooks',
      price: 50,
      color: 'bg-indigo-500',
    });
  if (val >= 35)
    results.push({
      id: 'coffee',
      icon: <Coffee className="w-6 h-6" />,
      count: Math.floor(val / 35),
      name: 'Coffee + Pandesal',
      price: 35,
      color: 'bg-amber-500',
    });
  if (val >= 50)
    results.push({
      id: 'load',
      icon: <Smartphone className="w-6 h-6" />,
      count: Math.floor(val / 50),
      name: 'Days of Data Load',
      price: 50,
      color: 'bg-teal-500',
    });
  if (val >= 250)
    results.push({
      id: 'movie',
      icon: <Ticket className="w-6 h-6" />,
      count: Math.floor(val / 250),
      name: 'Movie tickets',
      price: 250,
      color: 'bg-purple-500',
    });
  return results.sort((a, b) => b.price - a.price).slice(0, 4);
};

export function HomeDashboard() {
  const {
    user,
    setScreen,
    streak,
    setStreak,
    diaryEntries,
    setDiaryEntries,
    pausedDays,
    setPausedDays,
  } = useAppContext();
  const [amount, setAmount] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [diaryMood, setDiaryMood] = useState<string | null>(null);
  const [diaryNote, setDiaryNote] = useState('');
  const [diarySaved, setDiarySaved] = useState(false);

  const weekDays = useMemo(() => getWeekDays(), []);
  const todayStr = new Date().toISOString().split('T')[0];
  const hasPausedToday = pausedDays.includes(todayStr);

  const currentStreak = useMemo(() => {
    let count = 0;
    const sorted = [...pausedDays].sort().reverse();
    const checkDate = new Date();
    if (!hasPausedToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sorted.includes(dateStr)) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [pausedDays, hasPausedToday]);

  const streakMessage =
    STREAK_MESSAGES.find((m) => currentStreak >= m.min && currentStreak <= m.max) ||
    STREAK_MESSAGES[0];

  const handleMarkToday = () => {
    if (!hasPausedToday) {
      setPausedDays([...pausedDays, todayStr]);
      setSelectedDay(todayStr);
    }
  };

  const handleDayTap = (
    dateStr: string,
    isPaused: boolean,
    isToday: boolean,
    isFuture: boolean,
  ) => {
    if (isFuture) return;
    if (selectedDay === dateStr) {
      setSelectedDay(null);
      return;
    }
    setSelectedDay(dateStr);
    const existing = diaryEntries[dateStr];
    if (existing) {
      setDiaryMood(existing.mood);
      setDiaryNote(existing.note);
    } else {
      setDiaryMood(null);
      setDiaryNote('');
    }
    setDiarySaved(false);
  };

  const handleSaveDiary = () => {
    if (!selectedDay || !diaryMood) return;
    const entry: DiaryEntry = {
      mood: diaryMood,
      note: diaryNote,
      timestamp: new Date().toISOString(),
    };
    setDiaryEntries({
      ...diaryEntries,
      [selectedDay]: entry,
    });
    if (!pausedDays.includes(selectedDay)) {
      setPausedDays([...pausedDays, selectedDay]);
    }
    setDiarySaved(true);
    setTimeout(() => setDiarySaved(false), 2500);
  };

  const selectedDayInfo = weekDays.find((d) => d.dateStr === selectedDay);
  const selectedDayEntry = selectedDay ? diaryEntries[selectedDay] : null;

  useEffect(() => {
    if (pausedDays.length === 0) {
      const seeds: string[] = [];
      const mockEntries: Record<string, DiaryEntry> = {};
      const today = new Date();
      const mockData = [
        {
          daysAgo: 1,
          mood: 'in-control',
          note: 'Saw it was 4 meals. Walked away.',
        },
        {
          daysAgo: 2,
          mood: 'anxious',
          note: 'Almost bet during break. Felt stressed about exams.',
        },
        {
          daysAgo: 3,
          mood: 'calm',
          note: 'Bought coffee instead. Felt good.',
        },
      ];
      mockData.forEach(({ daysAgo, mood, note }) => {
        const d = new Date(today);
        d.setDate(today.getDate() - daysAgo);
        const dateStr = d.toISOString().split('T')[0];
        seeds.push(dateStr);
        mockEntries[dateStr] = {
          mood,
          note,
          timestamp: d.toISOString(),
        };
      });
      setPausedDays(seeds);
      setDiaryEntries(mockEntries);
    }
  }, []);

  const handleConvert = () => {
    if (parseFloat(amount) > 0) {
      setShowResults(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setShowResults(false);
  };

  const numAmount = parseFloat(amount) || 0;
  const conversions = getConversions(numAmount);

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Hello, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-text-muted text-sm">Ready to reflect today?</p>
        </div>
        <Button
          onClick={() => setScreen('PROFILE')}
          variant="ghost"
          size="icon"
          className="rounded-full"
        >
          <img
            src={user?.avatarUrl || '/default-avatar.png'}
            alt="profile"
            className="w-10 h-10 rounded-full"
          />
        </Button>
      </div>

      <RealityCheck />

      {/* === Pause Streak Tracker + Inline Diary === */}
      <div className="bg-white rounded-3xl p-5 shadow-soft mb-6 border border-gray-50">
        {/* Streak Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={
                currentStreak > 0
                  ? {
                      scale: [1, 1.15, 1],
                      rotate: [0, -5, 5, 0],
                    }
                  : {}
              }
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'easeInOut',
              }}
            >
              <Flame
                className={`w-6 h-6 ${currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`}
              />
            </motion.div>
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold text-text-primary">{currentStreak}</span>
                <span className="text-sm font-semibold text-text-muted">day streak</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg">{streakMessage.emoji}</span>
            <p className="text-[10px] font-medium text-text-muted max-w-[100px]">
              {streakMessage.text}
            </p>
          </div>
        </div>

        {/* Day Circles — now tappable */}
        <div className="flex justify-between items-center px-1 mb-4">
          {weekDays.map((day) => {
            const isPaused = pausedDays.includes(day.dateStr);
            const isMissed = day.isPast && !isPaused;
            const isSelected = selectedDay === day.dateStr;
            const hasEntry = !!diaryEntries[day.dateStr];
            return (
              <button
                key={day.dateStr}
                onClick={() => handleDayTap(day.dateStr, isPaused, day.isToday, day.isFuture)}
                disabled={day.isFuture}
                className={`flex flex-col items-center space-y-1.5 focus:outline-none ${day.isFuture ? 'opacity-50' : ''}`}
              >
                <span
                  className={`text-[10px] font-bold uppercase ${day.isToday ? 'text-primary' : 'text-text-muted/60'}`}
                >
                  {day.label}
                </span>
                <motion.div
                  initial={false}
                  animate={
                    isPaused
                      ? {
                          scale: [0.8, 1.1, 1],
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.3,
                  }}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${isSelected ? 'ring-2 ring-offset-2 ring-primary' : ''}
                    ${isPaused ? 'bg-gray-100' : day.isToday ? 'bg-primary/10 border-2 border-primary border-dashed' : isMissed ? 'bg-rose-50 border border-rose-200' : 'bg-gray-100'}`}
                >
                  {isPaused ? (
                    <Check className="w-5 h-5 text-teal-500" strokeWidth={2} />
                  ) : isMissed ? (
                    <X className="w-4 h-4 text-rose-300" strokeWidth={2.5} />
                  ) : day.isToday ? (
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                      }}
                      className="w-2.5 h-2.5 bg-primary rounded-full"
                    />
                  ) : (
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  )}

                  {hasEntry && !isSelected && (
                    <div className="absolute -bottom-1 w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  )}
                </motion.div>
              </button>
            );
          })}
        </div>

        {/* === Expanded Diary Panel === */}
        <AnimatePresence mode="wait">
          {selectedDay && selectedDayInfo && (
            <motion.div
              key={selectedDay}
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: 'auto',
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
              }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Pencil className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold text-text-primary">
                      {selectedDayInfo.isToday ? 'Today' : selectedDayInfo.fullLabel}
                    </span>
                    {selectedDayEntry && (
                      <span className="text-lg">{MOOD_MAP[selectedDayEntry.mood]?.emoji}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-text-muted/50 hover:text-text-muted"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {selectedDayEntry && !diarySaved ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-3">
                      <span className="text-2xl">{MOOD_MAP[selectedDayEntry.mood]?.emoji}</span>
                      <div>
                        <span className="text-sm font-semibold text-text-primary">
                          {MOOD_MAP[selectedDayEntry.mood]?.label}
                        </span>
                        {selectedDayEntry.note && (
                          <p className="text-xs text-text-muted mt-0.5">
                            "{selectedDayEntry.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : !selectedDayEntry && !diarySaved ? (
                  <div className="space-y-4">
                    <p className="text-xs text-text-muted">How were you feeling?</p>

                    <div className="flex justify-between items-center">
                      {Object.entries(MOOD_MAP).map(([id, { emoji, label }]) => {
                        const isActive = diaryMood === id;
                        return (
                          <button
                            key={id}
                            onClick={() => setDiaryMood(id)}
                            className="flex flex-col items-center space-y-1 focus:outline-none"
                          >
                            <motion.div
                              animate={{
                                scale: isActive ? 1.15 : 1,
                                y: isActive ? -2 : 0,
                              }}
                              className={`w-11 h-11 rounded-full flex items-center justify-center text-xl transition-colors ${isActive ? 'bg-primary/10 ring-2 ring-primary ring-offset-1' : 'bg-gray-50'}`}
                            >
                              {emoji}
                            </motion.div>
                            <span
                              className={`text-[9px] font-medium ${isActive ? 'text-primary font-bold' : 'text-text-muted'}`}
                            >
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <textarea
                      value={diaryNote}
                      onChange={(e) => setDiaryNote(e.target.value)}
                      placeholder={
                        selectedDayInfo.isToday ? "What's on your mind?" : 'What happened that day?'
                      }
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none h-16 placeholder:text-text-muted/50"
                    />

                    <motion.button
                      whileTap={{
                        scale: 0.97,
                      }}
                      onClick={handleSaveDiary}
                      disabled={!diaryMood}
                      className={`w-full font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center space-x-1.5 transition-all ${diaryMood ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Save Entry</span>
                    </motion.button>
                  </div>
                ) : null}

                {diarySaved && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    className="flex items-center justify-center space-x-2 py-4 text-secondary"
                  >
                    <Check className="w-5 h-5" strokeWidth={3} />
                    <span className="font-semibold text-sm">Entry saved! Keep reflecting 💚</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedDay && (
          <>
            {!hasPausedToday ? (
              <motion.button
                whileTap={{
                  scale: 0.97,
                }}
                onClick={handleMarkToday}
                className="w-full bg-gradient-to-r from-secondary to-teal text-white font-semibold py-3 rounded-xl shadow-lg shadow-secondary/20 flex items-center justify-center space-x-2"
              >
                <Flame className="w-4 h-4" />
                <span>I paused today — mark my streak!</span>
              </motion.button>
            ) : (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="w-full bg-secondary/10 text-secondary font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 border border-secondary/20"
              >
                <Check className="w-4 h-4" strokeWidth={3} />
                <span>Paused today! You're on fire 🔥</span>
              </motion.div>
            )}
          </>
        )}
      </div>

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

      {/* Reflection Prompt */}
      <motion.div
        whileTap={{
          scale: 0.98,
        }}
        onClick={() => setScreen('DIARY')}
        className="bg-gradient-to-r from-teal/10 to-secondary/10 rounded-2xl p-5 border border-teal/20 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-text-primary mb-1">Paused today?</h3>
            <p className="text-sm text-text-muted">Log how you feel in your diary.</p>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <ArrowRight className="w-5 h-5 text-teal" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

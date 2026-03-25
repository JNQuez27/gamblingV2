'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EyeOff, Zap, Coins, Gift } from 'lucide-react';

export function LearnPage() {
  const cards = [
    {
      id: 'one-tap',
      title: 'One-Tap Traps',
      icon: <EyeOff className="w-8 h-8 text-rose-500" />,
      color: 'bg-rose-50 border-rose-100',
      text: 'No friction means no thinking. Real apps make you confirm purchases. Predatory apps remove steps so you bet before you can pause.',
    },
    {
      id: 'dopamine',
      title: 'The Dopamine Loop',
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      color: 'bg-amber-50 border-amber-100',
      text: "Bright colors, flashing lights, and random rewards keep your brain chasing the next hit. It's not luck—it's engineered design.",
    },
    {
      id: 'disappearing',
      title: 'Disappearing Money',
      icon: <Coins className="w-8 h-8 text-indigo-500" />,
      color: 'bg-indigo-50 border-indigo-100',
      text: "Converting cash to 'credits' or 'coins' makes it feel like game points. But those points are your meals and transport tomorrow.",
    },
    {
      id: 'loot',
      title: 'Loot Boxes & Micro-bets',
      icon: <Gift className="w-8 h-8 text-teal-500" />,
      color: 'bg-teal-50 border-teal-100',
      text: "Small bets seem harmless. ₱50 here, ₱50 there. But they add up fast—that's a week of snacks gone in minutes.",
    },
  ];
  return (
    <div className="bg-background pb-12 pt-8 px-4">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-text-primary">How Apps Keep You Playing</h1>
        <p className="text-text-muted text-sm">Knowledge is your best defense.</p>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
        className="space-y-4"
      >
        {cards.map((card) => (
          <motion.div
            key={card.id}
            variants={{
              hidden: {
                opacity: 0,
                y: 20,
              },
              visible: {
                opacity: 1,
                y: 0,
              },
            }}
            whileTap={{
              scale: 0.98,
            }}
            className={`bg-white rounded-3xl p-5 shadow-sm border-2 ${card.color} relative overflow-hidden`}
          >
            <div className="flex items-start space-x-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm shrink-0">{card.icon}</div>
              <div>
                <h3 className="font-bold text-text-primary mb-2 text-lg">{card.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{card.text}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-10 text-center">
        <div className="inline-block bg-primary/10 text-primary font-semibold px-6 py-3 rounded-full">
          Next time you see these, pause.
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeOff, Zap, Coins, Gift, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '../context/app-context';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Commodity {
  name: string;
  price: number;
  icon: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const LEARN_CARDS = [
  {
    id: 'one-tap',
    title: 'One-Tap Traps',
    icon: <EyeOff className="w-7 h-7 text-rose-500" />,
    color: 'bg-rose-50 border-rose-100',
    text: 'No friction means no thinking. Real apps make you confirm purchases. Predatory apps remove steps so you bet before you can pause.',
  },
  {
    id: 'dopamine',
    title: 'The Dopamine Loop',
    icon: <Zap className="w-7 h-7 text-amber-500" />,
    color: 'bg-amber-50 border-amber-100',
    text: "Bright colors, flashing lights, and random rewards keep your brain chasing the next hit. It's not luck—it's engineered design.",
  },
  {
    id: 'disappearing',
    title: 'Disappearing Money',
    icon: <Coins className="w-7 h-7 text-indigo-500" />,
    color: 'bg-indigo-50 border-indigo-100',
    text: "Converting cash to 'credits' or 'coins' makes it feel like game points. But those points are your meals and transport tomorrow.",
  },
  {
    id: 'loot',
    title: 'Loot Boxes & Micro-bets',
    icon: <Gift className="w-7 h-7 text-teal-500" />,
    color: 'bg-teal-50 border-teal-100',
    text: "Small bets seem harmless. ₱50 here, ₱50 there. But they add up fast—that's a week of snacks gone in minutes.",
  },
];

const PRESET_COMMODITIES: Commodity[] = [
  { name: 'Coffee', price: 5, icon: '☕' },
  { name: 'Restaurant Meal', price: 25, icon: '🍽️' },
  { name: 'Movie Ticket', price: 15, icon: '🎬' },
  { name: 'Subscription (Monthly)', price: 15, icon: '📱' },
  { name: 'Gaming Purchase', price: 20, icon: '🎮' },
  { name: 'Streaming Service', price: 12, icon: '📺' },
  { name: 'Online Shopping', price: 50, icon: '🛍️' },
  { name: 'Concert Ticket', price: 80, icon: '🎵' },
  { name: 'Weekend Trip', price: 200, icon: '✈️' },
  { name: 'Luxury Item', price: 500, icon: '💎' },
  { name: 'Emergency Fund', price: 1000, icon: '🏦' },
  { name: 'Investment (Monthly)', price: 300, icon: '📈' },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CommodityLibrary() {
  const { addSpending } = useAppContext();

  // Commodity form state
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Handlers
  const handleSelectCommodity = (commodity: Commodity) => {
    setSelectedCommodity(commodity);
    setAmount(commodity.price.toString());
    setNotes('');
    setShowCustomForm(false);
  };

  const handleCancelSelection = () => {
    setSelectedCommodity(null);
    setAmount('');
    setNotes('');
  };

  const resetCustomForm = () => {
    setCustomName('');
    setCustomPrice('');
    setCustomNotes('');
    setShowCustomForm(false);
    setSubmitted(false);
  };

  const handleSaveSelected = () => {
    const spendAmount = parseFloat(amount);
    if (!selectedCommodity || isNaN(spendAmount) || spendAmount <= 0) return;

    addSpending({
      amount: spendAmount,
      category: selectedCommodity.name,
      timestamp: new Date(),
      notes: notes.trim() || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      handleCancelSelection();
      setSubmitted(false);
    }, 1500);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(customPrice);
    if (!customName.trim() || isNaN(price) || price <= 0) return;

    addSpending({
      amount: price,
      category: customName.trim(),
      timestamp: new Date(),
      notes: customNotes.trim() || undefined,
    });

    setSubmitted(true);
    setTimeout(resetCustomForm, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ── Learn Section ── */}
      <div className="pt-8 px-4">
        <div className="mb-6 px-2">
          <h1 className="text-2xl font-bold text-text-primary">Learn</h1>
          <p className="text-sm text-text-muted mt-1">How apps keep you playing.</p>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-3"
        >
          {LEARN_CARDS.map((card) => (
            <motion.div
              key={card.id}
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              className={`bg-white rounded-3xl p-5 border-2 ${card.color} flex items-start gap-4`}
            >
              <div className="bg-white p-2.5 rounded-2xl shadow-sm shrink-0">{card.icon}</div>
              <div>
                <h3 className="font-bold text-text-primary text-base mb-1">{card.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{card.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 text-center">
          <span className="inline-block bg-primary/10 text-primary font-semibold px-6 py-3 rounded-full text-sm">
            Next time you see these, pause.
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 my-2 mb-8 " />

      {/* ── Opportunity Cost Section ── */}
      <div className="px-4">
        <div className="mb-6 px-2">
          <h3 className="text-2xl text-foreground font-semibold">See what your money could become.</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Every purchase is an opportunity cost. See how your money could be used elsewhere.
          </p>
        </div>

        {/* Preset Grid */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
            Common Purchases
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            {PRESET_COMMODITIES.map((commodity) => (
              <motion.button
                key={commodity.name}
                onClick={() => handleSelectCommodity(commodity)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`p-3 rounded-2xl text-center border-2 transition-colors ${
                  selectedCommodity?.name === commodity.name
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <div className="text-2xl mb-1.5">{commodity.icon}</div>
                <div className="text-xs font-medium text-foreground leading-tight">
                  {commodity.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">${commodity.price}</div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Custom Toggle */}
        <div className="mt-4 space-y-3">
          <button
            onClick={() => {
              setShowCustomForm((prev) => !prev);
              handleCancelSelection();
            }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border text-primary hover:bg-primary/5 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Add Custom Amount
          </button>

          {/* Custom Form */}
          <AnimatePresence>
            {showCustomForm && (
              <motion.form
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                onSubmit={handleSaveCustom}
                className="space-y-3 p-4 bg-card rounded-2xl border border-border"
              >
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    What did you spend on?
                  </label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., New Phone"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Amount ($)
                  </label>
                  <Input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Notes (optional)
                  </label>
                  <Textarea
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="How did this purchase make you feel?"
                    className="rounded-xl resize-none"
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 rounded-xl">
                  {submitted ? 'Saved!' : 'Record Purchase'}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Commodity Form */}
        <AnimatePresence>
          {selectedCommodity && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 space-y-3 p-4 bg-card rounded-2xl border border-border"
            >
              <h3 className="font-semibold text-foreground">
                {selectedCommodity.icon} {selectedCommodity.name}
              </h3>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Amount ($)
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="rounded-xl text-lg font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Notes (optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Why did you spend this? How did it make you feel?"
                  className="rounded-xl resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button
                  type="button"
                  onClick={handleCancelSelection}
                  variant="outline"
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveSelected}
                  className="bg-primary hover:bg-primary/90 rounded-xl"
                >
                  {submitted ? 'Saved!' : 'Record Purchase'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/context/app-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const PRESET_COMMODITIES = [
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

interface CommoditySelection {
  name: string;
  price: number;
  icon: string;
}

export function CommodityLibrary() {
  const { addSpending } = useAppContext();
  const [selectedCommodity, setSelectedCommodity] = useState<CommoditySelection | null>(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSelectCommodity = (commodity: CommoditySelection) => {
    setSelectedCommodity(commodity);
    setAmount(commodity.price.toString());
    setShowCustomForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommodity && (!customName || !customPrice)) return;

    const commodityData = selectedCommodity || {
      name: customName,
      price: parseFloat(customPrice),
      icon: '💰',
    };

    addSpending({
      amount: parseFloat(amount) || parseFloat(customPrice),
      commodity: commodityData.name,
      timestamp: new Date(),
      notes,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSelectedCommodity(null);
      setAmount('');
      setNotes('');
      setCustomName('');
      setCustomPrice('');
      setShowCustomForm(false);
      setSubmitted(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background px-6 py-4 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Opportunity Cost</h1>
        <p className="text-sm text-muted-foreground mt-1">See what your money could become</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Preset Commodities */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Common Purchases</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESET_COMMODITIES.map((commodity) => (
              <motion.button
                key={commodity.name}
                onClick={() => handleSelectCommodity(commodity)}
                className={`p-4 rounded-xl text-center transition-all border-2 ${
                  selectedCommodity?.name === commodity.name
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-3xl mb-2">{commodity.icon}</div>
                <div className="text-sm font-medium text-foreground">{commodity.name}</div>
                <div className="text-xs text-muted-foreground mt-1">${commodity.price}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Input Form */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <button
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-border text-primary hover:bg-primary/5 transition-colors"
          >
            <Plus size={20} />
            <span className="font-medium">Add Custom Amount</span>
          </button>

          <AnimatePresence>
            {showCustomForm && (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="space-y-4 p-4 bg-card rounded-xl border border-border"
              >
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    What did you spend on?
                  </label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., New Phone"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Amount ($)
                  </label>
                  <Input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Notes (optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did this purchase make you feel?"
                    className="rounded-lg resize-none"
                    rows={3}
                  />
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Amount Adjustment */}
        {selectedCommodity && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 p-4 bg-card rounded-xl border border-border"
          >
            <h3 className="font-semibold text-foreground">Amount</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                className="rounded-lg text-lg font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Why did you spend this? How did it make you feel?"
                className="rounded-lg resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button
                onClick={() => {
                  setSelectedCommodity(null);
                  setAmount('');
                  setNotes('');
                }}
                variant="outline"
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 rounded-lg">
                {submitted ? 'Saved!' : 'Record Purchase'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

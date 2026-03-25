'use client';

import { Home, BookOpen, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';

type NavItem = 'home' | 'diary' | 'learn' | 'profile';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: NavItem) => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'diary', icon: BookOpen, label: 'Diary' },
  { id: 'learn', icon: Heart, label: 'Learn' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-lg border-t border-border z-50">
      <div className="grid grid-cols-4 h-full">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as any)}
            className="flex flex-col items-center justify-center gap-1 text-muted-foreground relative"
          >
            <item.icon
              className={`h-6 w-6 transition-colors ${activeTab === item.id ? 'text-primary' : ''}`}
            />
            <span
              className={`text-xs font-medium transition-colors ${
                activeTab === item.id ? 'text-primary' : ''
              }`}
            >
              {item.label}
            </span>
            {activeTab === item.id && (
              <motion.div
                layoutId="active-indicator"
                className="absolute top-0 h-0.5 w-1/2 bg-primary rounded-full"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

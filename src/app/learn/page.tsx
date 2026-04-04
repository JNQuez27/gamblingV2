"use client";

import { useState, useEffect } from 'react';
import BottomNav from "@/components/ui/BottomNav";
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import QuickPractices from './components/QuickPractices';
import FeaturedArticles from './components/FeaturedArticles';
import { styles } from './styles';
import { Article } from './components/ArticleCard';

const articlesData: Article[] = [
    {
      id: 1,
      category: "Mindfulness",
      title: "The 6-Second Rule: Why Pausing Changes Everything",
      desc: "Science shows that waiting just 6 seconds before reacting reduces the emotional charge significantly.",
      readTime: "4 min read",
      icon: "⏸️",
      color: "#eff6ff",
      border: "#bfdbfe",
    },
    {
      id: 2,
      category: "Anger",
      title: "Understanding Your Anger Triggers",
      desc: "Recognize the patterns that set you off — and learn to interrupt them before they escalate.",
      readTime: "6 min read",
      icon: "🌋",
      color: "#fef2f2",
      border: "#fecaca",
    },
    {
      id: 3,
      category: "Habits",
      title: "How Small Pauses Build Big Change",
      desc: "Micro-moments of awareness compound into lasting behavioral shifts over time.",
      readTime: "5 min read",
      icon: "🌱",
      color: "#f0fdf4",
      border: "#bbf7d0",
    },
    {
      id: 4,
      category: "Anxiety",
      title: "Breaking the Rumination Loop",
      desc: "When your mind replays the same scenario endlessly — here's how to gently step out.",
      readTime: "7 min read",
      icon: "🔄",
      color: "#fdf4ff",
      border: "#e9d5ff",
    },
    {
      id: 5,
      category: "Mindfulness",
      title: "Body Scan: Checking In With Yourself",
      desc: "A simple 3-minute practice to notice physical tension and release it before it becomes emotion.",
      readTime: "3 min read",
      icon: "🧘",
      color: "#fefce8",
      border: "#fde68a",
    },
  ];

export default function LearnPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Simulate loading for 1.5 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.appShell}>
      <div style={styles.contentWrapper}>
        <Header />
        <div style={styles.pageContent}>
          <CategoryFilter />
          <QuickPractices />
          <FeaturedArticles articles={articlesData} isLoading={isLoading} />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

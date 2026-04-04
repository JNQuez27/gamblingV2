"use client";

import { useState, useEffect } from "react";
import BottomNav from "@/components/ui/navigation/BottomNav";
import Header from "./components/Header";
import RealityCheckCard from "./components/RealityCheckCard";
import WeeklyStreak from "./components/WeeklyStreak";
import QuickActions from "./components/QuickActions";
import RecentInsights from "./components/RecentInsights";
import HomeSkeleton from "./components/HomeSkeleton";
import { styles } from "./styles";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.appShell}>
      <div style={styles.contentWrapper}>
        {isLoading ? (
          <HomeSkeleton />
        ) : (
          <>
            <Header />
            <div style={{ ...styles.pageContent, paddingTop: '28px' }}>
              <RealityCheckCard />
              <WeeklyStreak />
              <QuickActions />
              <RecentInsights />
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

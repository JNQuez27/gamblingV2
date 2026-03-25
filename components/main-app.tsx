'use client';

import { useState } from 'react';
import { Home, BookOpen, Heart, User } from 'lucide-react';
import { HomeDashboard } from './home-dashboard';
import { DiaryScreen } from './diary-screen';
import { CommodityLibrary } from './commodity-library';
import { ProfileScreen } from './profile-screen';
import { BottomNav } from './bottom-nav';

type Tab = 'home' | 'diary' | 'learn' | 'profile';

export function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard />;
      case 'diary':
        return <DiaryScreen />;
      case 'learn':
        return <CommodityLibrary />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <main className="pb-20">{renderContent()}</main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

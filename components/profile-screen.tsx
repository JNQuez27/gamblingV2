'use client';

import { useState } from 'react';
import { useAppContext } from '../context/app-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsDashboard } from './analytics-dashboard';
import { ResourceHub } from './resource-hub';
import { StreakTracker } from './streak-tracker';

export function ProfileScreen() {
  const { user } = useAppContext();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full">
          Edit Profile
        </Button>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
          <TabsContent value="streaks">
            <StreakTracker />
          </TabsContent>
          <TabsContent value="resources">
            <ResourceHub />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

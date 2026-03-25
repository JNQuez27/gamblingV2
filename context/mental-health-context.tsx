'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface EmotionEntry {
  id: string
  date: Date
  emotion: 'calm' | 'anxious' | 'stressed' | 'sad' | 'irritable' | 'happy' | 'content'
  intensity: number // 1-10
  gamblingUrge: number // 1-10
  triggers?: string[]
  notes?: string
}

export interface TriggerRecord {
  id: string
  name: string
  category: 'emotional' | 'situational' | 'social' | 'environmental' | 'time-based'
  frequency: number
  lastOccurred: Date
  copingStrategies: string[]
}

export interface CopingStrategy {
  id: string
  name: string
  description: string
  category: 'breathing' | 'mindfulness' | 'physical' | 'cognitive' | 'social' | 'creative'
  duration: number // minutes
  instructions: string[]
  helpful: boolean
}

export interface CopingStrategyLog {
  id: string
  strategyId: string
  date: Date
  effectiveness: number // 1-10
  notes?: string
}

export interface MeditationSession {
  id: string
  title: string
  duration: number // minutes
  category: 'anxiety' | 'sleep' | 'stress' | 'focus' | 'body-scan' | 'loving-kindness'
  audioUrl?: string
}

export interface MeditationLog {
  id: string
  sessionId: string
  date: Date
  completed: boolean
  duration: number
  mood: 'before' | 'after'
  rating: number // 1-5
}

export interface TherapyNote {
  id: string
  date: Date
  topic: string
  insights: string
  homeworkAssignments?: string[]
  nextSession?: Date
}

export interface CommunityPost {
  id: string
  userId: string
  userName: string
  avatar?: string
  content: string
  date: Date
  likes: number
  comments: number
  category: 'victory' | 'struggle' | 'question' | 'resource' | 'support'
}

export interface MentalHealthInsight {
  id: string
  type: 'pattern' | 'achievement' | 'recommendation' | 'trend'
  title: string
  description: string
  data: Record<string, number>
  timestamp: Date
}

export interface MentalHealthContextType {
  // Emotion tracking
  emotions: EmotionEntry[]
  addEmotion: (emotion: EmotionEntry) => void
  getTodayEmotion: () => EmotionEntry | undefined
  
  // Trigger tracking
  triggers: TriggerRecord[]
  addTrigger: (trigger: TriggerRecord) => void
  updateTrigger: (id: string, trigger: Partial<TriggerRecord>) => void
  getTopTriggers: (limit: number) => TriggerRecord[]
  
  // Coping strategies
  strategies: CopingStrategy[]
  strategyLogs: CopingStrategyLog[]
  addStrategyLog: (log: CopingStrategyLog) => void
  getMostEffectiveStrategies: () => CopingStrategy[]
  
  // Meditation
  meditations: MeditationSession[]
  meditationLogs: MeditationLog[]
  addMeditationLog: (log: MeditationLog) => void
  getMeditationStats: () => { totalSessions: number; totalMinutes: number; avgRating: number }
  
  // Therapy
  therapyNotes: TherapyNote[]
  addTherapyNote: (note: TherapyNote) => void
  
  // Community
  communityPosts: CommunityPost[]
  addCommunityPost: (post: CommunityPost) => void
  
  // Insights
  insights: MentalHealthInsight[]
  addInsight: (insight: MentalHealthInsight) => void
  
  // Streak
  currentStreak: number
  updateStreak: () => void
  
  // Wellness score
  getWellnessScore: () => number
}

const MentalHealthContext = createContext<MentalHealthContextType | undefined>(undefined)

export function MentalHealthProvider({ children }: { children: ReactNode }) {
  const [emotions, setEmotions] = useState<EmotionEntry[]>([
    {
      id: '1',
      date: new Date(Date.now() - 86400000),
      emotion: 'calm',
      intensity: 7,
      gamblingUrge: 3,
      triggers: ['afternoon boredom'],
      notes: 'Used breathing technique'
    }
  ])
  
  const [triggers, setTriggers] = useState<TriggerRecord[]>([
    {
      id: '1',
      name: 'Stress at work',
      category: 'emotional',
      frequency: 12,
      lastOccurred: new Date(Date.now() - 172800000),
      copingStrategies: ['exercise', 'meditation']
    },
    {
      id: '2',
      name: 'Evening boredom',
      category: 'situational',
      frequency: 8,
      lastOccurred: new Date(Date.now() - 259200000),
      copingStrategies: ['reading', 'call friend']
    }
  ])
  
  const [strategies] = useState<CopingStrategy[]>([
    {
      id: '1',
      name: 'Box Breathing',
      description: 'A grounding breathing technique to calm anxiety',
      category: 'breathing',
      duration: 5,
      instructions: ['Breathe in for 4 counts', 'Hold for 4 counts', 'Exhale for 4 counts', 'Hold for 4 counts', 'Repeat 5 times'],
      helpful: true
    },
    {
      id: '2',
      name: 'Progressive Muscle Relaxation',
      description: 'Tense and release muscle groups to reduce tension',
      category: 'physical',
      duration: 10,
      instructions: ['Start with toes', 'Tense for 5 seconds', 'Release and notice the difference', 'Move up through body'],
      helpful: true
    },
    {
      id: '3',
      name: 'Thought Reframing',
      description: 'Challenge and reframe negative thoughts',
      category: 'cognitive',
      duration: 5,
      instructions: ['Notice the thought', 'Is it true? What evidence?', 'What would you tell a friend?', 'Reframe positively'],
      helpful: true
    },
    {
      id: '4',
      name: '5 Senses Grounding',
      description: 'Engage your senses to stay present',
      category: 'mindfulness',
      duration: 3,
      instructions: ['5 things you see', '4 things you touch', '3 things you hear', '2 things you smell', '1 thing you taste'],
      helpful: true
    },
    {
      id: '5',
      name: 'Call a Support Person',
      description: 'Reach out to someone you trust',
      category: 'social',
      duration: 15,
      instructions: ['Pick someone to call', 'Be honest about what you\'re feeling', 'Listen to their perspective', 'Make a plan together'],
      helpful: true
    }
  ])
  
  const [strategyLogs, setStrategyLogs] = useState<CopingStrategyLog[]>([])
  
  const [meditations] = useState<MeditationSession[]>([
    {
      id: '1',
      title: 'Calm Mind - Anxiety Relief',
      duration: 10,
      category: 'anxiety',
      audioUrl: '/meditations/anxiety-relief.mp3'
    },
    {
      id: '2',
      title: 'Body Scan - Stress Release',
      duration: 15,
      category: 'body-scan',
      audioUrl: '/meditations/body-scan.mp3'
    },
    {
      id: '3',
      title: 'Sleep Deep - Restful Night',
      duration: 20,
      category: 'sleep',
      audioUrl: '/meditations/sleep.mp3'
    },
    {
      id: '4',
      title: 'Focus Boost - Concentration',
      duration: 8,
      category: 'focus',
      audioUrl: '/meditations/focus.mp3'
    },
    {
      id: '5',
      title: 'Self-Compassion - Loving Kindness',
      duration: 12,
      category: 'loving-kindness',
      audioUrl: '/meditations/self-compassion.mp3'
    }
  ])
  
  const [meditationLogs, setMeditationLogs] = useState<MeditationLog[]>([
    {
      id: '1',
      sessionId: '1',
      date: new Date(Date.now() - 86400000),
      completed: true,
      duration: 10,
      mood: 'after',
      rating: 4
    }
  ])
  
  const [therapyNotes, setTherapyNotes] = useState<TherapyNote[]>([
    {
      id: '1',
      date: new Date(Date.now() - 604800000),
      topic: 'Identifying emotional triggers',
      insights: 'Discovered that work stress is a major trigger. Need to develop better coping mechanisms.',
      homeworkAssignments: ['Track triggers daily', 'Practice box breathing 2x daily'],
      nextSession: new Date(Date.now() + 604800000)
    }
  ])
  
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      userId: 'user-2',
      userName: 'Sarah M.',
      content: 'Just hit 30 days! Never thought I could do it. Every coping strategy is making a difference.',
      date: new Date(Date.now() - 86400000),
      likes: 24,
      comments: 5,
      category: 'victory'
    },
    {
      id: '2',
      userId: 'user-3',
      userName: 'Marcus L.',
      content: 'Struggling today. The urges feel strong. Going to try the 5 senses technique now.',
      date: new Date(Date.now() - 172800000),
      likes: 8,
      comments: 12,
      category: 'struggle'
    }
  ])
  
  const [insights, setInsights] = useState<MentalHealthInsight[]>([
    {
      id: '1',
      type: 'pattern',
      title: 'Afternoon Stress Pattern',
      description: 'You experience peak stress levels between 3-5 PM. Consider planning support activities during this time.',
      data: { '3PM': 8, '4PM': 9, '5PM': 7 },
      timestamp: new Date()
    }
  ])
  
  const [currentStreak, setCurrentStreak] = useState(12)

  const addEmotion = (emotion: EmotionEntry) => {
    setEmotions([...emotions, emotion])
  }

  const getTodayEmotion = () => {
    const today = new Date()
    return emotions.find(e => {
      const eDate = new Date(e.date)
      return eDate.toDateString() === today.toDateString()
    })
  }

  const addTrigger = (trigger: TriggerRecord) => {
    setTriggers([...triggers, trigger])
  }

  const updateTrigger = (id: string, trigger: Partial<TriggerRecord>) => {
    setTriggers(triggers.map(t => t.id === id ? { ...t, ...trigger } : t))
  }

  const getTopTriggers = (limit: number) => {
    return [...triggers].sort((a, b) => b.frequency - a.frequency).slice(0, limit)
  }

  const addStrategyLog = (log: CopingStrategyLog) => {
    setStrategyLogs([...strategyLogs, log])
  }

  const getMostEffectiveStrategies = () => {
    const strategyScores: Record<string, { total: number; count: number }> = {}
    
    strategyLogs.forEach(log => {
      if (!strategyScores[log.strategyId]) {
        strategyScores[log.strategyId] = { total: 0, count: 0 }
      }
      strategyScores[log.strategyId].total += log.effectiveness
      strategyScores[log.strategyId].count += 1
    })

    return strategies
      .map(s => ({
        ...s,
        avgEffectiveness: strategyScores[s.id]?.total / strategyScores[s.id]?.count || 0
      }))
      .sort((a, b) => b.avgEffectiveness - a.avgEffectiveness)
      .slice(0, 5)
  }

  const addMeditationLog = (log: MeditationLog) => {
    setMeditationLogs([...meditationLogs, log])
  }

  const getMeditationStats = () => {
    const completed = meditationLogs.filter(l => l.completed)
    return {
      totalSessions: completed.length,
      totalMinutes: completed.reduce((sum, l) => sum + l.duration, 0),
      avgRating: completed.length > 0 ? completed.reduce((sum, l) => sum + l.rating, 0) / completed.length : 0
    }
  }

  const addTherapyNote = (note: TherapyNote) => {
    setTherapyNotes([...therapyNotes, note])
  }

  const addCommunityPost = (post: CommunityPost) => {
    setCommunityPosts([...communityPosts, post])
  }

  const addInsight = (insight: MentalHealthInsight) => {
    setInsights([...insights, insight])
  }

  const updateStreak = () => {
    const today = new Date()
    const lastEmotion = emotions.length > 0 ? emotions[emotions.length - 1] : null
    
    if (lastEmotion) {
      const lastDate = new Date(lastEmotion.date)
      const diffTime = Math.abs(today.getTime() - lastDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0 || diffDays === 1) {
        setCurrentStreak(currentStreak + 1)
      }
    }
  }

  const getWellnessScore = () => {
    let score = 50
    
    // Meditation bonus
    const medStats = getMeditationStats()
    score += Math.min(medStats.totalSessions * 2, 20)
    
    // Recent coping strategy use
    const recentLogs = strategyLogs.filter(log => {
      const daysSince = (Date.now() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24)
      return daysSince < 7
    })
    score += Math.min(recentLogs.length * 3, 15)
    
    // Emotional stability
    const recentEmotions = emotions.filter(e => {
      const daysSince = (Date.now() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24)
      return daysSince < 7
    })
    if (recentEmotions.length > 0) {
      const avgIntensity = recentEmotions.reduce((sum, e) => sum + e.intensity, 0) / recentEmotions.length
      score += Math.min(avgIntensity * 1.5, 15)
    }
    
    return Math.min(Math.round(score), 100)
  }

  return (
    <MentalHealthContext.Provider
      value={{
        emotions,
        addEmotion,
        getTodayEmotion,
        triggers,
        addTrigger,
        updateTrigger,
        getTopTriggers,
        strategies: strategies,
        strategyLogs,
        addStrategyLog,
        getMostEffectiveStrategies,
        meditations,
        meditationLogs,
        addMeditationLog,
        getMeditationStats,
        therapyNotes,
        addTherapyNote,
        communityPosts,
        addCommunityPost,
        insights,
        addInsight,
        currentStreak,
        updateStreak,
        getWellnessScore
      }}
    >
      {children}
    </MentalHealthContext.Provider>
  )
}

export function useMentalHealth() {
  const context = useContext(MentalHealthContext)
  if (!context) {
    throw new Error('useMentalHealth must be used within MentalHealthProvider')
  }
  return context
}
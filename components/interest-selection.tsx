"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface InterestSelectionProps {
  onComplete: () => void
}

const interests = [
  { id: "mindfulness", label: "Mindfulness", icon: MindfulnessIcon },
  { id: "fitness", label: "Fitness", icon: FitnessIcon },
  { id: "finance", label: "Finance", icon: FinanceIcon },
  { id: "health", label: "Health", icon: HealthIcon },
  { id: "productivity", label: "Productivity", icon: ProductivityIcon },
  { id: "relationships", label: "Relationships", icon: RelationshipsIcon },
  { id: "sleep", label: "Sleep", icon: SleepIcon },
  { id: "nutrition", label: "Nutrition", icon: NutritionIcon },
  { id: "meditation", label: "Meditation", icon: MeditationIcon },
  { id: "journaling", label: "Journaling", icon: JournalingIcon },
  { id: "exercise", label: "Exercise", icon: ExerciseIcon },
  { id: "selfcare", label: "Self-Care", icon: SelfCareIcon },
]

export function InterestSelection({ onComplete }: InterestSelectionProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleContinue = () => {
    onComplete()
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold tracking-tight text-foreground"
        >
          What are you interested in?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-2 text-muted-foreground"
        >
          Choose a few to personalize your experience
        </motion.p>
      </div>

      {/* Interest Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          {interests.map((interest, index) => {
            const isSelected = selectedInterests.includes(interest.id)
            const Icon = interest.icon

            return (
              <motion.button
                key={interest.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleInterest(interest.id)}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all duration-200 ${
                  isSelected
                    ? "bg-primary/10 ring-2 ring-primary"
                    : "bg-card shadow-sm hover:shadow-md"
                }`}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute right-2 top-2"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    isSelected ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 transition-colors ${
                      isSelected ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>

                <span
                  className={`text-sm font-medium transition-colors ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {interest.label}
                </span>
              </motion.button>
            )
          })}
        </motion.div>
      </div>

      {/* Actions - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm px-6 py-4 border-t border-border">
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleContinue}
            disabled={selectedInterests.length === 0}
            className="w-full h-12 rounded-xl text-base font-medium"
          >
            Continue
          </Button>
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}

// Icon Components
function MindfulnessIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l2 2" />
      <path d="M8 12a4 4 0 0 1 8 0" />
    </svg>
  )
}

function FitnessIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6.5 6.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M4 21v-6l-2-2 3-3 4 2 4-4 3 3" />
      <path d="M17 21v-9l3-3" />
    </svg>
  )
}

function FinanceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function HealthIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19.5 12.572l-7.5 7.428l-7.5-7.428a5 5 0 1 1 7.5-6.566a5 5 0 1 1 7.5 6.572" />
    </svg>
  )
}

function ProductivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

function RelationshipsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function SleepIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function NutritionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2a5 5 0 0 0-5 5c0 2 1 3 1 5s-1 3-1 5a5 5 0 0 0 10 0c0-2-1-3-1-5s1-3 1-5a5 5 0 0 0-5-5z" />
      <path d="M12 2v20" />
    </svg>
  )
}

function MeditationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="6" r="3" />
      <path d="M12 9v3" />
      <path d="M8 15c0-2.21 1.79-3 4-3s4 .79 4 3" />
      <path d="M5 21c0-3.31 3.13-6 7-6s7 2.69 7 6" />
    </svg>
  )
}

function JournalingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6M8 11h8" />
    </svg>
  )
}

function ExerciseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 5v14M18 5v14M6 9h12M6 15h12M2 12h4M18 12h4" />
    </svg>
  )
}

function SelfCareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9h.01M15 9h.01" />
    </svg>
  )
}

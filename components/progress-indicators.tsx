"use client"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { motion, AnimatePresence } from "framer-motion"

// Loading Spinner with fade animation
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "muted" | "primary"
  className?: string
  label?: string
}

export function LoadingSpinner({ 
  size = "md", 
  variant = "muted",
  className,
  label 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-6",
    lg: "size-8"
  }

  const variantClasses = {
    default: "text-muted-foreground/60",
    muted: "text-muted-foreground/40",
    primary: "text-primary/70"
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("flex flex-col items-center justify-center gap-2", className)}
    >
      <Spinner className={cn(sizeClasses[size], variantClasses[variant])} />
      {label && (
        <span className="text-sm text-muted-foreground/60">{label}</span>
      )}
    </motion.div>
  )
}

// Full page loading overlay
interface PageLoaderProps {
  isLoading: boolean
  label?: string
}

export function PageLoader({ isLoading, label = "Loading..." }: PageLoaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <LoadingSpinner size="lg" variant="primary" label={label} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Skeleton card loader
interface SkeletonCardProps {
  className?: string
  showAvatar?: boolean
  lines?: number
}

export function SkeletonCard({ 
  className, 
  showAvatar = false,
  lines = 3 
}: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "rounded-2xl bg-card p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {showAvatar && (
          <Skeleton className="size-12 shrink-0 rounded-full bg-muted/50" />
        )}
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-3/4 bg-muted/50" />
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={cn(
                "h-3 bg-muted/40",
                i === lines - 2 ? "w-1/2" : "w-full"
              )} 
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Stats skeleton loader
export function SkeletonStats({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("grid grid-cols-3 gap-3", className)}
    >
      {[1, 2, 3].map((i) => (
        <div 
          key={i} 
          className="flex flex-col items-center gap-2 rounded-xl bg-card p-4 shadow-sm"
        >
          <Skeleton className="size-10 rounded-full bg-muted/50" />
          <Skeleton className="h-5 w-10 bg-muted/50" />
          <Skeleton className="h-3 w-16 bg-muted/40" />
        </div>
      ))}
    </motion.div>
  )
}

// Profile header skeleton
export function SkeletonProfileHeader({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("flex flex-col items-center gap-3 py-6", className)}
    >
      <Skeleton className="size-24 rounded-full bg-muted/50" />
      <Skeleton className="h-6 w-24 bg-muted/50" />
      <Skeleton className="h-4 w-40 bg-muted/40" />
    </motion.div>
  )
}

// Weekly progress skeleton
export function SkeletonWeeklyProgress({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("rounded-2xl bg-card p-5 shadow-sm", className)}
    >
      <Skeleton className="mb-4 h-5 w-32 bg-muted/50" />
      <div className="flex justify-between">
        {["M", "T", "W", "T", "F", "S", "S"].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="size-8 rounded-full bg-muted/40" />
            <Skeleton className="h-3 w-3 bg-muted/30" />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Achievements skeleton
export function SkeletonAchievements({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("rounded-2xl bg-card p-5 shadow-sm", className)}
    >
      <Skeleton className="mb-4 h-5 w-28 bg-muted/50" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 py-2">
            <Skeleton className="size-12 rounded-full bg-muted/40" />
            <Skeleton className="h-3 w-14 bg-muted/30" />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Content loader wrapper with fade transition
interface ContentLoaderProps {
  isLoading: boolean
  skeleton: React.ReactNode
  children: React.ReactNode
}

export function ContentLoader({ isLoading, skeleton, children }: ContentLoaderProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Inline loading indicator
interface InlineLoaderProps {
  className?: string
}

export function InlineLoader({ className }: InlineLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn("flex items-center gap-1.5", className)}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground/40"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut"
          }}
        />
      ))}
    </motion.div>
  )
}

// Button loading state
interface ButtonLoaderProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
}

export function ButtonLoader({ isLoading, children, loadingText }: ButtonLoaderProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.span
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2"
        >
          <Spinner className="size-4 text-current" />
          {loadingText && <span>{loadingText}</span>}
        </motion.span>
      ) : (
        <motion.span
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

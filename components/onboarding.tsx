"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { Button } from "@/components/ui/button"

interface SlideContent {
  title: string
  subtitle: string
  illustration: React.ReactNode
}

const slides: SlideContent[] = [
  {
    title: "Become aware of your habits",
    subtitle: "The first step to change is recognizing patterns in your behavior. Take a moment to observe without judgment.",
    illustration: <AwarenessIllustration />,
  },
  {
    title: "Pause and reflect before you act",
    subtitle: "When you feel an urge, take a breath. This space between impulse and action is where growth happens.",
    illustration: <ReflectionIllustration />,
  },
  {
    title: "Make better choices, one step at a time",
    subtitle: "Every small decision adds up. Celebrate progress, not perfection, on your journey to positive change.",
    illustration: <GrowthIllustration />,
  },
]

function AwarenessIllustration() {
  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-full w-full">
        {/* Person silhouette in thinking pose */}
        <circle cx="100" cy="60" r="25" className="fill-primary/20" />
        <ellipse cx="100" cy="130" rx="35" ry="45" className="fill-primary/15" />
        {/* Thought bubbles */}
        <circle cx="145" cy="45" r="8" className="fill-muted-foreground/20" />
        <circle cx="160" cy="30" r="12" className="fill-muted-foreground/25" />
        <circle cx="175" cy="20" r="6" className="fill-muted-foreground/15" />
        {/* Awareness rings */}
        <circle cx="100" cy="100" r="70" className="fill-none stroke-primary/10" strokeWidth="2" strokeDasharray="8 4" />
        <circle cx="100" cy="100" r="85" className="fill-none stroke-primary/5" strokeWidth="1" strokeDasharray="4 4" />
      </svg>
    </div>
  )
}

function ReflectionIllustration() {
  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-full w-full">
        {/* Journal/Book */}
        <rect x="50" y="70" width="100" height="80" rx="4" className="fill-primary/10" />
        <rect x="55" y="75" width="90" height="70" rx="2" className="fill-card" />
        {/* Lines on page */}
        <line x1="65" y1="90" x2="135" y2="90" className="stroke-muted-foreground/20" strokeWidth="2" />
        <line x1="65" y1="105" x2="125" y2="105" className="stroke-muted-foreground/15" strokeWidth="2" />
        <line x1="65" y1="120" x2="130" y2="120" className="stroke-muted-foreground/15" strokeWidth="2" />
        {/* Pen */}
        <rect x="140" y="60" width="8" height="50" rx="2" className="fill-primary/30" transform="rotate(15 144 85)" />
        {/* Calm waves */}
        <path d="M30 170 Q50 160 70 170 Q90 180 110 170 Q130 160 150 170 Q170 180 190 170" className="fill-none stroke-primary/15" strokeWidth="2" />
        <path d="M20 185 Q40 175 60 185 Q80 195 100 185 Q120 175 140 185 Q160 195 180 185" className="fill-none stroke-primary/10" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

function GrowthIllustration() {
  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-full w-full">
        {/* Pot */}
        <path d="M60 150 L70 180 L130 180 L140 150 Z" className="fill-primary/20" />
        <rect x="55" y="145" width="90" height="10" rx="3" className="fill-primary/25" />
        {/* Soil */}
        <ellipse cx="100" cy="148" rx="35" ry="6" className="fill-primary/10" />
        {/* Plant stem */}
        <path d="M100 145 Q100 100 100 80" className="fill-none stroke-primary/40" strokeWidth="4" strokeLinecap="round" />
        {/* Leaves */}
        <ellipse cx="85" cy="100" rx="20" ry="10" className="fill-primary/30" transform="rotate(-30 85 100)" />
        <ellipse cx="115" cy="90" rx="22" ry="11" className="fill-primary/35" transform="rotate(25 115 90)" />
        <ellipse cx="90" cy="70" rx="18" ry="9" className="fill-primary/40" transform="rotate(-20 90 70)" />
        {/* Small sparkles */}
        <circle cx="50" cy="60" r="3" className="fill-accent/40" />
        <circle cx="150" cy="70" r="2" className="fill-accent/30" />
        <circle cx="160" cy="50" r="2.5" className="fill-accent/35" />
        <circle cx="45" cy="90" r="2" className="fill-accent/25" />
        {/* Rising path */}
        <path d="M30 130 Q50 110 70 115 Q90 120 100 100 Q110 80 130 85 Q150 90 170 60" className="fill-none stroke-primary/15" strokeWidth="2" strokeDasharray="4 3" />
      </svg>
    </div>
  )
}

function PaginationDots({ currentSlide, totalSlides, onDotClick }: { currentSlide: number; totalSlides: number; onDotClick: (index: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`h-2 rounded-full transition-all duration-300 ${
            index === currentSlide
              ? "w-6 bg-primary"
              : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  )
}

export function Onboarding({ onComplete }: { onComplete?: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  const isLastSlide = currentSlide === slides.length - 1

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
  }, [currentSlide])

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setDirection(1)
      setCurrentSlide((prev) => prev + 1)
    }
  }, [currentSlide])

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1)
      setCurrentSlide((prev) => prev - 1)
    }
  }, [currentSlide])

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const swipeThreshold = 50
      if (info.offset.x < -swipeThreshold) {
        nextSlide()
      } else if (info.offset.x > swipeThreshold) {
        prevSlide()
      }
    },
    [nextSlide, prevSlide]
  )

  const handleGetStarted = () => {
    onComplete?.()
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-background px-6 py-12">
      {/* Skip button */}
      <div className="flex w-full max-w-md justify-end">
        {!isLastSlide && (
          <button
            onClick={() => goToSlide(slides.length - 1)}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip
          </button>
        )}
      </div>

      {/* Slide content */}
      <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center">
        <div className="relative h-[400px] w-full overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 flex cursor-grab flex-col items-center justify-center active:cursor-grabbing"
            >
              {/* Illustration */}
              <div className="mb-10">
                {slides[currentSlide].illustration}
              </div>

              {/* Text content */}
              <div className="text-center">
                <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground text-balance">
                  {slides[currentSlide].title}
                </h2>
                <p className="mx-auto max-w-xs text-base leading-relaxed text-muted-foreground text-pretty">
                  {slides[currentSlide].subtitle}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        {/* Pagination dots */}
        <PaginationDots
          currentSlide={currentSlide}
          totalSlides={slides.length}
          onDotClick={goToSlide}
        />

        {/* CTA Button or Next */}
        {isLastSlide ? (
          <Button
            onClick={handleGetStarted}
            className="w-full max-w-xs py-6 text-base font-medium"
          >
            Get Started
          </Button>
        ) : (
          <Button
            onClick={nextSlide}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  )
}

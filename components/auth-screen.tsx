"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AuthMode = "login" | "signup"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

interface AuthScreenProps {
  onComplete?: () => void
}

export function AuthScreen({ onComplete }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isSignUp = mode === "signup"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate auth delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    onComplete?.()
  }

  const handleOAuth = async (provider: "google" | "apple") => {
    setIsLoading(true)
    
    // Simulate OAuth delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    onComplete?.()
  }

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login")
    setPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isSignUp
                  ? "Start your journey to better habits"
                  : "Continue your path to positive change"}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* OAuth Buttons */}
        <div className="mb-6 flex flex-col gap-3">
          <Button
            variant="outline"
            className="h-12 w-full rounded-xl border-border/50 bg-card shadow-sm hover:bg-card/80"
            onClick={() => handleOAuth("google")}
            disabled={isLoading}
          >
            <GoogleIcon />
            <span className="ml-2 text-foreground">Continue with Google</span>
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-xl border-border/50 bg-card shadow-sm hover:bg-card/80"
            onClick={() => handleOAuth("apple")}
            disabled={isLoading}
          >
            <AppleIcon />
            <span className="ml-2 text-foreground">Continue with Apple</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="mb-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-border/50 bg-card px-4 shadow-sm placeholder:text-muted-foreground/60 focus-visible:border-primary/50"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl border-border/50 bg-card px-4 shadow-sm placeholder:text-muted-foreground/60 focus-visible:border-primary/50"
              required
              disabled={isLoading}
            />
          </div>
          <AnimatePresence>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl border-border/50 bg-card px-4 shadow-sm placeholder:text-muted-foreground/60 focus-visible:border-primary/50"
                  required
                  disabled={isLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            type="submit"
            className="mt-2 h-12 w-full rounded-xl text-base font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-5 w-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
              />
            ) : isSignUp ? (
              "Sign Up"
            ) : (
              "Login"
            )}
          </Button>
        </form>

        {/* Toggle Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            disabled={isLoading}
          >
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <span className="font-medium text-primary">Login</span>
              </>
            ) : (
              <>
                {"Don't have an account? "}
                <span className="font-medium text-primary">Sign Up</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

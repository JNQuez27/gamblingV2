"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    router.push(mode === "signup" ? "/preferences" : "/home");
  };

  const handleOAuth = async (provider: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    router.push("/home");
    void provider;
  };

  return (
    <div
      className="app-shell"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(170deg, #e8f4fd 0%, #f0f4f8 60%, #e8f0ee 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ padding: "56px 28px 24px", textAlign: "center" }}>
        {/* Logo mark */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-secondary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 20px rgba(91,155,213,0.3)",
          }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="12" stroke="white" strokeWidth="2" fill="none" />
              <path d="M10 15 Q12.5 10 15 15 Q17.5 20 20 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          {mode === "login" ? "Welcome back" : "Create your space"}
        </h1>
        <p style={{ fontSize: "15px", color: "var(--color-text-muted)", margin: 0 }}>
          {mode === "login"
            ? "Your reflections are waiting for you."
            : "A calm place for self-awareness starts here."}
        </p>
      </div>

      {/* Card */}
      <div style={{
        flex: 1,
        background: "#ffffff",
        borderRadius: "28px 28px 0 0",
        padding: "32px 28px 40px",
        boxShadow: "0 -4px 30px rgba(0,0,0,0.06)",
      }}>
        {/* Mode toggle */}
        <div style={{
          display: "flex",
          background: "var(--color-bg)",
          borderRadius: "14px",
          padding: "4px",
          marginBottom: "28px",
        }}>
          {(["login", "signup"] as AuthMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: "11px",
                borderRadius: "10px",
                border: "none",
                background: mode === m ? "#ffffff" : "transparent",
                color: mode === m ? "var(--color-text)" : "var(--color-text-muted)",
                fontSize: "14px",
                fontWeight: mode === m ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.25s",
                boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* OAuth Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          <button
            onClick={() => handleOAuth("google")}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "1.5px solid var(--color-border)",
              background: "#ffffff",
              color: "var(--color-text)",
              fontSize: "15px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuth("apple")}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "none",
              background: "#111111",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <svg width="18" height="20" viewBox="0 0 814 1000" fill="white">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-47.9-162.9-127.7C67.3 752 30.2 650.4 30.2 553.9c0-138.8 90.2-212 176.1-212 61.6 0 107.3 43.3 168.9 43.3 59.4 0 112.9-47.9 175.8-47.9 67.6.1 147 48.6 237.1 203.6zm-174.7-171.6c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
          <span style={{ fontSize: "13px", color: "var(--color-text-light)" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {mode === "signup" && (
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "6px", letterSpacing: "0.03em" }}>
                FULL NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required={mode === "signup"}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid var(--color-border)",
                  background: "var(--color-bg)",
                  fontSize: "15px",
                  color: "var(--color-text)",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "6px", letterSpacing: "0.03em" }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1.5px solid var(--color-border)",
                background: "var(--color-bg)",
                fontSize: "15px",
                color: "var(--color-text)",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.03em" }}>
                PASSWORD
              </label>
              {mode === "login" && (
                <Link href="#" style={{ fontSize: "12px", color: "var(--color-primary)", textDecoration: "none" }}>
                  Forgot?
                </Link>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1.5px solid var(--color-border)",
                background: "var(--color-bg)",
                fontSize: "15px",
                color: "var(--color-text)",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "17px",
              borderRadius: "14px",
              background: loading
                ? "var(--color-primary-light)"
                : "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 600,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 8px 24px rgba(58,125,191,0.3)",
              transition: "all 0.25s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "white",
                  animation: "spin 0.8s linear infinite",
                  display: "inline-block",
                }} />
                Please wait...
              </>
            ) : (
              mode === "login" ? "Log In" : "Create Account"
            )}
          </button>
        </form>

        {mode === "signup" && (
          <p style={{ textAlign: "center", fontSize: "12px", color: "var(--color-text-light)", marginTop: "20px", lineHeight: 1.6 }}>
            By continuing, you agree to our{" "}
            <Link href="#" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Terms</Link>
            {" "}and{" "}
            <Link href="#" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Privacy Policy</Link>.
          </p>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

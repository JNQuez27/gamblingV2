"use client";

import { useState } from "react";
import BackHeader from "../components/BackHeader";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "12px",
      fontWeight: 700,
      color: "var(--color-text-muted)",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      margin: "0 0 10px",
      paddingLeft: "4px",
    }}>
      {children}
    </p>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────

type FAQ = { q: string; a: string };

const faqs: FAQ[] = [
  { q: "How do I track my spending?", a: "Go to the Tracker tab and tap the '+' button. You can add a commodity, set the quantity, and log the date. Your entries appear on the timeline and in your weekly summary." },
  { q: "What is the Commodity Library?", a: "It's a curated list of common items you spend on — from groceries to subscriptions. You can also add custom items to fit your lifestyle." },
  { q: "How are my streaks calculated?", a: "A streak grows every day you log at least one mindful reflection or check-in. Missing a day resets your streak, but your history is never lost." },
  { q: "Is my data private and secure?", a: "Yes. Your data is encrypted and never sold. You can export or delete it at any time from Settings → Export Data or Delete Account." },
  { q: "Can I use this app offline?", a: "Basic logging works offline. Your data syncs automatically once you're back online." },
  { q: "How do I reset my progress?", a: "We don't have a one-tap reset to protect you from accidents. To start fresh, you can delete your account and create a new one, or reach out to support and we'll help." },
];

function FAQItem({ faq, last }: { faq: FAQ; last: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: last ? "none" : "1px solid var(--color-border)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: "12px" }}
      >
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--color-text)", lineHeight: "1.4" }}>{faq.q}</p>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: "0 16px 14px" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-muted)", lineHeight: "1.6" }}>{faq.a}</p>
        </div>
      )}
    </div>
  );
}

// ─── MAUQ Survey ───────────────────────────────────────────────────────────

const MAUQ_QUESTIONS = [
  "The app was easy to use.",
  "It was easy for me to learn to use the app.",
  "The navigation was consistent when moving between screens.",
  "The interface of the app allowed me to use all the functions (such as entering information, responding to reminders, viewing information) offered by the app.",
  "Whenever I made a mistake using the app, I could recover easily and quickly.",
  "I like the interface of the app.",
  "The information in the app was well organized, so I could easily find the information I needed.",
  "The app adequately acknowledged and provided information to let me know the progress of my action.",
  "I feel comfortable using this app in social settings.",
  "The amount of time involved in using this app has been fitting for me.",
  "I would use this app again.",
  "Overall, I am satisfied with this app.",
  "The app would be useful for my health and well-being.",
  "The app improved my access to healthcare services.",
  "The app helped me manage my health effectively.",
  "This app has all the functions and capabilities I expected it to have.",
  "I could use the app even when the Internet connection was poor or not available.",
  "This mHealth app provides an acceptable way to receive healthcare services, such as accessing educational materials, tracking my own activities, and performing self-assessment.",
];

const LIKERT_LABELS = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
const LIKERT_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];
const LIKERT_BG    = ["#fef2f2", "#fff7ed", "#fefce8", "#f7fee7", "#f0fdf4"];

const DOMAINS = [
  { label: "Ease of Use & Learnability", indices: [0, 1, 2, 3, 4] },
  { label: "Interface & Satisfaction",   indices: [5, 6, 7, 8, 9, 10, 11] },
  { label: "Health Impact",              indices: [12, 13, 14] },
  { label: "App Capabilities",           indices: [15, 16, 17] },
];

function MAUQSurvey({ onClose }: { onClose: () => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(18).fill(null));
  const [current, setCurrent] = useState(0);
  const [done, setDone]       = useState(false);

  const answer   = answers[current];
  const answered = answers.filter((a) => a !== null).length;

  const selectAnswer = (val: number) => {
    setAnswers((prev) => { const next = [...prev]; next[current] = val; return next; });
  };

  const goNext = () => {
    if (current < 17) {
      const nextUnanswered = answers.findIndex((a, i) => i > current && a === null);
      setCurrent(nextUnanswered !== -1 ? nextUnanswered : current + 1);
    } else {
      setDone(true);
    }
  };

  const goPrev = () => { if (current > 0) setCurrent(current - 1); };

  const totalScore = answers.reduce<number>((sum, a) => sum + (a !== null ? a + 1 : 0), 0);
  const maxScore   = 18 * 5;
  const pct        = Math.round((totalScore / maxScore) * 100);
  const allAnswered = answers.every((a) => a !== null);

  const getScoreLabel = () => {
    if (pct >= 85) return { label: "Excellent",          color: "#16a34a", emoji: "🌟" };
    if (pct >= 70) return { label: "Good",               color: "#65a30d", emoji: "👍" };
    if (pct >= 55) return { label: "Fair",               color: "#d97706", emoji: "😐" };
    return              { label: "Needs Improvement",   color: "#dc2626", emoji: "⚠️" };
  };

  // ── Results screen ──
  if (done) {
    const sl = getScoreLabel();
    return (
      <div style={{ padding: "0 24px 40px" }}>

        {/* Score card */}
        <div style={{ background: "var(--color-bg-card)", borderRadius: "20px", padding: "28px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>{sl.emoji}</div>
          <p style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>MAUQ Score</p>
          <p style={{ margin: "0 0 6px", fontSize: "44px", fontWeight: 800, color: sl.color, letterSpacing: "-0.03em" }}>
            {totalScore}<span style={{ fontSize: "18px", color: "var(--color-text-muted)", fontWeight: 500 }}>/{maxScore}</span>
          </p>
          <div style={{ background: "var(--color-border)", borderRadius: "6px", height: "8px", margin: "0 auto 10px", width: "180px" }}>
            <div style={{ height: "100%", borderRadius: "6px", background: sl.color, width: `${pct}%`, transition: "width 0.6s ease" }} />
          </div>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: sl.color }}>{sl.label} — {pct}%</p>
        </div>

        {/* Domain breakdown */}
        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px 4px" }}>Breakdown by Domain</p>
        <div style={{ background: "var(--color-bg-card)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", marginBottom: "20px" }}>
          {DOMAINS.map((domain, di) => {
            const domainScore = domain.indices.reduce((s, i) => s + (answers[i] !== null ? (answers[i] as number) + 1 : 0), 0);
            const domainMax   = domain.indices.length * 5;
            const dPct        = Math.round((domainScore / domainMax) * 100);
            const barColor    = dPct >= 80 ? "#22c55e" : dPct >= 60 ? "#84cc16" : dPct >= 40 ? "#eab308" : "#ef4444";
            return (
              <div key={di} style={{ padding: "14px 16px", borderBottom: di < DOMAINS.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--color-text)" }}>{domain.label}</p>
                  <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: barColor }}>{dPct}%</p>
                </div>
                <div style={{ background: "var(--color-border)", borderRadius: "4px", height: "6px" }}>
                  <div style={{ height: "100%", borderRadius: "4px", background: barColor, width: `${dPct}%`, transition: "width 0.5s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={onClose} style={{ width: "100%", padding: "15px", borderRadius: "14px", background: "var(--color-secondary)", color: "white", fontSize: "15px", fontWeight: 700, border: "none", cursor: "pointer" }}>
          Done
        </button>
      </div>
    );
  }

  // ── Question screen ──
  return (
    <div style={{ padding: "0 24px 40px" }}>

      {/* Progress */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)" }}>Question {current + 1} of {MAUQ_QUESTIONS.length}</p>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--color-secondary)" }}>{answered} answered</p>
        </div>
        <div style={{ background: "var(--color-border)", borderRadius: "6px", height: "6px" }}>
          <div style={{ height: "100%", borderRadius: "6px", background: "var(--color-secondary)", width: `${(answered / 18) * 100}%`, transition: "width 0.3s ease" }} />
        </div>
      </div>

      {/* Question card */}
      <div style={{ background: "var(--color-bg-card)", borderRadius: "20px", padding: "24px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "16px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #e8f4fd, #c8e8e0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800, color: "var(--color-secondary)", marginBottom: "14px" }}>
          {current + 1}
        </div>
        <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--color-text)", lineHeight: "1.55" }}>
          {MAUQ_QUESTIONS[current]}
        </p>
      </div>

      {/* Likert options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
        {LIKERT_LABELS.map((label, i) => {
          const selected = answer === i;
          return (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "13px 16px", borderRadius: "14px",
                border: `2px solid ${selected ? LIKERT_COLORS[i] : "var(--color-border)"}`,
                background: selected ? LIKERT_BG[i] : "var(--color-bg-card)",
                cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              }}
            >
              {/* Radio circle */}
              <div style={{
                width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${selected ? LIKERT_COLORS[i] : "var(--color-border)"}`,
                background: selected ? LIKERT_COLORS[i] : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {selected && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: selected ? 700 : 500, color: selected ? LIKERT_COLORS[i] : "var(--color-text)", flex: 1 }}>
                {label}
              </p>
              <span style={{
                fontSize: "11px", fontWeight: 700, flexShrink: 0,
                color: selected ? LIKERT_COLORS[i] : "var(--color-text-muted)",
                background: selected ? LIKERT_BG[i] : "var(--color-bg)",
                border: `1px solid ${selected ? LIKERT_COLORS[i] : "var(--color-border)"}`,
                borderRadius: "20px", padding: "2px 8px",
              }}>
                {i + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={goPrev}
          disabled={current === 0}
          style={{
            flex: "0 0 50px", height: "50px", borderRadius: "14px",
            background: current === 0 ? "var(--color-border)" : "var(--color-bg-card)",
            border: "1.5px solid var(--color-border)",
            color: current === 0 ? "var(--color-text-muted)" : "var(--color-text)",
            cursor: current === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          onClick={goNext}
          disabled={answer === null}
          style={{
            flex: 1, height: "50px", borderRadius: "14px",
            background: answer !== null ? "var(--color-secondary)" : "var(--color-border)",
            color: "white", fontSize: "15px", fontWeight: 700,
            border: "none", cursor: answer !== null ? "pointer" : "not-allowed",
            transition: "background 0.2s",
          }}
        >
          {current === 17 ? (allAnswered ? "Submit Survey ✓" : "Next Unanswered") : "Next →"}
        </button>
      </div>

      {/* Dot navigator */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "16px", justifyContent: "center" }}>
        {MAUQ_QUESTIONS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            title={`Question ${i + 1}`}
            style={{
              width: "10px", height: "10px", borderRadius: "50%", border: "none", padding: 0, cursor: "pointer",
              background: i === current ? "var(--color-secondary)" : answers[i] !== null ? "#86efac" : "var(--color-border)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Feedback Form ─────────────────────────────────────────────────────────

const FEEDBACK_CATEGORIES = ["Bug Report", "Feature Request", "General Feedback", "Billing", "Other"];
const EMOJI_RATINGS = ["😞", "😕", "😐", "😊", "🤩"];

function FeedbackForm() {
  const [feedback, setFeedback] = useState({ category: "", rating: -1, message: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!feedback.message.trim()) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1000);
  };

  if (submitted) {
    return (
      <div style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1.5px solid #bbf7d0", borderRadius: "20px", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#15803d", margin: "0 0 8px" }}>Thanks for your feedback!</h3>
        <p style={{ fontSize: "13px", color: "#16a34a", margin: 0, lineHeight: "1.5" }}>We read every message and use it to make the app better for everyone.</p>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-bg-card)", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>

      {/* Emoji rating */}
      <div style={{ marginBottom: "18px" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 10px" }}>How&apos;s your experience with Reflect?</p>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {EMOJI_RATINGS.map((emoji, i) => (
            <button key={i} onClick={() => setFeedback((f) => ({ ...f, rating: i }))}
              style={{ fontSize: "28px", background: feedback.rating === i ? "var(--color-bg)" : "none", border: feedback.rating === i ? "2px solid var(--color-secondary)" : "2px solid transparent", borderRadius: "12px", width: "48px", height: "48px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transform: feedback.rating === i ? "scale(1.15)" : "scale(1)", transition: "all 0.15s" }}
            >{emoji}</button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div style={{ marginBottom: "18px" }}>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>Category</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {FEEDBACK_CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setFeedback((f) => ({ ...f, category: cat }))}
              style={{ padding: "7px 13px", borderRadius: "20px", border: "1.5px solid", borderColor: feedback.category === cat ? "var(--color-secondary)" : "var(--color-border)", background: feedback.category === cat ? "var(--color-secondary)" : "var(--color-bg)", color: feedback.category === cat ? "white" : "var(--color-text-muted)", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div style={{ marginBottom: "18px" }}>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>Your Message</label>
        <textarea
          value={feedback.message}
          onChange={(e) => setFeedback((f) => ({ ...f, message: e.target.value }))}
          placeholder="Tell us what's on your mind — bugs, ideas, or anything else..."
          rows={4}
          style={{ width: "100%", padding: "13px 14px", borderRadius: "12px", border: "1.5px solid var(--color-border)", background: "var(--color-bg)", fontSize: "14px", color: "var(--color-text)", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: "1.5" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-secondary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
          Email <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional — for follow-up)</span>
        </label>
        <input type="email" value={feedback.email} onChange={(e) => setFeedback((f) => ({ ...f, email: e.target.value }))} placeholder="your@email.com"
          style={{ width: "100%", padding: "13px 14px", borderRadius: "12px", border: "1.5px solid var(--color-border)", background: "var(--color-bg)", fontSize: "14px", color: "var(--color-text)", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-secondary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!feedback.message.trim() || submitting}
        style={{ width: "100%", padding: "15px", borderRadius: "14px", background: feedback.message.trim() ? "var(--color-secondary)" : "var(--color-border)", color: "white", fontSize: "15px", fontWeight: 700, border: "none", cursor: feedback.message.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.2s" }}
      >
        {submitting ? "Sending..." : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Send Feedback
          </>
        )}
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function HelpSupportPage() {
  const [search, setSearch]       = useState("");
  const [showSurvey, setShowSurvey] = useState(false);

  const filteredFaqs = faqs.filter(
    (f) => search.trim() === "" || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-shell" style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "40px" }}>

        <BackHeader title="Help & Support" subtitle="We're here to help" />

        {/* ── MAUQ Survey view ── */}
        {showSurvey ? (
          <>
            <div style={{ padding: "24px 24px 16px" }}>
              <div style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", borderRadius: "16px", padding: "16px 18px", marginBottom: "4px" }}>
                <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#1d4ed8" }}>📋 MAUQ Usability Survey</p>
                <p style={{ margin: 0, fontSize: "13px", color: "#3b82f6", lineHeight: "1.5" }}>
                  Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree). You can go back and change answers anytime.
                </p>
              </div>
            </div>
            <MAUQSurvey onClose={() => setShowSurvey(false)} />
          </>
        ) : (

          /* ── Main help view ── */
          <div style={{ padding: "24px" }}>

            {/* Quick action cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
              <button
                onClick={() => setShowSurvey(true)}
                style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "16px", padding: "16px", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <span style={{ fontSize: "24px" }}>📋</span>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--color-text)" }}>Rate the App</p>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--color-text-muted)" }}>MAUQ Usability Survey</p>
              </button>

              <button style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "16px", padding: "16px", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "24px" }}>📧</span>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--color-text)" }}>Email Us</p>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--color-text-muted)" }}>support@reflect.app</p>
              </button>
            </div>

            {/* FAQs */}
            <SectionHeader>Frequently Asked Questions</SectionHeader>
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <svg style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search FAQs..."
                style={{ width: "100%", padding: "11px 14px 11px 38px", borderRadius: "12px", border: "1.5px solid var(--color-border)", background: "var(--color-bg-card)", fontSize: "14px", color: "var(--color-text)", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-secondary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>

            <div style={{ background: "var(--color-bg-card)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", marginBottom: "28px" }}>
              {filteredFaqs.length > 0
                ? filteredFaqs.map((f, i) => <FAQItem key={i} faq={f} last={i === filteredFaqs.length - 1} />)
                : <div style={{ padding: "28px 16px", textAlign: "center" }}><p style={{ fontSize: "14px", color: "var(--color-text-muted)", margin: 0 }}>No results for &ldquo;{search}&rdquo;</p></div>}
            </div>

            {/* Feedback form */}
            <SectionHeader>Send Feedback</SectionHeader>
            <FeedbackForm />
          </div>
        )}
      </div>
    </div>
  );
}
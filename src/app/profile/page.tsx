"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/ui/BottomNav";

// ─── Data ────────────────────────────────────────────────────────────────────

const achievements = [
  {
    icon: "🔥", label: "3-Day Streak", desc: "3 days in a row",
    unlocked: true, progress: 3, goal: 3, color: "#fef3c7", accent: "#f59e0b",
  },
  {
    icon: "🌱", label: "First Reflection", desc: "Wrote your first diary entry",
    unlocked: true, progress: 1, goal: 1, color: "#dcfce7", accent: "#22c55e",
  },
  {
    icon: "🧘", label: "Mindful Week", desc: "7 consecutive pauses",
    unlocked: false, progress: 3, goal: 7, color: "#eff6ff", accent: "#3b82f6",
  },
  {
    icon: "🌟", label: "30-Day Champ", desc: "Complete 30-day streak",
    unlocked: false, progress: 3, goal: 30, color: "#fdf4ff", accent: "#a855f7",
  },
  {
    icon: "💎", label: "Deep Thinker", desc: "Write 10 diary entries",
    unlocked: false, progress: 7, goal: 10, color: "#ecfeff", accent: "#06b6d4",
  },
  {
    icon: "🏔️", label: "Peak Aware", desc: "Log 50 pauses",
    unlocked: false, progress: 24, goal: 50, color: "#fff7ed", accent: "#f97316",
  },
];

const statCards = [
  { label: "Current Streak", value: "3", unit: "days", icon: "🔥", color: "#fef3c7", border: "#fde68a", text: "#92400e" },
  { label: "Total Pauses", value: "24", unit: "logged", icon: "✋", color: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
  { label: "Diary Entries", value: "7", unit: "written", icon: "📓", color: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
  { label: "Best Streak", value: "5", unit: "days", icon: "🏆", color: "#fdf4ff", border: "#e9d5ff", text: "#6b21a8" },
];

// Mock analytics data
const weeklySpending = [
  { day: "Mon", amount: 320 },
  { day: "Tue", amount: 150 },
  { day: "Wed", amount: 480 },
  { day: "Thu", amount: 90 },
  { day: "Fri", amount: 560 },
  { day: "Sat", amount: 210 },
  { day: "Sun", amount: 70 },
];

const moodHistory = [
  { day: "Mon", score: 2 },
  { day: "Tue", score: 3 },
  { day: "Wed", score: 2 },
  { day: "Thu", score: 4 },
  { day: "Fri", score: 3 },
  { day: "Sat", score: 4 },
  { day: "Sun", score: 5 },
];

const spendingCategories = [
  { label: "Gambling", amount: 560, color: "#f87171" },
  { label: "Food", amount: 320, color: "#34d399" },
  { label: "Transport", amount: 150, color: "#60a5fa" },
  { label: "Entertainment", amount: 210, color: "#a78bfa" },
  { label: "Others", amount: 90, color: "#fbbf24" },
];

const RESOURCES = [
  {
    category: "Crisis Support", emoji: "🆘", accent: "#ef4444",
    items: [
      { name: "National Problem Gambling Helpline", desc: "24/7 confidential support", contact: "1-800-522-4700", link: "tel:1-800-522-4700" },
      { name: "Crisis Text Line", desc: "Text HOME to 741741", contact: "Text HOME to 741741", link: "sms:741741?body=HOME" },
    ],
  },
  {
    category: "Support Groups", emoji: "🤝", accent: "#3b82f6",
    items: [
      { name: "Gamblers Anonymous", desc: "Peer-led support groups nationwide", contact: "gamblersanonymous.org", link: "https://www.gamblersanonymous.org" },
      { name: "SMART Recovery", desc: "Science-based self-empowerment", contact: "smartrecovery.org", link: "https://www.smartrecovery.org" },
    ],
  },
  {
    category: "Mental Health Care", emoji: "💙", accent: "#ec4899",
    items: [
      { name: "SAMHSA National Helpline", desc: "Free referral & info service", contact: "1-800-662-4357", link: "tel:1-800-662-4357" },
      { name: "BetterHelp Online Therapy", desc: "Affordable online counseling", contact: "betterhelp.com", link: "https://www.betterhelp.com" },
    ],
  },
  {
    category: "Education & Resources", emoji: "📚", accent: "#8b5cf6",
    items: [
      { name: "Stop It Now", desc: "Evidence-based gambling resources", contact: "stopitnow.org", link: "https://www.stopitnow.org" },
      { name: "Council on Problem Gambling", desc: "Prevention & education programs", contact: "ncpg.org", link: "https://www.ncpg.org" },
    ],
  },
];

// ─── SVG Charts ──────────────────────────────────────────────────────────────

function BarChart() {
  const max = Math.max(...weeklySpending.map((d) => d.amount));
  const W = 300, H = 120, barW = 30, gap = 12;
  const totalW = weeklySpending.length * (barW + gap) - gap;
  const offsetX = (W - totalW) / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width: "100%", overflow: "visible" }}>
      {weeklySpending.map((d, i) => {
        const barH = (d.amount / max) * H;
        const x = offsetX + i * (barW + gap);
        const y = H - barH;
        const isHighest = d.amount === max;
        return (
          <g key={d.day}>
            <rect
              x={x} y={y} width={barW} height={barH}
              rx={6}
              fill={isHighest ? "#f87171" : "url(#barGrad)"}
              opacity={isHighest ? 1 : 0.85}
            />
            <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize={10} fill="#9ca3af">{d.day}</text>
            {isHighest && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={9} fill="#f87171" fontWeight={700}>
                ₱{d.amount}
              </text>
            )}
          </g>
        );
      })}
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b9bd5" />
          <stop offset="100%" stopColor="#7ab89a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LineChart() {
  const W = 300, H = 100;
  const minScore = 1, maxScore = 5;
  const days = moodHistory.length;
  const xStep = W / (days - 1);

  const points = moodHistory.map((d, i) => ({
    x: i * xStep,
    y: H - ((d.score - minScore) / (maxScore - minScore)) * H,
    day: d.day,
    score: d.score,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  const moodLabels: Record<number, string> = { 1: "😞", 2: "😟", 3: "😐", 4: "🙂", 5: "😊" };

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} style={{ width: "100%", overflow: "visible" }}>
      <defs>
        <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ab89a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7ab89a" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon
        points={`0,${H} ${polyline} ${W},${H}`}
        fill="url(#lineAreaGrad)"
      />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#7ab89a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots + labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#7ab89a" stroke="white" strokeWidth={1.5} />
          <text x={p.x} y={H + 14} textAnchor="middle" fontSize={10} fill="#9ca3af">{p.day}</text>
          {(i === 0 || i === days - 1 || moodHistory[i].score >= 4) && (
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize={13}>{moodLabels[p.score]}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

function PieChart() {
  const total = spendingCategories.reduce((s, c) => s + c.amount, 0);
  const cx = 80, cy = 80, r = 65;

  const slices = spendingCategories.reduce(
    (acc, cat) => {
      const angle = (cat.amount / total) * 2 * Math.PI;
      const x1 = cx + r * Math.cos(acc.startAngle);
      const y1 = cy + r * Math.sin(acc.startAngle);
      const endAngle = acc.startAngle + angle;
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const large = angle > Math.PI ? 1 : 0;
      const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
      const midAngle = acc.startAngle + angle / 2;
      const labelR = r * 0.65;
      const lx = cx + labelR * Math.cos(midAngle);
      const ly = cy + labelR * Math.sin(midAngle);
      acc.items.push({ ...cat, path, lx, ly, pct: Math.round((cat.amount / total) * 100) });
      return { startAngle: endAngle, items: acc.items };
    },
    {
      startAngle: -Math.PI / 2,
      items: [] as Array<(typeof spendingCategories)[number] & {
        path: string;
        lx: number;
        ly: number;
        pct: number;
      }>,
    }
  ).items;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <svg viewBox="0 0 160 160" style={{ width: "160px", flexShrink: 0 }}>
        {slices.map((s, i) => (
          <g key={i}>
            <path d={s.path} fill={s.color} stroke="white" strokeWidth={2} />
            {s.pct >= 10 && (
              <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="white" fontWeight={700}>
                {s.pct}%
              </text>
            )}
          </g>
        ))}
        <circle cx={cx} cy={cy} r={28} fill="white" />
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize={8} fill="#6b7280">Total</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize={10} fill="#1f2937" fontWeight={700}>₱{total.toLocaleString()}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#374151", flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280" }}>₱{s.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab Content ─────────────────────────────────────────────────────────────

function ProgressTab() {
  return (
    <div style={{ padding: "20px 20px 0" }}>
      {/* Stat Cards */}
      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px" }}>
        Your Progress
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "28px" }}>
        {statCards.map((stat) => (
          <div key={stat.label} style={{
            background: stat.color,
            border: `1.5px solid ${stat.border}`,
            borderRadius: "18px",
            padding: "16px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>{stat.icon}</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: stat.text, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: "11px", color: stat.text, opacity: 0.65, marginTop: "2px" }}>{stat.unit}</div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", marginTop: "5px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>
        Achievements
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {achievements.map((badge) => {
          const pct = Math.min((badge.progress / badge.goal) * 100, 100);
          return (
            <div key={badge.label} style={{
              background: badge.unlocked ? badge.color : "#f9fafb",
              border: `1.5px solid ${badge.unlocked ? badge.accent + "55" : "#e5e7eb"}`,
              borderRadius: "16px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              opacity: badge.unlocked ? 1 : 0.75,
            }}>
              {/* Icon bubble */}
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: badge.unlocked ? badge.accent + "22" : "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                flexShrink: 0,
                filter: badge.unlocked ? "none" : "grayscale(0.6)",
              }}>
                {badge.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text)" }}>{badge.label}</span>
                  {badge.unlocked ? (
                    <span style={{
                      fontSize: "10px", fontWeight: 700,
                      background: badge.accent + "22", color: badge.accent,
                      borderRadius: "20px", padding: "2px 8px",
                    }}>Unlocked ✓</span>
                  ) : (
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600 }}>
                      {badge.progress}/{badge.goal}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: "0 0 8px", lineHeight: 1.4 }}>{badge.desc}</p>
                {/* Progress bar */}
                <div style={{ height: "5px", borderRadius: "99px", background: "#e5e7eb", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: "99px",
                    background: badge.unlocked
                      ? `linear-gradient(90deg, ${badge.accent}, ${badge.accent}cc)`
                      : `linear-gradient(90deg, ${badge.accent}88, ${badge.accent}44)`,
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: "24px" }} />
    </div>
  );
}

function AnalyticsTab() {
  const chartCard = (title: string, emoji: string, children: React.ReactNode) => (
    <div style={{
      background: "var(--color-bg-card)",
      borderRadius: "20px",
      padding: "18px",
      marginBottom: "14px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      border: "1px solid var(--color-border)",
    }}>
      <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "6px" }}>
        <span>{emoji}</span> {title}
      </h4>
      {children}
    </div>
  );

  return (
    <div style={{ padding: "20px 20px 0" }}>
      {chartCard("Weekly Spending", "📊",
        <>
          <BarChart />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Total this week</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#f87171" }}>
              ₱{weeklySpending.reduce((s, d) => s + d.amount, 0).toLocaleString()}
            </span>
          </div>
        </>
      )}

      {chartCard("Mood Tracker", "💭",
        <>
          <div style={{ display: "flex", gap: "16px", marginBottom: "10px" }}>
            {[{ score: 1, emoji: "😞" }, { score: 3, emoji: "😐" }, { score: 5, emoji: "😊" }].map(({ score, emoji }) => (
              <div key={score} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "13px" }}>{emoji}</span>
                <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>{score === 1 ? "Low" : score === 3 ? "Neutral" : "High"}</span>
              </div>
            ))}
          </div>
          <LineChart />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Average this week</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#7ab89a" }}>
              {(moodHistory.reduce((s, d) => s + d.score, 0) / moodHistory.length).toFixed(1)} / 5
            </span>
          </div>
        </>
      )}

      {chartCard("Spending Categories", "🗂️", <PieChart />)}

      <div style={{ height: "24px" }} />
    </div>
  );
}

function ResourcesTab() {
  return (
    <div style={{ padding: "20px 20px 0" }}>
      {/* Emergency card */}
      <div style={{
        background: "linear-gradient(135deg, #fef2f2, #fff1f2)",
        border: "2px solid #fecaca",
        borderRadius: "20px",
        padding: "18px",
        marginBottom: "18px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <span style={{ fontSize: "24px" }}>🆘</span>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#991b1b" }}>In Crisis? Call Now</div>
            <div style={{ fontSize: "11px", color: "#dc2626" }}>Immediate help available 24/7</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {[{ label: "Call 988", href: "tel:988" }, { label: "Call 911", href: "tel:911" }].map(({ label, href }) => (
            <a key={label} href={href} style={{ flex: 1 }}>
              <div style={{
                background: "#dc2626",
                color: "white",
                borderRadius: "12px",
                padding: "10px",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: 700,
              }}>{label}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Resource sections */}
      {RESOURCES.map((section) => (
        <div key={section.category} style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <span style={{ fontSize: "18px" }}>{section.emoji}</span>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>{section.category}</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {section.items.map((item) => (
              <a key={item.name} href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={{
                  background: "var(--color-bg-card)",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", marginBottom: "2px" }}>{item.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "5px" }}>{item.desc}</div>
                    <div style={{
                      display: "inline-block",
                      background: section.accent + "15",
                      color: section.accent,
                      borderRadius: "8px",
                      padding: "2px 8px",
                      fontSize: "10px",
                      fontWeight: 600,
                    }}>{item.contact}</div>
                  </div>
                  <div style={{
                    width: "32px", height: "32px",
                    borderRadius: "10px",
                    background: section.accent + "15",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={section.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}

      {/* Self-Exclusion */}
      <div style={{
        background: "var(--color-bg-card)",
        border: "1.5px solid var(--color-secondary-light)",
        borderRadius: "18px",
        padding: "16px",
        marginBottom: "24px",
      }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text)", marginBottom: "4px" }}>🚫 Self-Exclusion Programs</div>
        <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "12px", lineHeight: 1.5 }}>
          Block yourself from gambling sites — one of the most effective steps.
        </div>
        {[
          { label: "National Council on Problem Gambling", href: "https://www.ncpg.org" },
          { label: "Gamban - Blocking Software", href: "https://www.gamban.com" },
        ].map(({ label, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--color-text)",
            }}>
              {label}
              <span style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>→</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "progress" | "analytics" | "resources";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("progress");

  const tabs: { id: Tab; label: string }[] = [
    { id: "progress", label: "Progress" },
    { id: "analytics", label: "Analytics" },
    { id: "resources", label: "Resources" },
  ];

  return (
    <div className="app-shell" style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "100px" }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(160deg, #e8f4fd 0%, #d4eaf7 50%, #c8e8e0 100%)",
          padding: "56px 24px 24px",
          textAlign: "center",
          borderRadius: "0 0 28px 28px",
        }}>
          {/* Settings icon */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <Link href="/settings">
              <button style={{
                background: "rgba(255,255,255,0.6)", border: "none", borderRadius: "50%",
                width: "40px", height: "40px", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </Link>
          </div>

          {/* Avatar */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <div style={{
                width: "76px", height: "76px", borderRadius: "50%",
                background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "30px", fontWeight: 700, color: "white",
                boxShadow: "0 6px 20px rgba(91,155,213,0.35)", border: "3px solid white",
              }}>J</div>
              <div style={{
                position: "absolute", bottom: "2px", right: "2px",
                width: "22px", height: "22px", borderRadius: "50%",
                background: "var(--color-secondary)", border: "2px solid white",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "10px" }}>✓</span>
              </div>
            </div>
          </div>

          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 3px" }}>Juan Rivera</h1>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "0 0 8px" }}>juan@example.com</p>
          <span style={{
            display: "inline-block", background: "rgba(91,155,213,0.15)",
            color: "var(--color-primary-dark)", borderRadius: "20px",
            padding: "3px 12px", fontSize: "11px", fontWeight: 600,
          }}>Member since Jan 2026</span>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          margin: "20px 20px 0",
          background: "#f1f5f9",
          borderRadius: "14px",
          padding: "4px",
          gap: "2px",
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "9px 0",
                border: "none",
                borderRadius: "11px",
                fontSize: "13px",
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: activeTab === tab.id
                  ? "white"
                  : "transparent",
                color: activeTab === tab.id
                  ? "var(--color-primary-dark)"
                  : "var(--color-text-muted)",
                boxShadow: activeTab === tab.id
                  ? "0 2px 8px rgba(0,0,0,0.1)"
                  : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "progress" && <ProgressTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "resources" && <ResourcesTab />}
      </div>

      <BottomNav />
    </div>
  );
}
"use client";

import { useState } from "react";
import type { ElementType } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Dumbbell,
  PiggyBank,
  HeartPulse,
  CheckSquare,
  Users,
  Moon,
  Apple,
  BookOpen,
  Smile,
} from "lucide-react";

type Interest = {
  id: string;
  label: string;
  icon: ElementType;
  tint: string;
  iconColor: string;
};

const INTERESTS: Interest[] = [
  { id: "mindfulness", label: "Mindfulness", icon: Sparkles, tint: "#e7f3ff", iconColor: "#3a7dbf" },
  { id: "fitness", label: "Fitness", icon: Dumbbell, tint: "#eef9f1", iconColor: "#22a06b" },
  { id: "finance", label: "Finance", icon: PiggyBank, tint: "#fff4e6", iconColor: "#d97706" },
  { id: "health", label: "Health", icon: HeartPulse, tint: "#ffecec", iconColor: "#ef4444" },
  { id: "productivity", label: "Productivity", icon: CheckSquare, tint: "#eef2ff", iconColor: "#4f46e5" },
  { id: "relationships", label: "Relationships", icon: Users, tint: "#f1f5f9", iconColor: "#0f172a" },
  { id: "sleep", label: "Sleep", icon: Moon, tint: "#f3f0ff", iconColor: "#7c3aed" },
  { id: "nutrition", label: "Nutrition", icon: Apple, tint: "#ecfeff", iconColor: "#0ea5e9" },
  { id: "journaling", label: "Journaling", icon: BookOpen, tint: "#fff7ed", iconColor: "#ea580c" },
  { id: "selfcare", label: "Self-Care", icon: Smile, tint: "#fdf2f8", iconColor: "#db2777" },
];

export default function PreferencesPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  const toggleInterest = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleContinue = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user-preferences", JSON.stringify(selected));
    }
    router.push("/home");
  };

  return (
    <div
      className="app-shell"
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(60% 50% at 20% 10%, rgba(91,155,213,0.18) 0%, transparent 60%), radial-gradient(60% 50% at 90% 20%, rgba(122,184,154,0.2) 0%, transparent 60%), linear-gradient(180deg, #eef6fb 0%, #f7fafc 45%, #e8f0ee 100%)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div style={{ padding: "56px 24px 12px", animation: "riseIn 0.6s ease both" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.9)",
            borderRadius: "999px",
            padding: "6px 12px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            boxShadow: "0 6px 20px rgba(15,23,42,0.08)",
            marginBottom: "14px",
          }}
        >
          Personalize
        </div>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: "var(--color-text)",
            margin: "0 0 8px",
            letterSpacing: "-0.02em",
          }}
        >
          What are you interested in?
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", margin: 0, maxWidth: "320px" }}>
          Choose a few to shape your daily reflections and suggestions.
        </p>
      </div>

      <div style={{ padding: "12px 20px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "12px",
          }}
        >
          {INTERESTS.map((item, index) => {
            const isSelected = selected.includes(item.id);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleInterest(item.id)}
                aria-pressed={isSelected}
                style={{
                  textAlign: "left",
                  borderRadius: "18px",
                  border: isSelected ? `1.5px solid ${item.iconColor}` : "1.5px solid rgba(148,163,184,0.25)",
                  background: isSelected ? "#ffffff" : "rgba(255,255,255,0.75)",
                  padding: "14px",
                  boxShadow: isSelected
                    ? "0 10px 26px rgba(15,23,42,0.12)"
                    : "0 6px 18px rgba(15,23,42,0.08)",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  animation: `riseIn 0.5s ease both ${0.05 * index}s`,
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: item.tint,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "10px",
                    border: isSelected ? `1px solid ${item.iconColor}` : "1px solid transparent",
                  }}
                >
                  <Icon size={18} color={item.iconColor} strokeWidth={2.2} />
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)" }}>{item.label}</div>
                <div style={{ fontSize: "11px", color: "var(--color-text-light)", marginTop: "4px" }}>
                  {isSelected ? "Selected" : "Tap to add"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "auto", padding: "24px 22px 32px" }}>
        <button
          onClick={handleContinue}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "14px",
            border: "none",
            background: "linear-gradient(135deg, var(--color-secondary), #7fc6a5)",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 10px 22px rgba(79,154,116,0.35)",
            marginBottom: "10px",
          }}
        >
          Continue
        </button>
        <button
          type="button"
          onClick={() => router.push("/home")}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            color: "var(--color-text-muted)",
            fontSize: "13px",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

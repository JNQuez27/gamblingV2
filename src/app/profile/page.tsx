"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/ui/BottomNav";
import AnalyticsTab from "./components/AnalyticsTab";
import ProgressTab from "./components/ProgressTab";
import ResourcesTab from "./components/ResourcesTab";
import { styles } from "./styles";

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
    <div className="app-shell" style={styles.appShell}>
      <div style={styles.pageContent}>
        {/* Header */}
        <div style={styles.header}>
          {/* Settings icon */}
          <div style={styles.headerSettingsRow}>
            <Link href="/settings">
              <button style={styles.headerSettingsButton}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-text-muted)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </Link>
          </div>

          {/* Avatar */}
          <div style={styles.headerAvatarRow}>
            <div style={styles.headerAvatarWrap}>
              <div style={styles.headerAvatarCircle}>
                J
              </div>
              <div style={styles.headerAvatarBadge}>
                <span style={{ fontSize: "10px" }}>✓</span>
              </div>
            </div>
          </div>

          <h1 style={styles.headerName}>
            Juan Rivera
          </h1>
          <p style={styles.headerEmail}>
            juan@example.com
          </p>
          <span style={styles.headerMemberBadge}>
            Member since Jan 2026
          </span>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab.id
                  ? styles.tabButtonActive
                  : styles.tabButtonInactive),
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
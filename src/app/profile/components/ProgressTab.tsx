"use client";

import { achievements, statCards } from "../data";
import { styles } from "../styles";

export default function ProgressTab() {
  return (
    <div style={styles.sectionWrap}>
      <h3 style={styles.sectionTitle}>
        Your Progress
      </h3>
      <div style={styles.statGrid}>
        {statCards.map((stat) => (
          <div
            key={stat.label}
            style={{
              ...styles.statCard,
              background: stat.color,
              border: `1.5px solid ${stat.border}`,
            }}
          >
            <div style={{ ...styles.statValue, color: stat.text }}>
              {stat.value}
            </div>
            <div style={{ ...styles.statUnit, color: stat.text }}>
              {stat.unit}
            </div>
            <div style={styles.statLabel}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ ...styles.sectionTitle, margin: "0 0 14px" }}>
        Achievements
      </h3>
      <div style={styles.achievementsList}>
        {achievements.map((badge) => {
          const pct = Math.min((badge.progress / badge.goal) * 100, 100);
          return (
            <div
              key={badge.label}
              style={{
                ...styles.achievementCard,
                background: badge.unlocked ? badge.color : "#f9fafb",
                border: `1.5px solid ${badge.unlocked ? badge.accent + "55" : "#e5e7eb"}`,
                opacity: badge.unlocked ? 1 : 0.75,
              }}
            >
              <div
                style={{
                  ...styles.achievementIconBox,
                  background: badge.unlocked ? badge.accent + "22" : "#f3f4f6",
                  filter: badge.unlocked ? "none" : "grayscale(0.6)",
                }}
              >
                {badge.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.achievementRow}>
                  <span style={styles.achievementLabel}>
                    {badge.label}
                  </span>
                  {badge.unlocked ? (
                    <span
                      style={{
                        ...styles.achievementUnlockedBadge,
                        background: badge.accent + "22",
                        color: badge.accent,
                      }}
                    >
                      Unlocked ✓
                    </span>
                  ) : (
                    <span style={styles.achievementProgressText}>
                      {badge.progress}/{badge.goal}
                    </span>
                  )}
                </div>
                <p style={styles.achievementDesc}>
                  {badge.desc}
                </p>
                <div style={styles.progressTrack}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      borderRadius: "99px",
                      background: badge.unlocked
                        ? `linear-gradient(90deg, ${badge.accent}, ${badge.accent}cc)`
                        : `linear-gradient(90deg, ${badge.accent}88, ${badge.accent}44)`,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={styles.spacer} />
    </div>
  );
}

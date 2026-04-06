"use client";

import { RESOURCES } from "../data";
import { styles } from "../styles";

export default function ResourcesTab() {
  return (
    <div style={styles.sectionWrap}>
      {/* Emergency card */}
      <div style={styles.resourcesCrisisCard}>
        <div style={styles.resourcesCrisisHeader}>
          <div>
            <div style={styles.resourcesCrisisTitle}>
              In Crisis? Call Now
            </div>
            <div style={styles.resourcesCrisisSubtitle}>
              Immediate help available 24/7
            </div>
          </div>
        </div>
        <div style={styles.resourcesCrisisActions}>
          {[
            { label: "Call 988", href: "tel:988" },
            { label: "Call 911", href: "tel:911" },
          ].map(({ label, href }) => (
            <a key={label} href={href} style={{ flex: 1 }}>
              <div style={styles.resourcesCrisisButton}>
                {label}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Resource sections */}
      {RESOURCES.map((section) => (
        <div key={section.category} style={styles.resourcesSection}>
          <div style={styles.resourcesSectionTitle}>
            <h3 style={styles.resourcesSectionName}>
              {section.category}
            </h3>
          </div>
          <div style={styles.resourcesList}>
            {section.items.map((item) => (
              <a
                key={item.name}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <div style={styles.resourcesCard}>
                  <div style={styles.resourcesCardContent}>
                    <div style={styles.resourcesCardName}>
                      {item.name}
                    </div>
                    <div style={styles.resourcesCardDesc}>
                      {item.desc}
                    </div>
                    <div
                      style={{
                        ...styles.resourcesCardTag,
                        background: section.accent + "15",
                        color: section.accent,
                      }}
                    >
                      {item.contact}
                    </div>
                  </div>
                  <div
                    style={{
                      ...styles.resourcesCardIconBox,
                      background: section.accent + "15",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={section.accent}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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
      <div style={styles.selfExclusionCard}>
        <div style={styles.selfExclusionTitle}>
          🚫 Self-Exclusion Programs
        </div>
        <div style={styles.selfExclusionDesc}>
          Block yourself from gambling sites — one of the most effective steps.
        </div>
        {[
          {
            label: "National Council on Problem Gambling",
            href: "https://www.ncpg.org",
          },
          { label: "Gamban - Blocking Software", href: "https://www.gamban.com" },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <div style={styles.selfExclusionLink}>
              {label}
              <span style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
                →
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { styles } from "../styles";

export default function BackHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();

  return (
    <div style={styles.header}>
      <button onClick={() => router.back()} style={styles.headerBackButton}>
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
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div>
        <h1 style={styles.headerTitle}>{title}</h1>
        {subtitle && <p style={styles.headerSubtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}

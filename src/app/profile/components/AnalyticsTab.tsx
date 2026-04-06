"use client";

import { useEffect, useRef } from "react";
import {
  allWeeklySpending,
  moodHistory,
  spendingCategories,
} from "../data";
import { moodColor } from "../utils";
import { styles } from "../styles";

export default function AnalyticsTab() {
  const spendRef = useRef<HTMLCanvasElement>(null);
  const moodRef = useRef<HTMLCanvasElement>(null);
  const pieRef = useRef<HTMLCanvasElement>(null);

  // Show all 7 days; null amount = no user input yet
  const weeklySpending = allWeeklySpending;
  const spendTotal = weeklySpending.reduce((s, d) => s + (d.amount ?? 0), 0);

  const moodAvg = (
    moodHistory.reduce((s, d) => s + d.score, 0) / moodHistory.length
  ).toFixed(1);

  useEffect(() => {
    const spendEl = spendRef.current;
    const moodEl = moodRef.current;
    const pieEl = pieRef.current;

    type ChartConstructor = new (ctx: HTMLCanvasElement, config: Record<string, unknown>) => void;
    type ChartWithGetChart = ChartConstructor & {
      getChart?: (el: HTMLCanvasElement | null) => { destroy: () => void } | undefined;
    };

    // Dynamically load Chart.js if not already present
    const loadChartJs = (): Promise<void> => {
      return new Promise((resolve) => {
        if ((window as Window & { Chart?: ChartWithGetChart }).Chart) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadChartJs().then(() => {
      const ChartJs = (window as Window & { Chart?: ChartWithGetChart }).Chart;
      if (!ChartJs) return;

      // ── Spending Bar Chart ──
      if (spendEl) {
        const amounts = weeklySpending.map((d) => d.amount ?? 0);
        const maxAmount = Math.max(...amounts.filter((a) => a > 0), 0);
        const bgColors = weeklySpending.map((d) => {
          if (d.amount === null) return "#e5e7eb"; // gray = no data
          if (d.amount === maxAmount) return "#f87171"; // red = highest
          return "#60a5fa"; // blue = normal
        });

        new ChartJs(spendEl, {
          type: "bar",
          data: {
            labels: weeklySpending.map((d) => d.day),
            datasets: [
              {
                label: "Spending (₱)",
                data: amounts,
                backgroundColor: bgColors,
                borderRadius: 8,
                borderSkipped: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx: { dataIndex: number; parsed: { y: number } }) => {
                    const day = weeklySpending[ctx.dataIndex];
                    if (day.amount === null) return " No data entered";
                    return ` ₱${ctx.parsed.y.toLocaleString()}`;
                  },
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: "#9ca3af", font: { size: 11 }, autoSkip: false },
              },
              y: {
                beginAtZero: true,
                grid: { color: "rgba(156,163,175,0.15)" },
                ticks: {
                  color: "#9ca3af",
                  font: { size: 11 },
                  callback: (v: number) => `₱${v}`,
                },
              },
            },
          },
        });
      }

      // ── Mood Line Chart ──
      if (moodEl) {
        new ChartJs(moodEl, {
          type: "line",
          data: {
            labels: moodHistory.map((d) => d.day),
            datasets: [
              {
                label: "Mood",
                data: moodHistory.map((d) => d.score),
                borderColor: "#4ade80",
                borderWidth: 2.5,
                pointBackgroundColor: moodHistory.map((d) => moodColor(d.score)),
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 8,
                tension: 0.35,
                fill: true,
                backgroundColor: "rgba(74,222,128,0.08)",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx: { parsed: { y: number } }) => {
                    const labels: Record<number, string> = {
                      1: "Very low",
                      2: "Low",
                      3: "Neutral",
                      4: "Good",
                      5: "Great",
                    };
                    return ` ${labels[ctx.parsed.y]} (${ctx.parsed.y}/5)`;
                  },
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: "#9ca3af", font: { size: 11 }, autoSkip: false },
              },
              y: {
                min: 0,
                max: 6,
                grid: { color: "rgba(156,163,175,0.15)" },
                ticks: {
                  color: "#9ca3af",
                  font: { size: 11 },
                  stepSize: 1,
                  callback: (v: number) => {
                    const m: Record<number, string> = {
                      1: "Low",
                      3: "Neutral",
                      5: "Great",
                    };
                    return m[v] ?? "";
                  },
                },
              },
            },
          },
        });
      }

      // ── Pie / Doughnut Chart ──
      if (pieEl) {
        new ChartJs(pieEl, {
          type: "doughnut",
          data: {
            labels: spendingCategories.map((c) => c.label),
            datasets: [
              {
                data: spendingCategories.map((c) => c.amount),
                backgroundColor: spendingCategories.map((c) => c.color),
                borderColor: "#ffffff",
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "58%",
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx: { parsed: number }) => {
                    const total = spendingCategories.reduce((s, c) => s + c.amount, 0);
                    const pct = Math.round((ctx.parsed / total) * 100);
                    return ` ₱${ctx.parsed.toLocaleString()} (${pct}%)`;
                  },
                },
              },
            },
          },
        });
      }
    });

    // Cleanup: destroy charts on unmount to avoid canvas reuse errors
    return () => {
      const ChartJs = (window as Window & { Chart?: ChartWithGetChart }).Chart;
      if (ChartJs?.getChart) {
        [spendEl, moodEl, pieEl].forEach((el) => {
          const instance = ChartJs.getChart?.(el ?? null);
          instance?.destroy();
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pieTotal = spendingCategories.reduce((s, c) => s + c.amount, 0);

  const chartCard = (title: string, subtitle: string, children: React.ReactNode) => (
    <div style={styles.chartCard}>
      <div style={styles.chartHeader}>
        <h4 style={styles.chartTitle}>{title}</h4>
        <p style={styles.chartSubtitle}>{subtitle}</p>
      </div>
      {children}
    </div>
  );

  return (
    <div style={styles.sectionWrap}>
      {/* ── Weekly Spending ── */}
      {chartCard(
        "Weekly spending",
        "Lower is better",
        <>
          {/* Legend */}
          <div style={styles.legendRow}>
            {[
              { color: "#60a5fa", label: "Logged" },
              { color: "#f87171", label: "Highest day" },
              { color: "#e5e7eb", label: "No data yet" },
            ].map(({ color, label }) => (
              <div key={label} style={styles.legendItem}>
                <div style={{ ...styles.legendSwatch, background: color }} />
                <span style={styles.legendLabel}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ ...styles.chartCanvas, height: "180px" }}>
            <canvas ref={spendRef} />
          </div>
          <div style={styles.chartFooter}>
            <span>Total so far this week</span>
            <span style={{ fontWeight: 700, color: "#f87171" }}>
              ₱{spendTotal.toLocaleString()}
            </span>
          </div>
        </>
      )}

      {/* ── Mood Tracker ── */}
      {chartCard(
        "Mood tracker",
        "Greener means you felt better",
        <>
          {/* Color legend */}
          <div style={styles.legendRow}>
            {[
              { color: "#4ade80", label: "Great (4–5)" },
              { color: "#facc15", label: "Neutral (3)" },
              { color: "#f87171", label: "Struggling (1–2)" },
            ].map(({ color, label }) => (
              <div key={label} style={styles.legendItem}>
                <div style={{ ...styles.legendSwatch, background: color }} />
                <span style={styles.legendLabel}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ ...styles.chartCanvas, height: "160px" }}>
            <canvas ref={moodRef} />
          </div>

          <div style={styles.chartFooter}>
            <span>Average this week</span>
            <span style={{ fontWeight: 700, color: "#4ade80" }}>{moodAvg} / 5</span>
          </div>
        </>
      )}

      {/* ── Spending Categories ── */}
      {chartCard(
        "Spending categories",
        "Breakdown of where your money went this week",
        <>
          <div style={{ ...styles.chartCanvas, height: "200px" }}>
            <canvas ref={pieRef} />
          </div>

          {/* Custom legend */}
          <div style={styles.chartLegendColumn}>
            {spendingCategories.map((cat) => {
              const pct = Math.round((cat.amount / pieTotal) * 100);
              return (
                <div key={cat.label} style={styles.chartLegendRow}>
                  <div style={{ ...styles.legendSwatch, background: cat.color }} />
                  <span style={styles.chartLegendLabel}>{cat.label}</span>
                  <span style={styles.chartLegendValue}>₱{cat.amount.toLocaleString()}</span>
                  <span style={styles.chartLegendPct}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={styles.spacer} />
    </div>
  );
}

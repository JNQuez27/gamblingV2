import { styles } from "../styles";

export default function SettingsRow({
  icon,
  label,
  desc,
  right,
  danger = false,
  onClick,
  showDivider = true,
}: {
  icon: string;
  label: string;
  desc?: string;
  right?: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
  showDivider?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.rowButton,
        cursor: onClick ? "pointer" : "default",
        borderBottom: showDivider ? "1px solid var(--color-border)" : "none",
      }}
    >
      <div
        style={{
          ...styles.rowIcon,
          ...(danger ? styles.dangerIconBg : styles.normalIconBg),
        }}
      >
        {icon}
      </div>
      <div style={styles.rowContent}>
        <p
          style={{
            ...styles.rowLabel,
            color: danger ? "#dc2626" : "var(--color-text)",
          }}
        >
          {label}
        </p>
        {desc && <p style={styles.rowDesc}>{desc}</p>}
      </div>
      {right ?? (
        onClick &&
        !danger && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-light)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )
      )}
    </button>
  );
}

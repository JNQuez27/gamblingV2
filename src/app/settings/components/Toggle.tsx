import { styles } from "../styles";

export default function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      style={{
        ...styles.toggleButton,
        background: value ? "var(--color-secondary)" : "var(--color-border)",
      }}
    >
      <div
        style={{
          ...styles.toggleThumb,
          left: value ? "23px" : "3px",
        }}
      />
    </button>
  );
}

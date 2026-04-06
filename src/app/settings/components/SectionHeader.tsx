import { styles } from "../styles";

export default function SectionHeader({ children }: { children: React.ReactNode }) {
  return <p style={styles.sectionHeader}>{children}</p>;
}

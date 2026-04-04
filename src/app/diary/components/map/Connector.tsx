// ─── Connector ───────────────────────────────────────────────────────────────

const Connector = ({
  fromPos,
  toPos,
  unlocked,
}: {
  fromPos: 'left' | 'center' | 'right';
  toPos: 'left' | 'center' | 'right';
  unlocked: boolean;
}) => {
  const xOf = (p: 'left' | 'center' | 'right') => (p === 'left' ? 22 : p === 'right' ? 78 : 50);
  return (
    <div className="w-full" style={{ height: 48 }}>
      <svg width="100%" height="48" viewBox="0 0 100 48" preserveAspectRatio="none">
        <path
          d={`M ${xOf(fromPos)} 0 C ${xOf(fromPos)} 24, ${xOf(toPos)} 24, ${xOf(toPos)} 48`}
          stroke={unlocked ? '#F59E0B' : '#374151'}
          strokeWidth={unlocked ? '2.5' : '1.5'}
          strokeDasharray={unlocked ? 'none' : '4 5'}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default Connector;

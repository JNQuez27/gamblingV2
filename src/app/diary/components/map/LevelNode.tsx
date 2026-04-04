import { motion } from 'framer-motion';
import { Lock, Star } from 'lucide-react';
import type { Ref } from 'react';
import { MOOD_MAP, TOTAL_LEVELS } from '../../constants';

// ─── LevelNode ────────────────────────────────────────────────────────────────

const LevelNode = ({
  level,
  isCurrent,
  isCompleted,
  isUnlocked,
  isMilestone,
  position,
  moodEmoji,
  hasEntry,
  onSelect,
  nodeRef,
}: {
  level: number;
  isCurrent: boolean;
  isCompleted: boolean;
  isUnlocked: boolean;
  isMilestone: boolean;
  position: 'left' | 'center' | 'right';
  moodEmoji: string | null;
  hasEntry: boolean;
  onSelect: () => void;
  nodeRef?: Ref<HTMLDivElement>;
}) => {
  const alignClass =
    position === 'left' ? 'self-start pl-8' :
    position === 'right' ? 'self-end pr-8' :
    'self-center';

  const nodeBase = 'relative flex items-center justify-center rounded-2xl border transition-all duration-200 select-none';

  const nodeStyle = isCurrent
    ? 'w-16 h-16 bg-white dark:bg-gray-900 border-2 border-sky-400 text-sky-500 ring-4 ring-sky-400/20 cursor-default'
    : isCompleted
      ? 'w-14 h-14 bg-amber-400/20 border border-amber-400 text-amber-500 cursor-pointer hover:scale-105 active:scale-95'
      : isUnlocked
        ? 'w-14 h-14 bg-gray-800 border border-gray-700 text-white cursor-pointer hover:scale-105 active:scale-95'
        : 'w-14 h-14 bg-gray-900 border border-gray-800 text-gray-600 cursor-not-allowed opacity-50';

  const milestoneExtra = isMilestone && !isCurrent ? 'border-dashed' : '';

  const nodeInner = () => {
    if (!isUnlocked) return isMilestone ? <Star className="w-5 h-5" /> : <Lock className="w-4 h-4" />;
    if (isCurrent) return moodEmoji
      ? <span className="text-2xl leading-none">{moodEmoji}</span>
      : <span className="text-base font-semibold">{level}</span>;
    if (moodEmoji) return <span className="text-2xl leading-none">{moodEmoji}</span>;
    if (isMilestone) return <Star className="w-5 h-5 text-amber-400" />;
    return <span className="text-base font-semibold">{level}</span>;
  };

  return (
    <motion.div
      ref={nodeRef}
      className={`flex flex-col items-center gap-1.5 ${alignClass}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: (TOTAL_LEVELS - level) * 0.03, duration: 0.3, ease: 'easeOut' }}
    >
      {isCurrent && (
        <span className="text-[10px] font-semibold tracking-widest uppercase bg-sky-500 text-white px-2.5 py-0.5 rounded-full">
          You are here
        </span>
      )}

      <button
        onClick={onSelect}
        disabled={!isUnlocked}
        className={`${nodeBase} ${nodeStyle} ${milestoneExtra}`}
      >
        {isCurrent && (
          <span className="absolute inset-0 rounded-2xl ring-2 ring-sky-400 animate-ping opacity-30" />
        )}
        {hasEntry && !moodEmoji && isCompleted && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-400 rounded-full border-2 border-gray-950" />
        )}
        {nodeInner()}
      </button>

      {!isCurrent && (
        <span className={`text-[10px] font-medium tracking-widest uppercase ${
          isCompleted ? 'text-amber-500' : isUnlocked ? 'text-gray-400' : 'text-gray-700'
        }`}>
          {isCompleted
            ? (moodEmoji
                ? (MOOD_MAP[Object.keys(MOOD_MAP).find((k) => MOOD_MAP[k].emoji === moodEmoji) ?? '']?.label ?? 'done')
                : 'done')
            : isMilestone ? 'milestone' : `lv ${level}`}
        </span>
      )}
    </motion.div>
  );
};

export default LevelNode;

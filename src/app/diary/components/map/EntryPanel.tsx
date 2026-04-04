import { motion } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { MOOD_MAP } from '../../constants';
import type { DiaryEntry } from '../../types';

// ─── EntryPanel ───────────────────────────────────────────────────────────────

const EntryPanel = ({
  level,
  dateStr,
  entry,
  onClose,
}: {
  level: number;
  dateStr: string;
  entry: DiaryEntry | null;
  onClose: () => void;
}) => {
  const mood = entry ? MOOD_MAP[entry.mood] : null;
  const dateLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="absolute bottom-0 left-0 right-0 z-20 bg-gray-900 border-t border-gray-800 rounded-t-2xl px-5 pt-5 pb-8 shadow-2xl"
    >
      <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-0.5">Day {level}</p>
          <h3 className="text-base font-semibold text-white">{dateLabel}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {entry && mood ? (
        <>
          <div className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3 mb-4">
            <span className="text-3xl">{mood.emoji}</span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Mood</p>
              <p className={`text-sm font-semibold ${mood.color}`}>{mood.label}</p>
            </div>
          </div>
          {entry.note ? (
            <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Note</p>
              <p className="text-sm text-gray-200 leading-relaxed">&ldquo;{entry.note}&rdquo;</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic text-center py-2">No note written.</p>
          )}
          <p className="text-[10px] text-gray-700 text-center mt-4">
            {new Date(entry.timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center py-6 gap-2 text-gray-600">
          <ChevronDown className="w-8 h-8 opacity-30" />
          <p className="text-sm">No diary entry for this day.</p>
        </div>
      )}
    </motion.div>
  );
};

export default EntryPanel;

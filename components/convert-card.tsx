import { motion } from 'framer-motion';

interface ConvertCardProps {
  icon: React.ReactNode;
  count: number;
  itemName: string;
  unitPrice: number;
  colorClass: string;
}

export function ConvertCard({ icon, count, itemName, unitPrice, colorClass }: ConvertCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={`flex items-center space-x-4 p-4 rounded-2xl border ${colorClass} bg-opacity-10`}
    >
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-sm">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-bold text-text-primary text-lg">{count.toLocaleString()}</p>
        <p className="text-sm text-text-muted">{itemName}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-text-primary">₱{unitPrice.toLocaleString()}</p>
        <p className="text-xs text-text-muted">each</p>
      </div>
    </motion.div>
  );
}

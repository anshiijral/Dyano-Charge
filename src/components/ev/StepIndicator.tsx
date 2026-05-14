import { motion } from "framer-motion";

interface Props {
  current: number;
  total: number;
}

const labels = ["Locate", "Stations", "Details", "Metrics", "Book", "Confirmed"];

export const StepIndicator = ({ current, total }: Props) => {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const active = i <= current;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <motion.div
              animate={{ width: i === current ? 28 : 8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`h-1.5 rounded-full ${active ? "bg-primary" : "bg-muted"}`}
            />
            {i === current && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[9px] font-semibold uppercase tracking-wider text-primary"
              >
                {labels[i]}
              </motion.span>
            )}
          </div>
        );
      })}
    </div>
  );
};

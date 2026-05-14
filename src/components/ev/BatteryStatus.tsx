import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BatteryCharging, Pencil, Check, Zap, Minus, Plus } from "lucide-react";

interface Props {
  level: number; // 0-100
  range: number; // km
  onLevelChange?: (next: number) => void;
}

export const BatteryStatus = ({ level, range, onLevelChange }: Props) => {
  const [editing, setEditing] = useState(false);

  const color =
    level > 50 ? "hsl(var(--success))" : level > 20 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  const statusLabel = level < 30 ? "Low — charge soon" : level < 70 ? "Sufficient" : "Healthy";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-gradient-card rounded-3xl p-5 shadow-card border border-border/60"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-primary-soft flex items-center justify-center">
            <BatteryCharging className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">My Vehicle</p>
            <p className="text-sm font-semibold">Tesla Model 3</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Range</p>
            <p className="text-sm font-semibold">{range} km</p>
          </div>
          <button
            onClick={() => setEditing((v) => !v)}
            aria-label={editing ? "Done editing battery" : "Edit battery"}
            className="w-8 h-8 rounded-2xl bg-secondary/70 hover:bg-secondary flex items-center justify-center transition-smooth"
          >
            <AnimatePresence mode="wait" initial={false}>
              {editing ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Check className="w-3.5 h-3.5 text-primary" />
                </motion.span>
              ) : (
                <motion.span
                  key="pencil"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* AR-style battery */}
      <div className="relative">
        <div className="flex items-end gap-1 h-20 rounded-2xl bg-secondary/60 p-2 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => {
            const filled = i < Math.round(level / 5);
            return (
              <motion.div
                key={i}
                animate={{
                  background: filled ? color : "hsl(var(--muted))",
                  opacity: filled ? 0.85 + i / 60 : 0.3,
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex-1 rounded-md origin-bottom h-full"
              />
            );
          })}
        </div>

        <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
          <motion.div
            key={level}
            initial={{ scale: 0.92, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/70 backdrop-blur"
          >
            <Zap className="w-3 h-3 text-primary fill-primary" />
            <span className="text-xs font-bold tabular-nums">{level}%</span>
          </motion.div>
          <span className="text-xs font-medium text-foreground/70 bg-background/70 backdrop-blur px-2 py-1 rounded-full">
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Inline edit panel */}
      <AnimatePresence initial={false}>
        {editing && (
          <motion.div
            key="editor"
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl bg-secondary/50 border border-border/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                  Set battery level
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onLevelChange?.(Math.max(0, level - 1))}
                    aria-label="Decrease battery"
                    className="w-7 h-7 rounded-xl bg-background border border-border/60 hover:bg-primary-soft hover:border-primary/40 flex items-center justify-center transition-smooth active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={level}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        if (raw === "") {
                          onLevelChange?.(0);
                          return;
                        }
                        const v = Math.max(0, Math.min(100, parseInt(raw, 10)));
                        onLevelChange?.(v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          onLevelChange?.(Math.min(100, level + 1));
                        } else if (e.key === "ArrowDown") {
                          e.preventDefault();
                          onLevelChange?.(Math.max(0, level - 1));
                        }
                      }}
                      className="w-16 h-8 rounded-xl bg-background border border-border/60 text-sm font-bold text-center outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 tabular-nums pr-5 transition-smooth cursor-text"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none">
                      %
                    </span>
                  </div>
                  <button
                    onClick={() => onLevelChange?.(Math.min(100, level + 1))}
                    aria-label="Increase battery"
                    className="w-7 h-7 rounded-xl bg-background border border-border/60 hover:bg-primary-soft hover:border-primary/40 flex items-center justify-center transition-smooth active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

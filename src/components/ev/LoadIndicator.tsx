import { motion } from "framer-motion";

interface Props {
  load: number; // 0-100
  size?: "sm" | "md";
}

export const LoadIndicator = ({ load, size = "md" }: Props) => {
  const status =
    load < 50
      ? { label: "Low Load", color: "hsl(var(--success))", bg: "bg-success/10", text: "text-success" }
      : load < 80
      ? { label: "Moderate", color: "hsl(var(--warning))", bg: "bg-warning/15", text: "text-warning" }
      : { label: "High Load", color: "hsl(var(--destructive))", bg: "bg-destructive/10", text: "text-destructive" };

  const dim = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Grid Load</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
          {status.label} · {load}%
        </span>
      </div>
      <div className={`w-full ${dim} bg-muted rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${load}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: status.color }}
        />
      </div>
    </div>
  );
};

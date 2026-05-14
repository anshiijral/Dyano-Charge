import { motion } from "framer-motion";
import { Clock, Zap, Users, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadIndicator } from "./LoadIndicator";
import type { Station } from "./MapView";

interface Props {
  station: Station;
  showMetrics: boolean;
  showBooking: boolean;
  onBook: () => void;
}

export const StationDetails = ({ station, showMetrics, showBooking, onBook }: Props) => {
  const occupied = station.totalSlots - station.freeSlots;
  const headroom = Math.max(0, 100 - station.load);

  return (
    <motion.div
      key={station.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary text-[10px] font-bold uppercase tracking-wide">
              Fast charger · 150 kW
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">{station.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {station.distance} away · ~{Math.ceil(parseFloat(station.distance) * 2.5)} min drive
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Slots</p>
          <p className="text-2xl font-bold text-primary">
            {station.freeSlots}
            <span className="text-sm text-muted-foreground font-medium">/{station.totalSlots}</span>
          </p>
        </div>
      </div>

      {/* Slot grid visual */}
      <div className="flex gap-1.5">
        {Array.from({ length: station.totalSlots }).map((_, i) => {
          const free = i < station.freeSlots;
          return (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
              className={`flex-1 h-8 rounded-lg flex items-center justify-center ${
                free ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"
              }`}
              title={free ? "Free" : "Occupied"}
            >
              <Zap className={`w-3.5 h-3.5 ${free ? "fill-primary/40" : ""}`} />
            </motion.div>
          );
        })}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={<Users className="w-3.5 h-3.5" />} label="Occupancy" value={`${occupied}/${station.totalSlots}`} />
        <Stat icon={<Clock className="w-3.5 h-3.5" />} label="Wait" value={`${station.waitMin} min`} />
        <Stat icon={<Gauge className="w-3.5 h-3.5" />} label="Headroom" value={`${headroom}%`} />
      </div>

      {/* Metrics — revealed step 4 */}
      {showMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 12, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="rounded-2xl bg-secondary/60 p-4 space-y-3 border border-border/50">
            <LoadIndicator load={station.load} />
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
              <span className="text-muted-foreground">Remaining grid headroom</span>
              <span className="font-semibold text-foreground">{(headroom * 1.5).toFixed(0)} kW</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Booking — step 5 */}
      {showBooking && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Button
            onClick={onBook}
            className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-primary hover:opacity-95 shadow-glow transition-smooth"
          >
            Book a Slot · ~{station.waitMin} min wait
          </Button>
          <p className="text-[11px] text-center text-muted-foreground mt-2">
            Free cancellation up to 5 minutes before arrival
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-xl bg-background border border-border/60 p-2.5">
    <div className="flex items-center gap-1 text-muted-foreground mb-1">
      {icon}
      <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-sm font-bold">{value}</p>
  </div>
);

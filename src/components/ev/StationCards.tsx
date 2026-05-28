import { motion } from "framer-motion";
import { Zap, Clock, Activity, Users, Navigation, Sparkles, Ban, Gauge } from "lucide-react";
import type { StationData } from "@/services/stationService";

const Stat = ({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) => (
  <div className={`rounded-2xl p-3 border ${accent ? "bg-primary-soft border-primary/20" : "bg-secondary/50 border-border"}`}>
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      <Icon className="w-3 h-3" /> {label}
    </div>
    <p className="text-sm font-bold mt-1">{value}</p>
  </div>
);

const StatusPill = ({ status }: { status: "GREEN" | "RED" }) => (
  <span
    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
      status === "RED" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
    }`}
  >
    LED {status}
  </span>
);

interface RecommendedProps {
  station: "A" | "B" | "C" | "AVOID";
  reason: string;
  data?: StationData;
  gridHeadroom: number;
  totalSlots: number;
  ledStatus: "GREEN" | "RED";
}

export const RecommendedCard = ({ station, reason, data, gridHeadroom, totalSlots, ledStatus }: RecommendedProps) => {
  const avoid = station === "AVOID";
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border shadow-card overflow-hidden ${
        avoid ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-gradient-card"
      }`}
    >
      <div className={`px-5 py-3 flex items-center justify-between ${avoid ? "bg-destructive/10" : "bg-primary-soft"}`}>
        <div className="flex items-center gap-2">
          {avoid ? <Ban className="w-4 h-4 text-destructive" /> : <Sparkles className="w-4 h-4 text-primary" />}
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {avoid ? "Avoid Charging Now" : "Recommended Station"}
          </span>
        </div>
        <StatusPill status={ledStatus} />
      </div>

      <div className="p-5">
        <div className="flex items-baseline gap-2 mb-1">
          <h2 className="text-3xl font-extrabold tracking-tight">
            {avoid ? "AVOID" : `Station ${station}`}
          </h2>
          {!avoid && data && (
            <span className="text-sm text-muted-foreground font-medium">· {data.distance} km away</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">{reason}</p>

        {!avoid && data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Stat icon={Navigation} label="Distance" value={`${data.distance} km`} />
            <Stat icon={Activity} label="Load" value={`${data.load}%`} />
            <Stat icon={Users} label="Occupancy" value={`${data.occupancy}/${totalSlots}`} />
            <Stat icon={Zap} label="Free slots" value={`${Math.max(0, totalSlots - data.occupancy)}`} />
            <Stat icon={Clock} label="Wait" value={`${data.waitingTime} min`} />
            <Stat icon={Gauge} label="Grid" value={`${gridHeadroom}%`} accent />
          </div>
        )}
      </div>
    </motion.section>
  );
};

interface StationProps {
  name: "A" | "B" | "C";
  data: StationData;
  totalSlots: number;
}

export const StationCard = ({ name, data, totalSlots }: StationProps) => {
  const status: "GREEN" | "RED" = data.loadStatus;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-card border border-border shadow-soft p-4 hover:shadow-card transition-smooth"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Station {name}</p>
            <p className="text-[11px] text-muted-foreground">{data.distance} km away</p>
          </div>
        </div>
        <StatusPill status={status} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat icon={Activity} label="Load" value={`${data.load}%`} />
        <Stat icon={Users} label="Occupancy" value={`${data.occupancy}/${totalSlots}`} />
        <Stat icon={Zap} label="Free" value={`${Math.max(0, totalSlots - data.occupancy)}`} />
        <Stat icon={Clock} label="Wait" value={`${data.waitingTime} min`} />
      </div>
    </motion.div>
  );
};

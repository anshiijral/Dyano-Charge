import { motion } from "framer-motion";
import { Check, Clock, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Station } from "./MapView";

interface Props {
  station: Station;
  onDone: () => void;
}

export const ConfirmationScreen = ({ station, onDone }: Props) => {
  const code = "EV-" + Math.floor(1000 + Math.random() * 9000);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-30 bg-background/80 backdrop-blur-md flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card rounded-3xl shadow-card border border-border/60 max-w-sm w-full p-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
          className="relative mx-auto w-20 h-20 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center mb-5"
        >
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping-slow" />
          <Check className="w-10 h-10 text-primary-foreground relative z-10" strokeWidth={3} />
        </motion.div>

        <h2 className="text-2xl font-bold tracking-tight">Slot Booked</h2>
        <p className="text-sm text-muted-foreground mt-1">Your charging slot is reserved</p>

        <div className="mt-5 rounded-2xl bg-secondary/60 p-4 space-y-3 text-left">
          <Row icon={<MapPin className="w-4 h-4" />} label="Station" value={station.name} />
          <Row icon={<Zap className="w-4 h-4" />} label="Slot" value={`#${station.totalSlots - station.freeSlots + 1} · 150 kW`} />
          <Row icon={<Clock className="w-4 h-4" />} label="Estimated wait" value={`${station.waitMin} minutes`} />
        </div>

        <div className="mt-4 px-4 py-3 rounded-2xl bg-primary-soft">
          <p className="text-[10px] uppercase tracking-wider text-primary/80 font-bold">Booking code</p>
          <p className="text-xl font-bold tracking-[0.2em] text-primary">{code}</p>
        </div>

        <Button
          onClick={onDone}
          variant="outline"
          className="w-full mt-5 h-12 rounded-2xl font-semibold border-border"
        >
          Start Over
        </Button>
      </motion.div>
    </motion.div>
  );
};

const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
    <span className="text-sm font-semibold">{value}</span>
  </div>
);

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Navigation, Car } from "lucide-react";

export interface Station {
  id: string;
  name: string;
  x: number; // % position on map
  y: number;
  distance: string;
  load: number;
  freeSlots: number;
  totalSlots: number;
  waitMin: number;
}

interface Props {
  stations: Station[];
  showStations: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const MapView = ({ stations, showStations, selectedId, onSelect }: Props) => {
  return (
    <div className="absolute inset-0 bg-gradient-map map-grid overflow-hidden">
      {/* Soft road lines */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <path
          d="M -50 300 Q 200 250, 400 320 T 900 280"
          stroke="hsl(150 30% 80%)"
          strokeWidth="28"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M 200 -50 Q 250 300, 380 500 T 500 900"
          stroke="hsl(150 30% 80%)"
          strokeWidth="22"
          fill="none"
          opacity="0.45"
        />
        <path
          d="M -50 600 Q 300 580, 500 650 T 1000 620"
          stroke="hsl(150 30% 82%)"
          strokeWidth="18"
          fill="none"
          opacity="0.4"
        />
      </svg>

      {/* User location */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-20"
        style={{ left: "48%", top: "52%", transform: "translate(-50%, -50%)" }}
      >
        <div className="relative flex items-center justify-center">
          <span className="absolute w-16 h-16 rounded-full bg-primary/30 animate-ping-slow" />
          <span className="absolute w-10 h-10 rounded-full bg-primary/20" />
          <div className="relative w-12 h-12 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center border-4 border-background">
            <Car className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
        <div className="mt-2 px-3 py-1 rounded-full bg-background/90 backdrop-blur shadow-soft text-xs font-semibold whitespace-nowrap text-center">
          You're here
        </div>
      </motion.div>

      {/* Stations */}
      <AnimatePresence>
        {showStations &&
          stations.map((s, i) => {
            const selected = selectedId === s.id;
            const loadColor =
              s.load < 50 ? "bg-success" : s.load < 80 ? "bg-warning" : "bg-destructive";
            return (
              <motion.button
                key={s.id}
                initial={{ scale: 0, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.15 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onSelect(s.id)}
                className="absolute z-10 group"
                style={{ left: `${s.x}%`, top: `${s.y}%`, transform: "translate(-50%, -100%)" }}
              >
                <motion.div
                  animate={{ y: selected ? -4 : 0 }}
                  className={`relative flex flex-col items-center transition-smooth ${
                    selected ? "scale-110" : "group-hover:scale-105"
                  }`}
                >
                  <div
                    className={`relative w-12 h-12 rounded-2xl bg-background shadow-card flex items-center justify-center border-2 ${
                      selected ? "border-primary" : "border-background"
                    }`}
                  >
                    <Zap className="w-5 h-5 text-primary fill-primary/30" />
                    <span
                      className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${loadColor} border-2 border-background`}
                    />
                  </div>
                  <div
                    className="w-0 h-0 -mt-0.5"
                    style={{
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderTop: "8px solid hsl(var(--background))",
                      filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.08))",
                    }}
                  />
                  {selected && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-soft"
                    >
                      {s.distance}
                    </motion.div>
                  )}
                </motion.div>
              </motion.button>
            );
          })}
      </AnimatePresence>

      {/* North indicator */}
      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/85 backdrop-blur shadow-soft flex items-center justify-center">
        <Navigation className="w-4 h-4 text-primary" />
      </div>
    </div>
  );
};

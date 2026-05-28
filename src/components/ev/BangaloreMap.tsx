import { motion } from "framer-motion";
import { Car, Zap } from "lucide-react";

interface MapStation {
  id: "A" | "B" | "C";
  x: number;
  y: number;
  recommended: boolean;
  status: "GREEN" | "RED";
}

interface Props {
  location: string;
  stations: MapStation[];
}

export const BangaloreMap = ({ location, stations }: Props) => {
  return (
    <section className="bg-card rounded-3xl border border-border shadow-card overflow-hidden">
      <div className="relative w-full h-[360px] sm:h-[440px] bg-gradient-map map-grid">
        {/* Stylized Bangalore roads */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="none">
          {/* Outer ring road */}
          <ellipse cx="400" cy="250" rx="320" ry="190" fill="none" stroke="hsl(var(--muted-foreground) / 0.25)" strokeWidth="3" strokeDasharray="8 6" />
          {/* Inner ring */}
          <ellipse cx="400" cy="250" rx="180" ry="110" fill="none" stroke="hsl(var(--muted-foreground) / 0.2)" strokeWidth="2" />
          {/* Major roads */}
          <path d="M 50 250 Q 250 240 400 250 T 750 260" stroke="hsl(var(--primary) / 0.35)" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M 400 30 Q 410 200 400 250 T 380 470" stroke="hsl(var(--primary) / 0.3)" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M 120 80 Q 280 200 420 280 T 720 420" stroke="hsl(var(--primary) / 0.22)" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 80 420 Q 260 320 440 300 T 740 140" stroke="hsl(var(--primary) / 0.22)" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Lakes */}
          <ellipse cx="200" cy="380" rx="40" ry="22" fill="hsl(200 60% 70% / 0.35)" />
          <ellipse cx="620" cy="120" rx="55" ry="28" fill="hsl(200 60% 70% / 0.35)" />
        </svg>

        {/* City label */}
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-card/85 backdrop-blur border border-border shadow-soft text-[11px] font-bold">
          Bangalore, IN
        </div>

        {/* User location */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute z-20"
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-16 h-16 rounded-full bg-primary/30 animate-ping-slow" />
            <span className="absolute w-10 h-10 rounded-full bg-primary/20" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center border-4 border-card">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <div className="mt-2 px-3 py-1 rounded-full bg-card/95 backdrop-blur shadow-soft text-xs font-semibold whitespace-nowrap text-center max-w-[180px] truncate border border-border">
            {location || "Your location"}
          </div>
        </motion.div>

        {/* Stations */}
        {stations.map((s, i) => {
          const ring = s.status === "RED" ? "bg-destructive" : "bg-success";
          return (
            <motion.div
              key={s.id}
              initial={{ scale: 0, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute z-10"
              style={{ left: `${s.x}%`, top: `${s.y}%`, transform: "translate(-50%, -100%)" }}
            >
              <div className={`flex flex-col items-center ${s.recommended ? "scale-110" : ""}`}>
                {s.recommended && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-primary/25 animate-ping-slow" />
                )}
                <div
                  className={`relative w-12 h-12 rounded-2xl bg-card shadow-card flex items-center justify-center border-2 ${
                    s.recommended ? "border-primary ring-2 ring-primary/40" : "border-card"
                  }`}
                >
                  <Zap className={`w-5 h-5 ${s.recommended ? "text-primary fill-primary/40" : "text-foreground/70"}`} />
                  <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${ring} border-2 border-card`} />
                </div>
                <div className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-soft ${
                  s.recommended ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                }`}>
                  Station {s.id}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

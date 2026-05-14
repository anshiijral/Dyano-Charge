import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Search, Sparkles } from "lucide-react";
import { MapView, type Station } from "@/components/ev/MapView";
import { BatteryStatus } from "@/components/ev/BatteryStatus";
import { StationDetails } from "@/components/ev/StationDetails";
import { ConfirmationScreen } from "@/components/ev/ConfirmationScreen";
import { StepIndicator } from "@/components/ev/StepIndicator";
import { Button } from "@/components/ui/button";

const STATIONS: Station[] = [
  { id: "s1", name: "GreenVolt · Central", x: 28, y: 32, distance: "0.8 km", load: 35, freeSlots: 4, totalSlots: 6, waitMin: 0 },
  { id: "s2", name: "EcoCharge · Riverside", x: 70, y: 38, distance: "1.4 km", load: 72, freeSlots: 1, totalSlots: 5, waitMin: 8 },
  { id: "s3", name: "PulsePoint · North", x: 35, y: 72, distance: "2.1 km", load: 88, freeSlots: 0, totalSlots: 4, waitMin: 18 },
  { id: "s4", name: "VoltHub · Market St.", x: 78, y: 70, distance: "2.6 km", load: 48, freeSlots: 3, totalSlots: 8, waitMin: 2 },
];

const Index = () => {
  // 0 locate · 1 stations · 2 details · 3 metrics · 4 booking · 5 confirmed
  const [step, setStep] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [battery, setBattery] = useState(28);
  const range = Math.round((battery / 100) * 335);
  const selected = STATIONS.find((s) => s.id === selectedId) ?? null;

  // Auto-advance step 0 → 1
  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setStep(1), 1400);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setStep(2);
    setTimeout(() => setStep((s) => (s < 3 ? 3 : s)), 700);
    setTimeout(() => setStep((s) => (s < 4 ? 4 : s)), 1400);
  };

  const reset = () => {
    setStep(0);
    setSelectedId(null);
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Top status bar */}
      <header className="absolute top-0 left-0 right-0 z-30 px-4 pt-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-primary shadow-soft flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Smart Mobility</p>
                <p className="text-sm font-bold -mt-0.5">DyanoCharge</p>
              </div>
            </div>
            <StepIndicator current={Math.min(step, 5)} total={6} />
          </div>

          {/* Search bar */}
          {step < 2 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card/90 backdrop-blur-xl rounded-2xl shadow-card border border-border/60 px-4 py-3 flex items-center gap-3"
            >
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Find a charging station near you"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              <span className="text-[10px] font-bold text-primary bg-primary-soft px-2 py-1 rounded-full">
                Live
              </span>
            </motion.div>
          )}
        </div>
      </header>

      {/* Map */}
      <div className="fixed inset-0">
        <MapView
          stations={STATIONS}
          showStations={step >= 1}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-3 pb-3 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="locating"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-sheet border border-border/60 p-5 flex items-center gap-3"
              >
                <div className="relative w-10 h-10 rounded-2xl bg-primary-soft flex items-center justify-center">
                  <span className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping-slow" />
                  <div className="w-3 h-3 rounded-full bg-primary relative" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Locating your vehicle…</p>
                  <p className="text-xs text-muted-foreground">Connecting to onboard GPS</p>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="battery"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                <BatteryStatus level={battery} range={range} onLevelChange={setBattery} />
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-sheet border border-border/60 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold">{STATIONS.length} stations nearby</p>
                    <p className="text-xs text-muted-foreground">Tap a marker to view details</p>
                  </div>
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded-full">
                    Live data
                  </span>
                </motion.div>
              </motion.div>
            )}

            {step >= 2 && step <= 4 && selected && (
              <motion.div
                key="details"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-sheet border border-border/60 p-5"
              >
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedId(null);
                  }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-smooth"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back to map
                </button>
                <StationDetails
                  station={selected}
                  showMetrics={step >= 3}
                  showBooking={step >= 4}
                  onBook={() => setStep(5)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Confirmation overlay */}
      <AnimatePresence>
        {step === 5 && selected && <ConfirmationScreen station={selected} onDone={reset} />}
      </AnimatePresence>
    </main>
  );
};

export default Index;

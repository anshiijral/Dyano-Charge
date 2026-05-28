import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Search, Sparkles } from "lucide-react";

import { MapView, type Station } from "@/components/ev/MapView";
import { BatteryStatus } from "@/components/ev/BatteryStatus";
import { StationDetails } from "@/components/ev/StationDetails";
import { ConfirmationScreen } from "@/components/ev/ConfirmationScreen";
import { StepIndicator } from "@/components/ev/StepIndicator";

import {
  subscribeToDashboardData,
  writeRecommendationToFirebase,
  type DashboardData,
} from "@/services/stationService";
import { getRecommendation } from "@/lib/decisionLogic";

const convertFirebaseToStations = (data: DashboardData): Station[] => {
  return [
    {
      id: "A",
      name: "Station A",
      distance: `${data.stations.A.distance} km`,
      load: data.stations.A.load,
      loadStatus: data.stations.A.loadStatus,
      occupancy: data.stations.A.occupancy,
      waitingTime: data.stations.A.waitingTime,
      available: data.stations.A.occupancy < 3,
    },
    {
      id: "B",
      name: "Station B",
      distance: `${data.stations.B.distance} km`,
      load: data.stations.B.load,
      loadStatus: data.stations.B.loadStatus,
      occupancy: data.stations.B.occupancy,
      waitingTime: data.stations.B.waitingTime,
      available: data.stations.B.occupancy < 3,
    },
    {
      id: "C",
      name: "Station C",
      distance: `${data.stations.C.distance} km`,
      load: data.stations.C.load,
      loadStatus: data.stations.C.loadStatus,
      occupancy: data.stations.C.occupancy,
      waitingTime: data.stations.C.waitingTime,
      available: data.stations.C.occupancy < 3,
    },
  ];
};

const Index = () => {
  const [data, setData] = useState<DashboardData | null>(null);

  // 0 locate · 1 stations · 2 details · 3 metrics · 4 booking · 5 confirmed
  const [step, setStep] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [manualBattery, setManualBattery] = useState(28);

  useEffect(() => {
    const unsubscribe = subscribeToDashboardData(async (liveData) => {
      setData(liveData);

      const result = getRecommendation(liveData);
      await writeRecommendationToFirebase(result.station, result.reason);
    });

    return () => unsubscribe();
  }, []);

  if (!data) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm font-semibold">Loading live DyanoCharge data...</p>
      </main>
    );
  }

  const battery = data.vehicle.battery ?? manualBattery;
  const range = Math.round((battery / 100) * 335);

  const stations = convertFirebaseToStations(data);
  const selected = stations.find((s) => s.id === selectedId) ?? null;

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
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  Smart Mobility
                </p>
                <p className="text-sm font-bold -mt-0.5">DyanoCharge</p>
              </div>
            </div>
            <StepIndicator current={Math.min(step, 5)} total={6} />
          </div>

          {/* Recommendation banner */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 bg-card/90 backdrop-blur-xl rounded-2xl shadow-card border border-border/60 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  ML Recommendation
                </p>
                <p className="text-sm font-semibold">
                  {data.recommendation?.station === "AVOID"
                    ? "Avoid charging now"
                    : `Go to Station ${data.recommendation?.station}`}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  data.recommendation?.ledStatus === "RED"
                    ? "text-destructive bg-destructive/10"
                    : "text-success bg-success/10"
                }`}
              >
                LED {data.recommendation?.ledStatus}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.recommendation?.reason}
            </p>
          </motion.div>

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
          stations={stations}
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
                  <p className="text-xs text-muted-foreground">
                    Connecting to onboard GPS
                  </p>
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
                <BatteryStatus
                  level={battery}
                  range={range}
                  onLevelChange={setManualBattery}
                />

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-sheet border border-border/60 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {stations.length} stations nearby
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Grid headroom: {data.grid.headroom}% · Battery:{" "}
                      {data.vehicle.battery}%
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      data.grid.status === "RED"
                        ? "text-destructive bg-destructive/10"
                        : "text-success bg-success/10"
                    }`}
                  >
                    Grid {data.grid.status}
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
        {step === 5 && selected && (
          <ConfirmationScreen station={selected} onDone={reset} />
        )}
      </AnimatePresence>
    </main>
  );
};

export default Index;
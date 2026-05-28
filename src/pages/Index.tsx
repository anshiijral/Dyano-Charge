import { useEffect, useMemo, useState } from "react";

import { Header } from "@/components/ev/Header";
import { InputCard } from "@/components/ev/InputCard";
import { BangaloreMap } from "@/components/ev/BangaloreMap";
import { RecommendedCard, StationCard } from "@/components/ev/StationCards";

import {
  subscribeToDashboardData,
  type DashboardData,
} from "@/services/stationService";
import { getRecommendation } from "@/lib/decisionLogic";

const TOTAL_SLOTS = 3;

const STATION_POS: Record<"A" | "B" | "C", { x: number; y: number }> = {
  A: { x: 26, y: 32 },
  B: { x: 74, y: 28 },
  C: { x: 58, y: 78 },
};

const Index = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [location, setLocation] = useState("Indiranagar, Bangalore");
  const [battery, setBattery] = useState(45);

  useEffect(() => {
    const unsubscribe = subscribeToDashboardData((live) => setData(live));
    return () => unsubscribe();
  }, []);

  const recommendation = useMemo(() => {
    if (!data) return null;
    if (!data.stations?.A || !data.stations?.B || !data.stations?.C) return null;
    const overridden: DashboardData = {
      ...data,
      vehicle: { ...data.vehicle, battery },
    };
    return getRecommendation(overridden);
  }, [data, battery]);

  if (!data || !recommendation) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm font-semibold text-muted-foreground">Loading DyanoCharge live data…</p>
      </main>
    );
  }

  const ledStatus: "GREEN" | "RED" = recommendation.station === "AVOID" ? "RED" : "GREEN";
  const recommendedData =
    recommendation.station !== "AVOID" ? data.stations[recommendation.station] : undefined;

  const mapStations = (["A", "B", "C"] as const).map((id) => ({
    id,
    ...STATION_POS[id],
    recommended: recommendation.station === id,
    status: data.stations[id].loadStatus,
  }));

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <InputCard
          location={location}
          onLocationChange={setLocation}
          battery={battery}
          onBatteryChange={setBattery}
        />

        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3">
            <BangaloreMap location={location} stations={mapStations} />
          </div>
          <div className="lg:col-span-2">
            <RecommendedCard
              station={recommendation.station}
              reason={recommendation.reason}
              data={recommendedData}
              gridHeadroom={data.grid.headroom}
              totalSlots={TOTAL_SLOTS}
              ledStatus={ledStatus}
            />
          </div>
        </div>

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              All Stations
            </h3>
            <span className="text-xs text-muted-foreground">Live telemetry · {TOTAL_SLOTS} slots each</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(["A", "B", "C"] as const).map((id) => (
              <StationCard key={id} name={id} data={data.stations[id]} totalSlots={TOTAL_SLOTS} />
            ))}
          </div>
        </section>

        <footer className="text-center text-[11px] text-muted-foreground pt-4 pb-2">
          DyanoCharge · IoT + ML demo · Smart EV charging recommendations for Bangalore
        </footer>
      </div>
    </main>
  );
};

export default Index;

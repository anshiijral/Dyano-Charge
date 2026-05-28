import { useEffect, useMemo, useState } from "react";

import { BangaloreMap } from "@/components/ev/BangaloreMap";
import {
  subscribeToDashboardData,
  type DashboardData,
} from "@/services/stationService";

import { bangaloreLocations } from "@/lib/bangaloreLocations";

const stationIds = ["A", "B", "C"] as const;

const Index = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [manualBattery, setManualBattery] = useState(28);
  const [selectedLocationName, setSelectedLocationName] = useState(
    bangaloreLocations[0]?.name ?? ""
  );

  useEffect(() => {
    const unsubscribe = subscribeToDashboardData((live) => setData(live));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (data?.vehicle?.battery !== undefined) {
      setManualBattery(data.vehicle.battery);
    }
  }, [data?.vehicle?.battery]);

  const userLocation = useMemo(() => {
    return (
      bangaloreLocations.find(
        (location) => location.name === selectedLocationName
      ) ?? bangaloreLocations[0]
    );
  }, [selectedLocationName]);

  const displayData = useMemo<DashboardData | null>(() => {
    if (!data) return null;

    return {
      ...data,
      vehicle: {
        ...data.vehicle,
        battery: manualBattery,
      },
    };
  }, [data, manualBattery]);

  if (!displayData || !userLocation) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm font-semibold">
          Loading live DyanoCharge data...
        </p>
      </main>
    );
  }

  const battery = displayData.vehicle.battery ?? manualBattery;
  const batteryRange = Math.round((battery / 100) * 335);
  const recommendation = displayData.recommendation;

  const stations = stationIds.map((id) => ({
    id,
    ...displayData.stations[id],
  }));

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Smart Mobility
              </p>
              <h1 className="text-2xl font-bold">DyanoCharge</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                AI-assisted EV charging recommendation dashboard
              </p>
            </div>

            <div
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                recommendation.ledStatus === "RED"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-success/10 text-success"
              }`}
            >
              LED {recommendation.ledStatus}
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Your location
                  </p>
                  <p className="text-sm font-semibold">{userLocation.name}</p>
                </div>

                <select
                  value={selectedLocationName}
                  onChange={(event) =>
                    setSelectedLocationName(event.target.value)
                  }
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
                >
                  {bangaloreLocations.map((location) => (
                    <option key={location.name} value={location.name}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <BangaloreMap data={displayData} userLocation={userLocation} />
            </div>
          </div>

          <div className="space-y-4">
            <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                ML Recommendation
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {recommendation.station === "AVOID"
                  ? "Avoid charging now"
                  : `Go to Station ${recommendation.station}`}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {recommendation.reason}
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Vehicle
              </p>

              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Battery</span>
                  <span className="text-sm font-bold">{battery}%</span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={battery}
                  onChange={(event) =>
                    setManualBattery(Number(event.target.value))
                  }
                  className="w-full"
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Estimated range
                  </span>
                  <span className="text-sm font-bold">{batteryRange} km</span>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Grid status
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Headroom</span>
                <span className="text-sm font-bold">
                  {displayData.grid.headroom}%
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    displayData.grid.status === "RED"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {displayData.grid.status}
                </span>
              </div>
            </section>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {stations.map((station) => {
            const isRecommended = recommendation.station === station.id;

            return (
              <article
                key={station.id}
                className={`rounded-3xl border p-5 shadow-card ${
                  isRecommended
                    ? "border-success bg-success/10"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Station {station.id}</h3>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      station.loadStatus === "RED"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {station.loadStatus}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>Load: {station.load}%</p>
                  <p>Waiting time: {station.waitingTime} min</p>
                  <p>Occupancy: {station.occupancy}/3</p>
                </div>

                {isRecommended && (
                  <p className="mt-4 rounded-xl bg-success/10 px-3 py-2 text-xs font-bold text-success">
                    Recommended station
                  </p>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
};

export default Index;
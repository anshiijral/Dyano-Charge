import { useEffect, useMemo, useState } from "react";

import { BangaloreMap } from "@/components/ev/BangaloreMap";
import {
  subscribeToDashboardData,
  writeRecommendationToFirebase,
  type DashboardData,
} from "@/services/stationService";

import { bangaloreLocations } from "@/lib/bangaloreLocations";
import { calculateDistanceKm } from "@/lib/distance";
import { getRecommendation } from "@/lib/decisionLogic";

const stationIds = ["A", "B", "C"] as const;

function normalizeLocationName(value: string) {
  return value
    .trim()
    .replace(/,\s*Bangalore$/i, "")
    .toLowerCase();
}

const Index = () => {
  const [data, setData] = useState<DashboardData | null>(null);

  const [manualBattery, setManualBattery] = useState(45);
  const [locationInput, setLocationInput] = useState("Indiranagar, Bangalore");

  useEffect(() => {
    const unsubscribe = subscribeToDashboardData((live) => setData(live));
    return () => unsubscribe();
  }, []);

  const userLocation = useMemo(() => {
    const typed = normalizeLocationName(locationInput);

    return (
      bangaloreLocations.find(
        (location) => normalizeLocationName(location.name) === typed
      ) ??
      bangaloreLocations.find(
        (location) =>
          `${normalizeLocationName(location.name)}, bangalore` === typed
      ) ??
      null
    );
  }, [locationInput]);

  const displayData = useMemo(() => {
    if (!data || !userLocation) return null;

    const updatedData: DashboardData = {
      ...data,
      vehicle: {
        ...data.vehicle,
        battery: manualBattery,
      },
      stations: {
        A: {
          ...data.stations.A,
          distance: calculateDistanceKm(
            userLocation.lat,
            userLocation.lng,
            data.stations.A.lat,
            data.stations.A.lng
          ),
        },
        B: {
          ...data.stations.B,
          distance: calculateDistanceKm(
            userLocation.lat,
            userLocation.lng,
            data.stations.B.lat,
            data.stations.B.lng
          ),
        },
        C: {
          ...data.stations.C,
          distance: calculateDistanceKm(
            userLocation.lat,
            userLocation.lng,
            data.stations.C.lat,
            data.stations.C.lng
          ),
        },
      },
    };

    return updatedData;
  }, [data, userLocation, manualBattery]);

  const calculatedRecommendation = useMemo(() => {
    if (!displayData) return null;
    return getRecommendation(displayData);
  }, [displayData]);

  useEffect(() => {
    if (!calculatedRecommendation || !data) return;

    const currentStation = data.recommendation?.station;
    const currentReason = data.recommendation?.reason;
    const nextLedStatus =
      calculatedRecommendation.station === "AVOID" ? "RED" : "GREEN";

    const currentLedStatus = data.recommendation?.ledStatus;

    const changed =
      currentStation !== calculatedRecommendation.station ||
      currentReason !== calculatedRecommendation.reason ||
      currentLedStatus !== nextLedStatus;

    if (changed) {
      writeRecommendationToFirebase(
        calculatedRecommendation.station,
        calculatedRecommendation.reason
      );
    }
  }, [calculatedRecommendation, data]);

  if (!displayData || !userLocation || !calculatedRecommendation) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-card">
          <p className="text-sm font-semibold">
            Loading live DyanoCharge data...
          </p>
          {!userLocation && (
            <p className="mt-2 text-xs text-muted-foreground">
              Please type a valid Bangalore area from the suggestions.
            </p>
          )}
        </div>
      </main>
    );
  }

  const battery = displayData.vehicle.battery;
  const batteryRange = Math.round((battery / 100) * 335);

  const gridStatus = displayData.grid?.status ?? "GREEN";
  const gridHeadroom = displayData.grid?.headroom ?? 0;

  const recommendation = {
    station: calculatedRecommendation.station,
    ledStatus:
      calculatedRecommendation.station === "AVOID" ? "RED" : "GREEN",
    reason: calculatedRecommendation.reason,
  };

  const stations = stationIds.map((id) => ({
    id,
    ...displayData.stations[id],
  }));

  const recommendedStation =
    recommendation.station === "AVOID"
      ? null
      : displayData.stations[recommendation.station];

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Smart EV Charging Recommendation System
              </p>

              <h1 className="text-3xl font-extrabold tracking-tight">
                Dyano<span className="text-success">Charge</span>
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Enter your location and vehicle battery to find the safest
                reachable charging station.
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

        <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your location
              </label>

              <input
                list="bangalore-location-list"
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                placeholder="Type your Bangalore area"
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-success/30"
              />

              <datalist id="bangalore-location-list">
                {bangaloreLocations.map((location) => (
                  <option
                    key={location.name}
                    value={`${location.name}, Bangalore`}
                  />
                ))}
              </datalist>

              <p className="mt-2 text-xs text-muted-foreground">
                Choose from suggestions for accurate distance calculation.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Vehicle battery
              </label>

              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={battery}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (Number.isNaN(value)) return;
                    setManualBattery(Math.max(0, Math.min(100, value)));
                  }}
                  className="w-28 rounded-2xl border border-border bg-background px-4 py-3 text-center text-xl font-bold outline-none focus:ring-2 focus:ring-success/30"
                />

                <span className="text-xl font-bold text-muted-foreground">
                  %
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Estimated range: {batteryRange} km
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
            <BangaloreMap data={displayData} userLocation={userLocation} />
          </div>

          <div className="space-y-4">
            <section
              className={`rounded-3xl border p-5 shadow-card ${
                recommendation.station === "AVOID"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-success/30 bg-success/10"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Recommended station
              </p>

              <h2 className="mt-2 text-2xl font-extrabold">
                {recommendation.station === "AVOID"
                  ? "Avoid Charging Now"
                  : `Go to Station ${recommendation.station}`}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {recommendation.reason}
              </p>

              {recommendedStation && (
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-2xl bg-card p-3">
                    <p className="text-xs text-muted-foreground">Load</p>
                    <p className="font-bold">{recommendedStation.load}%</p>
                  </div>

                  <div className="rounded-2xl bg-card p-3">
                    <p className="text-xs text-muted-foreground">
                      Occupancy
                    </p>
                    <p className="font-bold">
                      {recommendedStation.occupancy}/3
                    </p>
                  </div>

                  <div className="rounded-2xl bg-card p-3">
                    <p className="text-xs text-muted-foreground">Wait</p>
                    <p className="font-bold">
                      {recommendedStation.waitingTime} min
                    </p>
                  </div>

                  <div className="rounded-2xl bg-card p-3">
                    <p className="text-xs text-muted-foreground">
                      Distance
                    </p>
                    <p className="font-bold">
                      {recommendedStation.distance} km
                    </p>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Grid status
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Headroom
                </span>
                <span className="text-sm font-bold">{gridHeadroom}%</span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    gridStatus === "RED"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {gridStatus}
                </span>
              </div>
            </section>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold">All station data</h2>

          <div className="grid gap-4 md:grid-cols-3">
            {stations.map((station) => {
              const isRecommended = recommendation.station === station.id;
              const isUnsafe =
                station.loadStatus === "RED" ||
                station.load >= 85 ||
                station.occupancy >= 3 ||
                station.waitingTime > 45;

              return (
                <article
                  key={station.id}
                  className={`rounded-3xl border p-5 shadow-card ${
                    isRecommended
                      ? "border-success bg-success/10"
                      : isUnsafe
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">
                      Station {station.id}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        isUnsafe
                          ? "bg-destructive/10 text-destructive"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {isUnsafe ? "RED" : "GREEN"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <p>Distance: {station.distance} km</p>
                    <p>Load: {station.load}%</p>
                    <p>Waiting time: {station.waitingTime} min</p>
                    <p>Occupancy: {station.occupancy}/3</p>
                    <p>Available slots: {Math.max(0, 3 - station.occupancy)}</p>
                  </div>

                  {isRecommended && (
                    <p className="mt-4 rounded-xl bg-success/10 px-3 py-2 text-xs font-bold text-success">
                      Recommended station
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Index;
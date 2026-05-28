import type { DashboardData } from "@/services/stationService";
import type { BangaloreLocation } from "@/lib/bangaloreLocations";
import { calculateDistanceKm, calculateRangeKm } from "@/lib/distance";

type Props = {
  data: DashboardData;
  userLocation: BangaloreLocation;
};

export function BangaloreMap({ data, userLocation }: Props) {
  const batteryRange = calculateRangeKm(data.vehicle.battery);
  const recommendedStation = data.recommendation?.station;

  const stations = [
    { id: "A", ...data.stations.A },
    { id: "B", ...data.stations.B },
    { id: "C", ...data.stations.C },
  ] as const;

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    userLocation.lng - 0.06
  }%2C${userLocation.lat - 0.04}%2C${userLocation.lng + 0.06}%2C${
    userLocation.lat + 0.04
  }&layer=mapnik&marker=${userLocation.lat}%2C${userLocation.lng}`;

  return (
    <div className="space-y-3">
      <div className="h-[260px] w-full overflow-hidden rounded-2xl border border-border shadow-card">
        <iframe
          title="Bangalore Map"
          src={mapUrl}
          className="h-full w-full border-0"
        />
      </div>

      <div className="rounded-2xl border border-border bg-background/80 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Selected location
          </p>

          <span className="text-xs font-semibold text-primary">
            {userLocation.name}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Battery range: {batteryRange} km
        </p>

        <div className="grid gap-2">
          {stations.map((station) => {
            const distanceKm = calculateDistanceKm(
              userLocation.lat,
              userLocation.lng,
              station.lat,
              station.lng
            );

            const reachable = distanceKm <= batteryRange;
            const isRecommended = recommendedStation === station.id;

            return (
              <div
                key={station.id}
                className={`rounded-xl border p-3 text-xs ${
                  isRecommended
                    ? "border-success bg-success/10"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold">Station {station.id}</p>

                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      station.loadStatus === "RED"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {station.loadStatus}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-1 text-muted-foreground">
                  <p>Distance: {distanceKm} km</p>
                  <p>Reachable: {reachable ? "Yes" : "No"}</p>
                  <p>Load: {station.load}%</p>
                  <p>Wait: {station.waitingTime} min</p>
                  <p>Occupancy: {station.occupancy}/3</p>
                  <p>
                    {isRecommended
                      ? "Recommended"
                      : reachable
                      ? "Available check"
                      : "Out of range"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
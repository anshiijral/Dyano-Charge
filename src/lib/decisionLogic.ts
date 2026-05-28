import type { DashboardData } from "@/services/stationService";

type StationName = "A" | "B" | "C" | "AVOID";

export type RecommendationResult = {
  station: StationName;
  reason: string;
};

function stationScore(station: {
  load: number;
  occupancy: number;
  distance: number;
  waitingTime: number;
}) {
  return (
    station.load * 0.45 +
    station.waitingTime * 0.3 +
    station.distance * 0.2 +
    station.occupancy * 15
  );
}

function isStationSafe(
  station: {
    load: number;
    occupancy: number;
    distance: number;
    waitingTime: number;
  },
  battery: number
) {
  if (station.occupancy >= 3) return false;
  if (station.load >= 95) return false;
  if (station.waitingTime > 45) return false;

  if (battery < 15 && station.distance > 1.5) return false;
  if (battery < 10 && station.distance > 0.8) return false;

  return true;
}

export function getRecommendation(data: DashboardData): RecommendationResult {
  if (data.grid.headroom <= 5) {
    return {
      station: "AVOID",
      reason:
        "Grid headroom is critically low, so no new charging session is recommended.",
    };
  }

  const battery = data.vehicle.battery;

  const candidates = (["A", "B", "C"] as const)
    .map((name) => {
      const station = data.stations[name];

      return {
        name,
        station,
        score: stationScore(station),
        safe: isStationSafe(station, battery),
      };
    })
    .filter((item) => item.safe);

  if (candidates.length === 0) {
    return {
      station: "AVOID",
      reason:
        "No station is currently safe, reachable, and available for charging.",
    };
  }

  candidates.sort((a, b) => a.score - b.score);

  const best = candidates[0];

  return {
    station: best.name,
    reason: `Station ${best.name} is recommended because it has the best balance of load, waiting time, distance, occupancy, and battery reachability.`,
  };
}
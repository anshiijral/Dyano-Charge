import { ref, onValue, set } from "firebase/database";
import { database } from "@/lib/firebase";

export type StationData = {
  load: number;
  loadStatus: "GREEN" | "RED";
  occupancy: number;
  occupied: boolean;
  distance: number;
  waitingTime: number;
  sensorDistanceCm?: number;
};

export type DashboardData = {
  stations: {
    A: StationData;
    B: StationData;
    C: StationData;
  };
  grid: {
    headroom: number;
    status: "GREEN" | "RED";
  };
  vehicle: {
    battery: number;
  };
  recommendation?: {
    station: "A" | "B" | "C" | "AVOID";
    ledStatus: "GREEN" | "RED";
    reason: string;
    updatedAt?: string;
  };
};

export function subscribeToDashboardData(
  callback: (data: DashboardData) => void
) {
  const rootRef = ref(database, "/");

  return onValue(rootRef, (snapshot) => {
    const data = snapshot.val();

    if (data) {
      callback(data as DashboardData);
    }
  });
}

export async function writeRecommendationToFirebase(
  station: "A" | "B" | "C" | "AVOID",
  reason: string
) {
  const ledStatus = station === "AVOID" ? "RED" : "GREEN";

  await set(ref(database, "/recommendation"), {
    station,
    ledStatus,
    reason,
    updatedAt: new Date().toISOString(),
  });
}
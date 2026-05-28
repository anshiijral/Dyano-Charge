import { useEffect, useState } from "react";
import {
  subscribeToDashboardData,
  writeRecommendationToFirebase,
  type DashboardData,
} from "@/services/stationService";
import { getRecommendation } from "@/lib/decisionLogic";

export default function FirebaseTest() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToDashboardData(async (liveData) => {
      setData(liveData);

      const result = getRecommendation(liveData);
      await writeRecommendationToFirebase(result.station, result.reason);
    });

    return () => unsubscribe();
  }, []);

  if (!data) {
    return <div className="p-6">Loading Firebase data...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">DyanoCharge Firebase Test</h1>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold">Station A</h2>
        <p>Load: {data.stations.A.load}%</p>
        <p>Status: {data.stations.A.loadStatus}</p>
        <p>Occupancy: {data.stations.A.occupancy}</p>
        <p>Waiting Time: {data.stations.A.waitingTime} min</p>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold">Station B</h2>
        <p>Load: {data.stations.B.load}%</p>
        <p>Status: {data.stations.B.loadStatus}</p>
        <p>Occupancy: {data.stations.B.occupancy}</p>
        <p>Waiting Time: {data.stations.B.waitingTime} min</p>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold">Station C</h2>
        <p>Load: {data.stations.C.load}%</p>
        <p>Status: {data.stations.C.loadStatus}</p>
        <p>Occupancy: {data.stations.C.occupancy}</p>
        <p>Waiting Time: {data.stations.C.waitingTime} min</p>
      </div>

      <div className="border rounded-lg p-4 bg-green-50">
        <h2 className="font-semibold">Recommendation</h2>
        <p>Station: {data.recommendation?.station}</p>
        <p>LED Status: {data.recommendation?.ledStatus}</p>
        <p>Reason: {data.recommendation?.reason}</p>
      </div>
    </div>
  );
}
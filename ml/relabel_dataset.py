import pandas as pd

df = pd.read_csv("dyanocharge_dataset.csv")
df.columns = df.columns.str.strip()

for column in df.columns:
    if df[column].dtype == "object":
        df[column] = df[column].astype(str).str.strip().str.upper()

def station_score(load, occupancy, distance, waiting_time):
    occupancy_penalty = 100 if occupancy > 0 else 0
    return (
        load * 0.45 +
        waiting_time * 0.30 +
        distance * 0.20 +
        occupancy_penalty
    )

def is_station_valid(load, occupancy, distance, waiting_time, battery):
    # Occupancy is treated as number of occupied slots, not full/empty.
    # Only reject if station is nearly/full occupied.
    if occupancy >= 3:
        return False

    # Only reject extremely overloaded stations.
    if load >= 95:
        return False

    # Only reject very long waiting time.
    if waiting_time > 45:
        return False

    # Battery-aware reachability rule.
    if battery < 15 and distance > 1.5:
        return False

    if battery < 10 and distance > 0.8:
        return False

    return True

def decide(row):
    grid_headroom = row["GRID_HEADROOM"]
    battery = row["BATTERY"]

    # AVOID only for critical grid condition
    if grid_headroom <= 5:
        return "AVOID"

    candidates = []

    stations = ["A", "B", "C"]

    for station in stations:
        load = row[f"{station}_LOAD"]
        occupancy = row[f"{station}_OCCUPANCY"]
        distance = row[f"{station}_DISTANCE"]
        waiting_time = row[f"{station}_WAITING_TIME"]

        if is_station_valid(load, occupancy, distance, waiting_time, battery):
            score = station_score(load, occupancy, distance, waiting_time)
            candidates.append((station, score))

    if len(candidates) == 0:
        return "AVOID"

    candidates.sort(key=lambda x: x[1])
    return candidates[0][0]

df["RECOMMENDED"] = df.apply(decide, axis=1)

df.to_csv("dyanocharge_dataset_relabelled.csv", index=False)

print("Relabelled dataset saved as dyanocharge_dataset_relabelled.csv")
print()
print("New label counts:")
print(df["RECOMMENDED"].value_counts())
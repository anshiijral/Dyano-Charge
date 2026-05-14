#!/usr/bin/env python3
"""
DyanoCharge Dataset Generator
Generates simulated data for EV charging station recommendation system
Output: CSV file with columns matching the project requirements
"""

import pandas as pd
import random
import numpy as np
from datetime import datetime

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

def generate_station_load():
    """Generate station load percentage (0-100)"""
    return random.randint(20, 95)

def generate_occupancy():
    """Generate occupancy (0-3 cars per station)"""
    return random.randint(0, 3)

def generate_distance():
    """Generate distance in km (0.5-10km)"""
    return round(random.uniform(0.5, 10), 1)

def generate_battery():
    """Generate vehicle battery percentage (15-80)"""
    return random.randint(15, 80)

def calculate_waiting_time(occupancy, load):
    """Calculate estimated waiting time based on occupancy and load"""
    base_time = occupancy * 8  # Each car takes ~8 minutes
    load_factor = (load / 100) * 10  # Load adds up to 10 minutes
    waiting_time = base_time + load_factor + random.uniform(-2, 2)
    return max(0, round(waiting_time, 1))

def calculate_grid_headroom(a_load, b_load, c_load, max_capacity=250):
    """
    Calculate remaining grid capacity
    Grid headroom = Max capacity - Total current load
    """
    total_load = a_load + b_load + c_load
    
    # If total exceeds max, normalize loads
    if total_load > max_capacity:
        scale = max_capacity / total_load
        a_load = int(a_load * scale)
        b_load = int(b_load * scale)
        c_load = int(c_load * scale)
        total_load = max_capacity
    
    remaining = max_capacity - total_load
    headroom_percentage = (remaining / max_capacity) * 100
    
    return round(headroom_percentage, 1), a_load, b_load, c_load

def recommend_station(stations_data, battery, grid_headroom):
    """
    Decision Tree Logic:
    Recommend the best station based on multiple factors
    
    Outputs:
    - "A", "B", "C": Recommended station
    - "FULL": All stations occupied
    - "WAIT": Significant wait expected
    - "AVOID": Dangerous/unavailable
    """
    
    safe_stations = []
    
    for station_id in ['A', 'B', 'C']:
        station = stations_data[station_id]
        load = station['load']
        occupancy = station['occupancy']
        distance = station['distance']
        
        # HARD RULES - SAFETY CHECK
        
        # Rule 1: Station is full
        if occupancy >= 3:
            continue
        
        # Rule 2: Station load is critical (>85%)
        if load > 85:
            continue
        
        # Rule 3: Grid is overloaded (<15% headroom)
        if grid_headroom < 15:
            continue
        
        # Rule 4: Vehicle can't reach station (low battery + far)
        if battery < 20 and distance > 1.5:
            continue
        
        # If station passed all safety checks, it's safe
        safe_stations.append({
            'id': station_id,
            'load': load,
            'distance': distance,
            'score': -load - distance  # Lower load + closer = higher score
        })
    
    # If no safe stations, return AVOID
    if not safe_stations:
        return "AVOID"
    
    # Among safe stations, pick the best one
    best = max(safe_stations, key=lambda x: x['score'])
    return best['id']

def generate_dynocharge_dataset(num_records=1000):
    """
    Generate complete DyanoCharge dataset
    
    Parameters:
    -----------
    num_records : int
        Number of rows to generate (default 100)
    
    Returns:
    --------
    pandas.DataFrame
        Dataset with columns as shown in project image
    """
    
    data = []
    
    for i in range(num_records):
        # === GENERATE STATION A ===
        a_load = generate_station_load()
        a_occupancy = generate_occupancy()
        a_distance = generate_distance()
        a_waiting_time = calculate_waiting_time(a_occupancy, a_load)
        
        # === GENERATE STATION B ===
        b_load = generate_station_load()
        b_occupancy = generate_occupancy()
        b_distance = generate_distance()
        b_waiting_time = calculate_waiting_time(b_occupancy, b_load)
        
        # === GENERATE STATION C ===
        c_load = generate_station_load()
        c_occupancy = generate_occupancy()
        c_distance = generate_distance()
        c_waiting_time = calculate_waiting_time(c_occupancy, c_load)
        
        # === CALCULATE GRID HEADROOM ===
        grid_headroom, a_load, b_load, c_load = calculate_grid_headroom(
            a_load, b_load, c_load
        )
        
        # === GENERATE VEHICLE BATTERY ===
        battery = generate_battery()
        
        # === PREPARE STATION DATA FOR RECOMMENDATION ===
        stations_data = {
            'A': {'load': a_load, 'occupancy': a_occupancy, 'distance': a_distance},
            'B': {'load': b_load, 'occupancy': b_occupancy, 'distance': b_distance},
            'C': {'load': c_load, 'occupancy': c_occupancy, 'distance': c_distance},
        }
        
        # === GET RECOMMENDATION ===
        recommended = recommend_station(stations_data, battery, grid_headroom)
        
        # === ADD LOAD THRESHOLD STATUS ===
        def get_threshold_status(load):
            """Get color status: Green/Yellow/Red"""
            if load <= 60:
                return "GREEN"
            elif load <= 85:
                return "YELLOW"
            else:
                return "RED"
        
        a_status = get_threshold_status(a_load)
        b_status = get_threshold_status(b_load)
        c_status = get_threshold_status(c_load)
        grid_status = "GREEN" if grid_headroom > 30 else "YELLOW" if grid_headroom > 15 else "RED"
        
        # === STORE ROW ===
        data.append({
            # Station A
            'A_LOAD': a_load,
            'A_LOAD_STATUS': a_status,
            'A_OCCUPANCY': a_occupancy,
            'A_DISTANCE': a_distance,
            'A_WAITING_TIME': a_waiting_time,
            
            # Station B
            'B_LOAD': b_load,
            'B_LOAD_STATUS': b_status,
            'B_OCCUPANCY': b_occupancy,
            'B_DISTANCE': b_distance,
            'B_WAITING_TIME': b_waiting_time,
            
            # Station C
            'C_LOAD': c_load,
            'C_LOAD_STATUS': c_status,
            'C_OCCUPANCY': c_occupancy,
            'C_DISTANCE': c_distance,
            'C_WAITING_TIME': c_waiting_time,
            
            # System Data
            'GRID_HEADROOM': grid_headroom,
            'GRID_STATUS': grid_status,
            'BATTERY': battery,
            
            # Output
            'RECOMMENDED': recommended
        })
    
    df = pd.DataFrame(data)
    return df

def print_dataset_info(df):
    """Print useful information about the dataset"""
    print("\n" + "="*80)
    print("DYNOCHARGE DATASET INFORMATION")
    print("="*80)
    
    print(f"\nDataset shape: {df.shape[0]} rows × {df.shape[1]} columns")
    
    print("\n--- COLUMN DESCRIPTIONS ---")
    print("A_LOAD            : Station A load percentage (0-100)")
    print("A_LOAD_STATUS     : Station A threshold (GREEN/YELLOW/RED)")
    print("A_OCCUPANCY       : Station A occupied slots (0-3)")
    print("A_DISTANCE        : Distance to Station A (km)")
    print("A_WAITING_TIME    : Est. wait time at Station A (minutes)")
    print("B_LOAD, B_LOAD_STATUS, B_OCCUPANCY, B_DISTANCE, B_WAITING_TIME: Same for Station B")
    print("C_LOAD, C_LOAD_STATUS, C_OCCUPANCY, C_DISTANCE, C_WAITING_TIME: Same for Station C")
    print("GRID_HEADROOM     : Remaining grid capacity (%)")
    print("GRID_STATUS       : Grid threshold (GREEN/YELLOW/RED)")
    print("BATTERY           : Vehicle battery percentage (0-100)")
    print("RECOMMENDED       : ML recommendation (A/B/C/AVOID/WAIT/FULL)")
    
    print("\n--- RECOMMENDATION DISTRIBUTION ---")
    print(df['RECOMMENDED'].value_counts())
    
    print("\n--- LOAD STATISTICS ---")
    for station in ['A', 'B', 'C']:
        col = f'{station}_LOAD'
        print(f"{station}: Mean={df[col].mean():.1f}%, Min={df[col].min()}%, Max={df[col].max()}%")
    
    print(f"\nGRID HEADROOM: Mean={df['GRID_HEADROOM'].mean():.1f}%, Min={df['GRID_HEADROOM'].min():.1f}%")
    print(f"BATTERY: Mean={df['BATTERY'].mean():.1f}%, Min={df['BATTERY'].min()}%, Max={df['BATTERY'].max()}%")
    
    print("\n" + "="*80)

def save_dataset(df, filename='dyanocharge_dataset.csv'):
    """Save dataset to CSV file"""
    df.to_csv(filename, index=False)
    print(f"\n✓ Dataset saved to '{filename}'")
    print(f"  Location: {filename}")
    print(f"  Rows: {len(df)}, Columns: {len(df.columns)}")

def show_sample_rows(df, num_rows=10):
    """Display sample rows"""
    print("\n--- SAMPLE DATA (First 10 rows) ---\n")
    # Show only key columns for readability
    sample_cols = [
        'A_LOAD', 'A_OCCUPANCY', 'A_DISTANCE',
        'B_LOAD', 'B_OCCUPANCY', 'B_DISTANCE',
        'C_LOAD', 'C_OCCUPANCY', 'C_DISTANCE',
        'BATTERY', 'RECOMMENDED'
    ]
    print(df[sample_cols].head(num_rows).to_string())

if __name__ == "__main__":
    print("\n🔋 DyanoCharge Dataset Generator")
    print("Generating 100 sample records...\n")
    
    # Generate dataset
    df = generate_dynocharge_dataset(num_records=1000)
    
    # Display information
    print_dataset_info(df)
    
    # Show sample rows
    show_sample_rows(df)
    
    # Save to file
    save_dataset(df, 'dyanocharge_dataset.csv')
    
    print("\n✓ Dataset generation complete!")
    print("  Use 'dyanocharge_dataset.csv' for ML model training")


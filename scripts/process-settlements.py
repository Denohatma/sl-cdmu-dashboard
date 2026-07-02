#!/usr/bin/env python3
"""Process DRE Atlas settlement CSV into optimized JSON files for the dashboard."""

import csv
import json
from collections import defaultdict
from pathlib import Path

INPUT_CSV = Path(__file__).parent.parent.parent / "References" / "sierra_leone_dre_atlas_settlements.csv"
OUTPUT_DIR = Path(__file__).parent.parent / "data"

def safe_float(val, default=0.0):
    try:
        return float(val)
    except (ValueError, TypeError):
        return default

def safe_int(val, default=0):
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default

def process():
    with open(INPUT_CSV, newline="") as f:
        rows = list(csv.DictReader(f))

    print(f"Processing {len(rows)} settlements...")

    features = []
    details = {}
    district_agg = defaultdict(lambda: {
        "region": "",
        "settlements": 0,
        "population": 0,
        "electrified": 0,
        "unelectrified": 0,
        "total_demand": 0.0,
        "total_buildings": 0,
        "education_facilities": 0,
        "health_facilities": 0,
        "avg_dist_transmission": 0.0,
        "avg_pv_value": 0.0,
        "security_low": 0,
        "security_medium": 0,
        "security_high": 0,
        "_dist_sum": 0.0,
        "_pv_sum": 0.0,
    })

    for r in rows:
        geohash = r["geohash"]
        lat = round(safe_float(r["lat"]), 5)
        lon = round(safe_float(r["lon"]), 5)
        pop = safe_int(r["population"])
        nightlight = r["has_nightlight"] == "True"
        has_edu = r["has_education_facility"] == "True"
        has_health = r["has_health_facility"] == "True"
        dist_tx = round(safe_float(r["distance_to_existing_transmission_lines"]), 1)
        dist_planned_tx = round(safe_float(r["distance_to_planned_transmission_lines"]), 1)
        pv = round(safe_float(r["pv_value"]), 1)
        demand = round(safe_float(r["demand"]), 1)
        num_buildings = safe_int(r["num_buildings"])
        district = r["admin_cgaz_2"]
        region = r["admin_cgaz_1"]
        risk = r["security_risk"]

        feature = {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lon, lat]},
            "properties": {
                "id": geohash,
                "name": r["village_name"],
                "district": district,
                "region": region,
                "population": pop,
                "has_nightlight": nightlight,
                "has_education": has_edu,
                "has_health": has_health,
                "dist_transmission": dist_tx,
                "dist_planned_transmission": dist_planned_tx,
                "pv_value": pv,
                "demand": demand,
                "security_risk": risk,
                "num_buildings": num_buildings,
            },
        }
        features.append(feature)

        details[geohash] = {
            "village_name": r["village_name"],
            "region": region,
            "district": district,
            "population": pop,
            "num_buildings": num_buildings,
            "large_buildings": safe_int(r["large_buildings"]),
            "medium_buildings": safe_int(r["medium_buildings"]),
            "small_buildings": safe_int(r["small_buildings"]),
            "very_small_structures": safe_int(r["very_small_structures"]),
            "building_density": round(safe_float(r["building_density_percent"]), 2),
            "closest_distance_water": round(safe_float(r["closest_distance_water"]), 2),
            "main_road_access": r["main_road_access"] == "True",
            "dist_main_road_km": round(safe_float(r["dist_main_road_km"]), 2),
            "nearest_hub_name": r["nearest_hub_name"],
            "dist_nearest_hub_km": round(safe_float(r["dist_nearest_hub_km"]), 2),
            "num_education_facilities": safe_int(r["num_education_facilities"]),
            "num_health_facilities": safe_int(r["num_health_facilities"]),
            "mean_rwi": round(safe_float(r["mean_rwi"]), 2),
            "distance_to_existing_transmission_lines": dist_tx,
            "distance_to_planned_transmission_lines": dist_planned_tx,
            "has_nightlight": nightlight,
            "pv_value": pv,
            "crop_types": r["crop_types"],
            "ag_area": round(safe_float(r["ag_area"]), 1),
            "ag_value": round(safe_float(r["ag_value"])),
            "ag_yield": round(safe_float(r["ag_yield"]), 1),
            "security_risk": risk,
            "num_connections": safe_int(r["num_connections"]),
            "demand": demand,
            "demand_connection": round(safe_float(r["demand_connection"]), 3),
        }

        d = district_agg[district]
        d["region"] = region
        d["settlements"] += 1
        d["population"] += pop
        if nightlight:
            d["electrified"] += 1
        else:
            d["unelectrified"] += 1
        d["total_demand"] += demand
        d["total_buildings"] += num_buildings
        if has_edu:
            d["education_facilities"] += safe_int(r["num_education_facilities"])
        if has_health:
            d["health_facilities"] += safe_int(r["num_health_facilities"])
        d["_dist_sum"] += dist_tx
        d["_pv_sum"] += pv
        risk_key = f"security_{risk}"
        if risk_key in d:
            d[risk_key] += 1

    for d_name, d in district_agg.items():
        n = d["settlements"]
        d["avg_dist_transmission"] = round(d["_dist_sum"] / n, 1) if n else 0
        d["avg_pv_value"] = round(d["_pv_sum"] / n, 1) if n else 0
        d["total_demand"] = round(d["total_demand"], 1)
        del d["_dist_sum"]
        del d["_pv_sum"]

    geojson = {"type": "FeatureCollection", "features": features}
    points_path = OUTPUT_DIR / "settlements-points.json"
    with open(points_path, "w") as f:
        json.dump(geojson, f, separators=(",", ":"))
    points_size = points_path.stat().st_size / 1024 / 1024
    print(f"  settlements-points.json: {len(features)} features, {points_size:.1f} MB")

    detail_path = OUTPUT_DIR / "settlements-detail.json"
    with open(detail_path, "w") as f:
        json.dump(details, f, separators=(",", ":"))
    detail_size = detail_path.stat().st_size / 1024 / 1024
    print(f"  settlements-detail.json: {len(details)} entries, {detail_size:.1f} MB")

    districts_path = OUTPUT_DIR / "districts.json"
    with open(districts_path, "w") as f:
        json.dump(dict(district_agg), f, indent=2)
    print(f"  districts.json: {len(district_agg)} districts")

    print("Done!")

if __name__ == "__main__":
    process()

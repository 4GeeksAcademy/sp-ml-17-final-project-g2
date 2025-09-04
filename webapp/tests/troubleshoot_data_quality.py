#!/usr/bin/env python3
"""
Quick data quality checker for specific problematic cases
Focus on "teeth curve" and duplicate data issues
"""

import requests
import json
import matplotlib.pyplot as plt
import numpy as np
from typing import List, Dict, Any

BASE_URL = "http://localhost:3000"
PREDICT_ENDPOINT = f"{BASE_URL}/api/predict"

def get_prediction_data(country: str, indicator: str, year: int = 2027) -> Dict[str, Any]:
    """Get prediction data for a country/indicator"""
    payload = {"country": country, "indicator": indicator, "year": year}
    
    try:
        response = requests.post(PREDICT_ENDPOINT, json=payload, timeout=15)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Error getting data for {country}: {e}")
        return {}

def analyze_historical_data(data: List[Dict[str, Any]], country: str, indicator: str):
    """Analyze historical data for quality issues"""
    if not data:
        print(f"❌ {country}: No historical data")
        return
    
    years = [point["year"] for point in data]
    values = [point["value"] for point in data]
    
    print(f"\n📊 {country} - {indicator[:30]}...")
    print(f"   📅 Years: {min(years)} to {max(years)} ({len(data)} points)")
    print(f"   📈 Values: {min(values):.1f}% to {max(values):.1f}%")
    
    # Check for duplicates
    unique_years = set(years)
    if len(years) != len(unique_years):
        duplicates = len(years) - len(unique_years)
        print(f"   ⚠️  ISSUE: {duplicates} duplicate years detected!")
    else:
        print(f"   ✅ No duplicate years")
    
    # Check for extreme jumps
    extreme_jumps = []
    for i in range(1, len(values)):
        jump = abs(values[i] - values[i-1])
        if jump > 20:  # More than 20% change
            extreme_jumps.append((years[i-1], years[i], values[i-1], values[i], jump))
    
    if extreme_jumps:
        print(f"   ⚠️  ISSUE: {len(extreme_jumps)} extreme jumps detected:")
        for year1, year2, val1, val2, jump in extreme_jumps[:3]:  # Show first 3
            print(f"      {year1}→{year2}: {val1:.1f}% → {val2:.1f}% (Δ{jump:.1f}%)")
    else:
        print(f"   ✅ No extreme jumps")
    
    # Show recent trend
    if len(data) >= 3:
        recent_data = sorted(data, key=lambda x: x["year"])[-5:]  # Last 5 points
        recent_years = [p["year"] for p in recent_data]
        recent_values = [p["value"] for p in recent_data]
        
        print(f"   📈 Recent trend: ", end="")
        for i, (year, value) in enumerate(zip(recent_years, recent_values)):
            print(f"{year}:{value:.1f}%", end="")
            if i < len(recent_years) - 1:
                print(" → ", end="")
        print()

def analyze_predictions(predictions: List[Dict[str, Any]], country: str):
    """Analyze prediction quality"""
    if not predictions:
        print(f"   ❌ No predictions for {country}")
        return
    
    years = [p["year"] for p in predictions]
    values = [p["value"] for p in predictions]
    
    print(f"   🔮 Predictions: {min(years)} to {max(years)} ({len(predictions)} points)")
    print(f"   📊 Range: {min(values):.1f}% to {max(values):.1f}%")
    
    # Check if all predictions are the same (bad)
    unique_values = set(round(v, 1) for v in values)
    if len(unique_values) == 1:
        print(f"   ❌ ISSUE: All predictions identical ({values[0]:.1f}%)")
    elif len(unique_values) == len(values):
        print(f"   ✅ All predictions unique")
    else:
        print(f"   ✅ {len(unique_values)} unique prediction values")
    
    # Check for reasonable progression
    max_change = 0
    for i in range(1, len(values)):
        change = abs(values[i] - values[i-1])
        max_change = max(max_change, change)
    
    if max_change > 10:
        print(f"   ⚠️  Large yearly change: {max_change:.1f}%")
    else:
        print(f"   ✅ Reasonable progression (max {max_change:.1f}%/year)")

def main():
    """Main troubleshooting function"""
    print("🔍 ML Prediction API - Data Quality Troubleshooter")
    print("=" * 60)
    
    # Known problematic cases
    test_cases = [
        # Countries with known data issues
        ("Pakistan", "Literacy rate, adult total (% of people ages 15 and above)"),
        ("Nigeria", "Literacy rate, adult total (% of people ages 15 and above)"),
        ("India", "Literacy rate, adult total (% of people ages 15 and above)"),
        ("Bangladesh", "Literacy rate, adult total (% of people ages 15 and above)"),
        
        # High-performing countries (should be stable)
        ("Spain", "Literacy rate, adult total (% of people ages 15 and above)"),
        ("Germany", "Literacy rate, adult total (% of people ages 15 and above)"),
        ("France", "Literacy rate, adult total (% of people ages 15 and above)"),
        
        # Different indicator types
        ("Brazil", "School enrollment, primary (% gross)"),
        ("Mexico", "School enrollment, primary (% gross)"),
        ("Argentina", "School enrollment, primary (% gross)"),
    ]
    
    issues_found = 0
    total_tested = 0
    
    for country, indicator in test_cases:
        total_tested += 1
        result = get_prediction_data(country, indicator, 2028)
        
        if not result:
            issues_found += 1
            continue
        
        # Analyze historical data
        historical_data = result.get("historical_context", {}).get("historical_data", [])
        analyze_historical_data(historical_data, country, indicator)
        
        # Analyze predictions
        predictions = result.get("historical_context", {}).get("predictions", [])
        analyze_predictions(predictions, country)
        
        print("-" * 60)
    
    # Summary
    print(f"\n🏁 Troubleshooting Complete!")
    print(f"📊 Tested {total_tested} cases")
    if issues_found > 0:
        print(f"❌ Found issues in {issues_found} cases")
    else:
        print(f"✅ No major issues detected")
    
    print(f"\n💡 Quick Tests:")
    print(f"   • Check server logs for DEBUG messages")
    print(f"   • Verify database has clean, non-duplicate data")
    print(f"   • Test progressive predictions with long time ranges")

if __name__ == "__main__":
    main()

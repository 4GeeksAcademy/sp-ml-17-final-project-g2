#!/usr/bin/env python3
"""
Test script to verify database connection and API functionality
"""

import sys
import os
sys.path.append('/workspaces/sp-ml-17-final-project-g2/database')

from db_utils import EduInsightDB
import json

def test_database():
    """Test database connection and basic queries"""
    try:
        db = EduInsightDB('/workspaces/sp-ml-17-final-project-g2/database/eduinsight.db')
        
        print("🔍 Testing database connection...")
        
        # Test 1: Get countries
        countries = db.get_countries()
        print(f"✅ Found {len(countries)} countries")
        print(f"📍 Sample countries: {countries[:5]}")
        
        # Test 2: Get indicators  
        indicators = db.get_indicators()
        print(f"✅ Found {len(indicators)} indicators")
        print(f"📊 Sample indicators: {indicators[:3]}")
        
        # Test 3: Get data for a specific country
        if 'Spain' in countries:
            spain_data = db.get_country_performance('Spain', [2020, 2021, 2022])
            print(f"✅ Spain data: {len(spain_data)} records for 2020-2022")
            
        # Test 4: Get country summary
        if 'Spain' in countries:
            summary = db.get_country_summary('Spain')
            print(f"✅ Spain summary: {summary}")
            
        print("\n🎉 Database tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

if __name__ == "__main__":
    test_database()

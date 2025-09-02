#!/usr/bin/env python3
"""
Test: Full Phase 1 Integration
Purpose: Comprehensive test of database + API + data flow for Phase 1 implementation
"""

import sys
import os
import requests
import time

# Add database path for direct testing
sys.path.append('/workspaces/sp-ml-17-final-project-g2/database')
from db_utils import EduInsightDB

API_BASE = "http://localhost:3000/api"

def test_database_to_api_data_consistency():
    """Test 1: Verify API returns same data as direct database queries"""
    try:
        # Get data directly from database
        db = EduInsightDB('/workspaces/sp-ml-17-final-project-g2/database/eduinsight.db')
        db_countries = set(db.get_countries())
        
        # Get data from API
        response = requests.get(f"{API_BASE}/countries", timeout=10)
        assert response.status_code == 200, "API request failed"
        api_countries = set(response.json())
        
        # Compare
        assert db_countries == api_countries, "Database and API country lists don't match"
        
        print(f"✅ PASS: Database-API consistency verified ({len(db_countries)} countries)")
        return True
    except Exception as e:
        print(f"❌ FAIL: Database-API consistency test failed - {e}")
        return False

def test_complete_data_flow_for_spain_education_analysis():
    """Test 2: Full workflow - get countries, select Spain, get indicators, get data"""
    try:
        # Step 1: Get countries list
        countries_response = requests.get(f"{API_BASE}/countries", timeout=10)
        assert countries_response.status_code == 200, "Countries API failed"
        countries = countries_response.json()
        assert 'Spain' in countries, "Spain not available"
        
        # Step 2: Get indicators list
        indicators_response = requests.get(f"{API_BASE}/indicators", timeout=10)
        assert indicators_response.status_code == 200, "Indicators API failed"
        indicators = indicators_response.json()
        assert len(indicators) > 0, "No indicators available"
        
        # Step 3: Get Spain data
        spain_response = requests.get(f"{API_BASE}/data?country=Spain", timeout=15)
        assert spain_response.status_code == 200, "Spain data API failed"
        spain_data = spain_response.json()
        assert len(spain_data) > 0, "No data for Spain"
        
        # Step 4: Verify data structure for dashboard use
        sample_record = spain_data[0]
        required_fields = ['year', 'indicator_name', 'estimate']
        for field in required_fields:
            assert field in sample_record, f"Missing field for dashboard: {field}"
        
        # Step 5: Get Spain summary for dashboard cards
        summary_response = requests.get(f"{API_BASE}/data?country=Spain&summary=true", timeout=10)
        assert summary_response.status_code == 200, "Spain summary API failed"
        summary = summary_response.json()
        assert 'total_records' in summary, "Summary missing total_records"
        
        print("✅ PASS: Complete Spain education analysis workflow successful")
        return True
    except Exception as e:
        print(f"❌ FAIL: Complete workflow test failed - {e}")
        return False

def test_data_quality_for_dashboard_requirements():
    """Test 3: Verify data meets Phase 1 dashboard requirements"""
    try:
        # Get Spain data for last 3 years
        response = requests.get(f"{API_BASE}/data?country=Spain&years=2021,2022,2023", timeout=15)
        assert response.status_code == 200, "API request failed"
        data = response.json()
        
        # Check we have data for dashboard
        assert len(data) > 0, "No recent data for dashboard"
        
        # Group by year to check temporal data
        years_available = set(record['year'] for record in data)
        assert len(years_available) > 0, "No years in data"
        
        # Check we have multiple indicators for rich dashboard
        indicators_available = set(record['indicator_name'] for record in data)
        assert len(indicators_available) > 1, "Need multiple indicators for dashboard"
        
        # Check estimates are numeric for charts
        estimates = [record['estimate'] for record in data if record['estimate'] is not None]
        assert len(estimates) > 0, "No numeric estimates for charts"
        
        # Check for reasonable value ranges (education percentages usually 0-100)
        reasonable_estimates = [e for e in estimates if 0 <= e <= 100]
        percent_reasonable = len(reasonable_estimates) / len(estimates)
        
        print(f"✅ PASS: Data quality suitable for dashboard")
        print(f"   - {len(years_available)} years available")
        print(f"   - {len(indicators_available)} indicators available") 
        print(f"   - {len(estimates)} numeric values")
        print(f"   - {percent_reasonable:.1%} values in reasonable range")
        return True
    except Exception as e:
        print(f"❌ FAIL: Data quality test failed - {e}")
        return False

def test_api_performance_for_frontend_use():
    """Test 4: Verify API response times are acceptable for frontend"""
    try:
        # Test countries API speed
        start_time = time.time()
        response = requests.get(f"{API_BASE}/countries", timeout=10)
        countries_time = time.time() - start_time
        assert response.status_code == 200, "Countries API failed"
        assert countries_time < 5.0, f"Countries API too slow: {countries_time:.2f}s"
        
        # Test data API speed
        start_time = time.time()
        response = requests.get(f"{API_BASE}/data?country=Spain&years=2022", timeout=15)
        data_time = time.time() - start_time
        assert response.status_code == 200, "Data API failed"
        assert data_time < 10.0, f"Data API too slow: {data_time:.2f}s"
        
        print(f"✅ PASS: API performance acceptable")
        print(f"   - Countries: {countries_time:.2f}s")
        print(f"   - Data: {data_time:.2f}s")
        return True
    except Exception as e:
        print(f"❌ FAIL: Performance test failed - {e}")
        return False

def test_phase_1_readiness_checklist():
    """Test 5: Comprehensive checklist for Phase 1 completion"""
    try:
        checklist = []
        
        # Check 1: Countries endpoint works
        try:
            response = requests.get(f"{API_BASE}/countries", timeout=5)
            checklist.append(("Countries API", response.status_code == 200))
        except:
            checklist.append(("Countries API", False))
        
        # Check 2: Indicators endpoint works
        try:
            response = requests.get(f"{API_BASE}/indicators", timeout=5)
            checklist.append(("Indicators API", response.status_code == 200))
        except:
            checklist.append(("Indicators API", False))
        
        # Check 3: Data endpoint works
        try:
            response = requests.get(f"{API_BASE}/data?country=Spain", timeout=10)
            checklist.append(("Data API", response.status_code == 200))
        except:
            checklist.append(("Data API", False))
        
        # Check 4: Summary endpoint works
        try:
            response = requests.get(f"{API_BASE}/data?country=Spain&summary=true", timeout=5)
            checklist.append(("Summary API", response.status_code == 200))
        except:
            checklist.append(("Summary API", False))
        
        # Check 5: Database connection works
        try:
            db = EduInsightDB('/workspaces/sp-ml-17-final-project-g2/database/eduinsight.db')
            countries = db.get_countries()
            checklist.append(("Database", len(countries) > 0))
        except:
            checklist.append(("Database", False))
        
        # Report checklist
        print("📋 PHASE 1 READINESS CHECKLIST:")
        all_passed = True
        for item, passed in checklist:
            status = "✅" if passed else "❌"
            print(f"   {status} {item}")
            if not passed:
                all_passed = False
        
        if all_passed:
            print("\n🎉 PHASE 1 IS READY FOR FRONTEND DEVELOPMENT!")
        else:
            print("\n⚠️  PHASE 1 NEEDS FIXES BEFORE FRONTEND DEVELOPMENT")
        
        return all_passed
    except Exception as e:
        print(f"❌ FAIL: Readiness checklist failed - {e}")
        return False

def run_all_integration_tests():
    """Run all integration tests and report results"""
    print("🧪 RUNNING PHASE 1 INTEGRATION TESTS")
    print("=" * 50)
    
    # Check if server is running
    try:
        requests.get("http://localhost:3000", timeout=3)
    except:
        print("❌ FAIL: Next.js server not running")
        print("💡 Start server with: npm run dev")
        return False
    
    tests = [
        test_database_to_api_data_consistency,
        test_complete_data_flow_for_spain_education_analysis,
        test_data_quality_for_dashboard_requirements,
        test_api_performance_for_frontend_use,
        test_phase_1_readiness_checklist
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"🎯 INTEGRATION TESTS COMPLETE: {passed}/{total} PASSED")
    
    if passed == total:
        print("🎉 PHASE 1 FULLY VALIDATED AND READY!")
        return True
    else:
        print("⚠️  PHASE 1 NEEDS ATTENTION!")
        return False

if __name__ == "__main__":
    run_all_integration_tests()

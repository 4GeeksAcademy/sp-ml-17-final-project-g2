#!/usr/bin/env python3
"""
Test: API Endpoints Functionality
Purpose: Verify that all API routes work correctly and return proper JSON responses
"""

import requests
import json
import time

API_BASE = "http://localhost:3000/api"

def wait_for_server(max_attempts=10):
    """Wait for Next.js dev server to be ready"""
    for attempt in range(max_attempts):
        try:
            response = requests.get("http://localhost:3000", timeout=5)
            if response.status_code == 200:
                print("✅ Server is ready")
                return True
        except requests.exceptions.RequestException:
            print(f"⏳ Waiting for server... (attempt {attempt + 1}/{max_attempts})")
            time.sleep(2)
    
    print("❌ Server not responding after maximum attempts")
    return False

def test_countries_api_returns_valid_json_list():
    """Test 1: GET /api/countries returns valid country list"""
    try:
        response = requests.get(f"{API_BASE}/countries", timeout=10)
        
        # Check HTTP status
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Check JSON format
        countries = response.json()
        assert isinstance(countries, list), "Response should be a list"
        
        # Check content
        assert len(countries) > 100, f"Expected >100 countries, got {len(countries)}"
        assert 'Spain' in countries, "Spain should be in countries list"
        assert all(isinstance(country, str) for country in countries), "All countries should be strings"
        
        print(f"✅ PASS: Countries API valid ({len(countries)} countries)")
        return True
    except Exception as e:
        print(f"❌ FAIL: Countries API test failed - {e}")
        return False

def test_indicators_api_returns_education_metrics():
    """Test 2: GET /api/indicators returns valid education indicators"""
    try:
        response = requests.get(f"{API_BASE}/indicators", timeout=10)
        
        # Check HTTP status
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Check JSON format
        indicators = response.json()
        assert isinstance(indicators, list), "Response should be a list"
        
        # Check content
        assert len(indicators) > 50, f"Expected >50 indicators, got {len(indicators)}"
        
        # Check for education keywords
        education_keywords = ['enrollment', 'education', 'literacy', 'school', 'primary', 'secondary']
        has_education_terms = any(
            any(keyword.lower() in indicator.lower() for keyword in education_keywords)
            for indicator in indicators
        )
        assert has_education_terms, "Should contain education-related indicators"
        
        print(f"✅ PASS: Indicators API valid ({len(indicators)} indicators)")
        return True
    except Exception as e:
        print(f"❌ FAIL: Indicators API test failed - {e}")
        return False

def test_country_data_api_with_spain_returns_records():
    """Test 3: GET /api/data?country=Spain returns Spain's education data"""
    try:
        response = requests.get(f"{API_BASE}/data?country=Spain", timeout=15)
        
        # Check HTTP status
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Check JSON format
        data = response.json()
        assert isinstance(data, list), "Response should be a list of records"
        assert len(data) > 0, "Should return data for Spain"
        
        # Check record structure
        if data:
            record = data[0]
            required_fields = ['year', 'indicator_name', 'estimate']
            for field in required_fields:
                assert field in record, f"Record missing field: {field}"
        
        print(f"✅ PASS: Country data API valid ({len(data)} records for Spain)")
        return True
    except Exception as e:
        print(f"❌ FAIL: Country data API test failed - {e}")
        return False

def test_country_data_api_with_year_filter():
    """Test 4: GET /api/data?country=Spain&years=2020,2021 filters by years"""
    try:
        response = requests.get(f"{API_BASE}/data?country=Spain&years=2020,2021", timeout=15)
        
        # Check HTTP status
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Check JSON format
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Check year filtering
        if data:
            years_in_data = set(record['year'] for record in data)
            expected_years = {2020, 2021}
            unexpected_years = years_in_data - expected_years
            assert not unexpected_years, f"Found unexpected years: {unexpected_years}"
        
        print(f"✅ PASS: Year filtering works ({len(data)} records for 2020-2021)")
        return True
    except Exception as e:
        print(f"❌ FAIL: Year filtering test failed - {e}")
        return False

def test_country_summary_api_returns_aggregated_data():
    """Test 5: GET /api/data?country=Spain&summary=true returns summary stats"""
    try:
        response = requests.get(f"{API_BASE}/data?country=Spain&summary=true", timeout=15)
        
        # Check HTTP status
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Check JSON format
        summary = response.json()
        assert isinstance(summary, dict), "Summary should be an object"
        
        # Check summary structure
        expected_fields = ['reading_score', 'math_score', 'science_score', 'total_records']
        for field in expected_fields:
            assert field in summary, f"Summary missing field: {field}"
        
        # Check data validity
        assert summary['total_records'] > 0, "Should have records"
        
        print(f"✅ PASS: Summary API valid ({summary['total_records']} total records)")
        return True
    except Exception as e:
        print(f"❌ FAIL: Summary API test failed - {e}")
        return False

def test_api_error_handling_for_invalid_country():
    """Test 6: API handles invalid country gracefully"""
    try:
        response = requests.get(f"{API_BASE}/data?country=NonExistentCountry", timeout=10)
        
        # Should still return 200 but with empty data or error message
        assert response.status_code in [200, 400, 404], f"Got unexpected status: {response.status_code}"
        
        data = response.json()
        # If 200, should be empty list. If error, should have error field
        if response.status_code == 200:
            assert isinstance(data, list), "Should return empty list for invalid country"
        else:
            assert 'error' in data, "Error response should have error field"
        
        print("✅ PASS: Error handling works for invalid country")
        return True
    except Exception as e:
        print(f"❌ FAIL: Error handling test failed - {e}")
        return False

def run_all_api_tests():
    """Run all API tests and report results"""
    print("🧪 RUNNING API ENDPOINT TESTS")
    print("=" * 50)
    
    # First check if server is running
    if not wait_for_server():
        print("❌ FAIL: Server not available for testing")
        print("💡 Make sure to run: npm run dev")
        return False
    
    tests = [
        test_countries_api_returns_valid_json_list,
        test_indicators_api_returns_education_metrics,
        test_country_data_api_with_spain_returns_records,
        test_country_data_api_with_year_filter,
        test_country_summary_api_returns_aggregated_data,
        test_api_error_handling_for_invalid_country
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"🎯 API TESTS COMPLETE: {passed}/{total} PASSED")
    
    if passed == total:
        print("🎉 ALL API TESTS PASSED!")
        return True
    else:
        print("⚠️  SOME API TESTS FAILED!")
        return False

if __name__ == "__main__":
    run_all_api_tests()

#!/usr/bin/env python3
"""
Test: Database Connection and Core Functionality
Purpose: Verify that our database connection works and returns expected data
"""

import sys
import os
sys.path.append('/workspaces/sp-ml-17-final-project-g2/database')

from db_utils import EduInsightDB
import json

def test_database_connection_is_successful():
    """Test 1: Verify database file exists and connection works"""
    try:
        db = EduInsightDB('/workspaces/sp-ml-17-final-project-g2/database/eduinsight.db')
        conn = db.get_connection()
        conn.close()
        print("✅ PASS: Database connection successful")
        return True
    except Exception as e:
        print(f"❌ FAIL: Database connection failed - {e}")
        return False

def test_countries_list_contains_expected_data():
    """Test 2: Verify countries list returns reasonable data"""
    try:
        db = EduInsightDB('/workspaces/sp-ml-17-final-project-g2/database/eduinsight.db')
        countries = db.get_countries()
        
        # Check we have countries
        assert len(countries) > 0, "No countries found"
        
        # Check we have expected count (should be around 195)
        assert len(countries) >= 100, f"Too few countries: {len(countries)}"
        
        # Check Spain is in the list (we know it should be)
        assert 'Spain' in countries, "Spain not found in countries list"
        
        print(f"✅ PASS: Countries list valid ({len(countries)} countries)")
        return True
    except Exception as e:
        print(f"❌ FAIL: Countries test failed - {e}")
        return False

def test_indicators_list_contains_education_metrics():
    """Test 3: Verify indicators list contains education-related metrics"""
    try:
        db = EduInsightDB('/workspaces/sp-ml-17-final-project-g2/database/eduinsight.db')
        indicators = db.get_indicators()
        
        # Check we have indicators
        assert len(indicators) > 0, "No indicators found"
        
        # Check we have expected count (should be around 64)
        assert len(indicators) >= 50, f"Too few indicators: {len(indicators)}"
        
        # Check for education-related keywords
        education_keywords = ['enrollment', 'education', 'literacy', 'school']
        has_education_terms = any(
            any(keyword.lower() in indicator.lower() for keyword in education_keywords)
            for indicator in indicators
        )
        assert has_education_terms, "No education-related indicators found"
        
        print(f"✅ PASS: Indicators list valid ({len(indicators)} indicators)")
        return True
    except Exception as e:
        print(f"❌ FAIL: Indicators test failed - {e}")
        return False

def test_spain_country_data_retrieval():
    """Test 4: Verify we can retrieve specific country data"""
    try:
        db = EduInsightDB('/workspaces/sp-ml-17-final-project-g2/database/eduinsight.db')
        spain_data = db.get_country_performance('Spain', [2020, 2021, 2022])
        
        # Check we got data
        assert len(spain_data) > 0, "No data found for Spain"
        
        # Check data structure
        required_columns = ['year', 'indicator_name', 'estimate']
        for col in required_columns:
            assert col in spain_data.columns, f"Missing column: {col}"
        
        # Check year filtering worked
        years_in_data = spain_data['year'].unique()
        expected_years = [2020, 2021, 2022]
        for year in years_in_data:
            assert year in expected_years, f"Unexpected year in data: {year}"
        
        print(f"✅ PASS: Spain data retrieval successful ({len(spain_data)} records)")
        return True
    except Exception as e:
        print(f"❌ FAIL: Spain data test failed - {e}")
        return False

def test_country_summary_provides_aggregated_metrics():
    """Test 5: Verify country summary returns aggregated data"""
    try:
        db = EduInsightDB('/workspaces/sp-ml-17-final-project-g2/database/eduinsight.db')
        summary = db.get_country_summary('Spain')
        
        # Check summary structure
        expected_keys = ['reading_score', 'math_score', 'science_score', 'total_records']
        for key in expected_keys:
            assert key in summary, f"Missing summary key: {key}"
        
        # Check total_records is reasonable
        assert summary['total_records'] > 0, "No records in summary"
        
        print(f"✅ PASS: Country summary valid ({summary['total_records']} total records)")
        return True
    except Exception as e:
        print(f"❌ FAIL: Country summary test failed - {e}")
        return False

def run_all_database_tests():
    """Run all database tests and report results"""
    print("🧪 RUNNING DATABASE TESTS")
    print("=" * 50)
    
    tests = [
        test_database_connection_is_successful,
        test_countries_list_contains_expected_data,
        test_indicators_list_contains_education_metrics,
        test_spain_country_data_retrieval,
        test_country_summary_provides_aggregated_metrics
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"🎯 DATABASE TESTS COMPLETE: {passed}/{total} PASSED")
    
    if passed == total:
        print("🎉 ALL DATABASE TESTS PASSED!")
        return True
    else:
        print("⚠️  SOME DATABASE TESTS FAILED!")
        return False

if __name__ == "__main__":
    run_all_database_tests()

#!/usr/bin/env python3
"""
Comprehensive test suite for the ML prediction API
Tests data quality, progressive predictions, and edge cases
"""

import requests
import json
import sys
import time
from typing import Dict, List, Any

# Test configuration
BASE_URL = "http://localhost:3000"
PREDICT_ENDPOINT = f"{BASE_URL}/api/predict"

class PredictionTester:
    def __init__(self):
        self.passed_tests = 0
        self.failed_tests = 0
        self.test_results = []
    
    def log(self, message: str, test_type: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {test_type}: {message}")
    
    def make_prediction(self, country: str, indicator: str, year: int) -> Dict[str, Any]:
        """Make a prediction request and return the response"""
        payload = {
            "country": country,
            "indicator": indicator,
            "year": year
        }
        
        try:
            response = requests.post(PREDICT_ENDPOINT, json=payload, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            self.log(f"Request failed: {e}", "ERROR")
            return {}
    
    def assert_test(self, condition: bool, test_name: str, details: str = ""):
        """Assert a test condition and track results"""
        if condition:
            self.passed_tests += 1
            self.log(f"✅ PASS: {test_name}", "PASS")
            if details:
                self.log(f"   Details: {details}", "INFO")
        else:
            self.failed_tests += 1
            self.log(f"❌ FAIL: {test_name}", "FAIL")
            if details:
                self.log(f"   Details: {details}", "ERROR")
        
        self.test_results.append({
            "test": test_name,
            "passed": condition,
            "details": details
        })
    
    def test_basic_api_functionality(self):
        """Test 1: Basic API functionality"""
        self.log("=== Test 1: Basic API Functionality ===", "TEST")
        
        # Test with Spain literacy (known good data)
        result = self.make_prediction("Spain", "Literacy rate, adult total (% of people ages 15 and above)", 2025)
        
        # Check response structure
        self.assert_test(
            "prediction" in result,
            "API returns prediction field",
            f"Response keys: {list(result.keys())}"
        )
        
        self.assert_test(
            isinstance(result.get("prediction"), (int, float)),
            "Prediction is numeric",
            f"Prediction: {result.get('prediction')}, Type: {type(result.get('prediction'))}"
        )
        
        self.assert_test(
            0 <= result.get("prediction", -1) <= 100,
            "Prediction is within valid range (0-100%)",
            f"Prediction: {result.get('prediction')}"
        )
        
        return result
    
    def test_historical_data_quality(self):
        """Test 2: Historical data quality and duplicate handling"""
        self.log("=== Test 2: Historical Data Quality ===", "TEST")
        
        # Test countries known to have problematic data
        test_cases = [
            ("Pakistan", "Literacy rate, adult total (% of people ages 15 and above)"),
            ("Nigeria", "Literacy rate, adult total (% of people ages 15 and above)"),
            ("Brazil", "School enrollment, primary (% gross)"),
            ("India", "Literacy rate, adult total (% of people ages 15 and above)")
        ]
        
        for country, indicator in test_cases:
            result = self.make_prediction(country, indicator, 2027)
            
            if not result or "historical_context" not in result:
                self.assert_test(False, f"{country} - Historical context missing", "No historical_context in response")
                continue
            
            historical_data = result["historical_context"].get("historical_data", [])
            
            # Check for duplicate years (teeth curve issue)
            years = [point["year"] for point in historical_data]
            unique_years = set(years)
            
            self.assert_test(
                len(years) == len(unique_years),
                f"{country} - No duplicate years in historical data",
                f"Total points: {len(years)}, Unique years: {len(unique_years)}"
            )
            
            # Check for reasonable data progression
            if len(historical_data) >= 3:
                values = [point["value"] for point in historical_data]
                
                # Check for extreme jumps (>50% change between consecutive years)
                extreme_jumps = 0
                for i in range(1, len(values)):
                    if abs(values[i] - values[i-1]) > 50:
                        extreme_jumps += 1
                
                self.assert_test(
                    extreme_jumps == 0,
                    f"{country} - No extreme value jumps",
                    f"Extreme jumps (>50%): {extreme_jumps}"
                )
                
                # Check values are within reasonable bounds
                all_in_bounds = all(0 <= v <= 100 for v in values)
                self.assert_test(
                    all_in_bounds,
                    f"{country} - All values within 0-100% range",
                    f"Values range: {min(values):.1f}% to {max(values):.1f}%"
                )
    
    def test_progressive_predictions(self):
        """Test 3: Progressive predictions (different values per year)"""
        self.log("=== Test 3: Progressive Predictions ===", "TEST")
        
        test_cases = [
            ("Spain", "Literacy rate, adult total (% of people ages 15 and above)", 2030),
            ("Brazil", "School enrollment, primary (% gross)", 2029),
            ("Germany", "Literacy rate, adult total (% of people ages 15 and above)", 2028),
            ("Mexico", "School enrollment, primary (% gross)", 2030)
        ]
        
        for country, indicator, target_year in test_cases:
            result = self.make_prediction(country, indicator, target_year)
            
            if not result or "historical_context" not in result:
                self.assert_test(False, f"{country} - Progressive predictions missing", "No historical_context")
                continue
            
            predictions = result["historical_context"].get("predictions", [])
            
            if len(predictions) < 2:
                self.assert_test(False, f"{country} - Insufficient predictions", f"Only {len(predictions)} predictions")
                continue
            
            # Check that predictions vary across years (not all the same)
            prediction_values = [p["value"] for p in predictions]
            unique_values = set(round(v, 1) for v in prediction_values)  # Round to 1 decimal
            
            self.assert_test(
                len(unique_values) > 1,
                f"{country} - Predictions vary across years",
                f"Unique values: {len(unique_values)}, Range: {min(prediction_values):.1f}% - {max(prediction_values):.1f}%"
            )
            
            # Check progression is reasonable (not huge jumps)
            max_year_change = 0
            for i in range(1, len(prediction_values)):
                year_change = abs(prediction_values[i] - prediction_values[i-1])
                max_year_change = max(max_year_change, year_change)
            
            self.assert_test(
                max_year_change <= 10,  # Max 10% change per year
                f"{country} - Reasonable year-to-year progression",
                f"Max yearly change: {max_year_change:.2f}%"
            )
    
    def test_edge_cases(self):
        """Test 4: Edge cases and error handling"""
        self.log("=== Test 4: Edge Cases ===", "TEST")
        
        # Test invalid country
        result = self.make_prediction("Nonexistent Country", "Literacy rate, adult total (% of people ages 15 and above)", 2025)
        self.assert_test(
            "error" in result or result == {},
            "Invalid country handled gracefully",
            f"Response: {result}"
        )
        
        # Test extreme future year
        result = self.make_prediction("Spain", "Literacy rate, adult total (% of people ages 15 and above)", 2050)
        if result and "prediction" in result:
            self.assert_test(
                0 <= result["prediction"] <= 100,
                "Extreme future year produces valid prediction",
                f"2050 prediction: {result['prediction']:.1f}%"
            )
        
        # Test past year
        result = self.make_prediction("Spain", "Literacy rate, adult total (% of people ages 15 and above)", 2020)
        self.assert_test(
            "prediction" in result or "error" in result,
            "Past year handled appropriately",
            f"Response type: {type(result)}"
        )
    
    def test_indicator_specific_logic(self):
        """Test 5: Indicator-specific prediction logic"""
        self.log("=== Test 5: Indicator-Specific Logic ===", "TEST")
        
        # Test high-performing country literacy (should be stable)
        spain_literacy = self.make_prediction("Spain", "Literacy rate, adult total (% of people ages 15 and above)", 2030)
        if spain_literacy and "prediction" in spain_literacy:
            self.assert_test(
                spain_literacy["prediction"] >= 90,
                "High-performing country literacy remains high",
                f"Spain 2030 literacy: {spain_literacy['prediction']:.1f}%"
            )
        
        # Test enrollment vs literacy differences
        brazil_literacy = self.make_prediction("Brazil", "Literacy rate, adult total (% of people ages 15 and above)", 2028)
        brazil_enrollment = self.make_prediction("Brazil", "School enrollment, primary (% gross)", 2028)
        
        if brazil_literacy and brazil_enrollment and "prediction" in brazil_literacy and "prediction" in brazil_enrollment:
            # Enrollment can be >100% (gross enrollment), literacy cannot
            self.assert_test(
                brazil_literacy["prediction"] <= 100,
                "Literacy prediction respects 100% ceiling",
                f"Brazil literacy: {brazil_literacy['prediction']:.1f}%"
            )
    
    def test_api_performance(self):
        """Test 6: API performance and reliability"""
        self.log("=== Test 6: API Performance ===", "TEST")
        
        start_time = time.time()
        
        # Make multiple requests to test consistency
        requests_made = 0
        successful_requests = 0
        
        test_requests = [
            ("Spain", "Literacy rate, adult total (% of people ages 15 and above)", 2025),
            ("Brazil", "School enrollment, primary (% gross)", 2026),
            ("Germany", "Literacy rate, adult total (% of people ages 15 and above)", 2027),
            ("France", "School enrollment, primary (% gross)", 2028),
            ("Italy", "Literacy rate, adult total (% of people ages 15 and above)", 2029)
        ]
        
        for country, indicator, year in test_requests:
            result = self.make_prediction(country, indicator, year)
            requests_made += 1
            if result and "prediction" in result:
                successful_requests += 1
        
        end_time = time.time()
        avg_response_time = (end_time - start_time) / requests_made
        
        self.assert_test(
            successful_requests / requests_made >= 0.8,  # 80% success rate
            "API reliability test",
            f"Success rate: {successful_requests}/{requests_made} ({100*successful_requests/requests_made:.1f}%)"
        )
        
        self.assert_test(
            avg_response_time <= 10,  # Average response under 10 seconds
            "API performance test",
            f"Average response time: {avg_response_time:.2f}s"
        )
    
    def run_all_tests(self):
        """Run the complete test suite"""
        self.log("🚀 Starting Comprehensive Prediction API Test Suite", "START")
        self.log(f"Testing endpoint: {PREDICT_ENDPOINT}", "INFO")
        
        start_time = time.time()
        
        # Run all test groups
        self.test_basic_api_functionality()
        self.test_historical_data_quality()
        self.test_progressive_predictions()
        self.test_edge_cases()
        self.test_indicator_specific_logic()
        self.test_api_performance()
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Generate summary
        total_tests = self.passed_tests + self.failed_tests
        pass_rate = (self.passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        self.log("", "")
        self.log("=" * 60, "SUMMARY")
        self.log("🏁 Test Suite Complete!", "SUMMARY")
        self.log(f"📊 Results: {self.passed_tests}/{total_tests} tests passed ({pass_rate:.1f}%)", "SUMMARY")
        self.log(f"⏱️  Total time: {total_time:.2f} seconds", "SUMMARY")
        
        if self.failed_tests > 0:
            self.log("", "")
            self.log("❌ Failed Tests:", "SUMMARY")
            for result in self.test_results:
                if not result["passed"]:
                    self.log(f"   • {result['test']}: {result['details']}", "FAIL")
        
        self.log("=" * 60, "SUMMARY")
        
        return pass_rate >= 80  # Return True if 80%+ tests passed

def main():
    """Main test execution"""
    tester = PredictionTester()
    
    try:
        success = tester.run_all_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        tester.log("\n⚠️  Test suite interrupted by user", "WARN")
        sys.exit(1)
    except Exception as e:
        tester.log(f"💥 Test suite crashed: {e}", "ERROR")
        sys.exit(1)

if __name__ == "__main__":
    main()

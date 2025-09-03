#!/usr/bin/env python3
"""
Test: ML Prediction API Functionality
Purpose: Verify that the XGBoost model integration works correctly through the API
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
            if attempt < max_attempts - 1:
                print(f"⏳ Waiting for server... (attempt {attempt + 1}/{max_attempts})")
                time.sleep(2)
            else:
                print("❌ Server not ready after maximum attempts")
                return False
    return False

def test_prediction_api_basic():
    """Test basic ML prediction functionality"""
    print("\n🧪 Testing ML prediction API basic functionality...")
    
    payload = {
        "country": "Spain",
        "indicator": "Literacy rate, adult total (% of people ages 15 and above)",
        "year": 2025
    }
    
    response = requests.post(f"{API_BASE}/predict", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        
        # Validate response structure
        required_fields = ['prediction', 'confidence', 'year', 'country', 'indicator', 'model_info']
        if all(field in data for field in required_fields):
            print(f"✅ PASS: Basic prediction API works")
            print(f"   Prediction: {data['prediction']:.2f}")
            print(f"   Confidence: {data['confidence']:.1%}")
            return True
        else:
            print(f"❌ FAIL: Missing required fields in response")
            return False
    else:
        print(f"❌ FAIL: API returned status {response.status_code}")
        return False

def test_prediction_validation():
    """Test prediction input validation"""
    print("\n🧪 Testing prediction input validation...")
    
    test_cases = [
        # Missing country
        {"indicator": "Test", "year": 2025},
        # Missing indicator  
        {"country": "Spain", "year": 2025},
        # Missing year
        {"country": "Spain", "indicator": "Test"},
        # Invalid year (too old)
        {"country": "Spain", "indicator": "Test", "year": 1900},
        # Invalid year (too future)
        {"country": "Spain", "indicator": "Test", "year": 2050}
    ]
    
    passed = 0
    for i, payload in enumerate(test_cases):
        response = requests.post(f"{API_BASE}/predict", json=payload)
        if response.status_code == 400:
            passed += 1
        else:
            print(f"   Case {i+1}: Expected 400, got {response.status_code}")
    
    if passed == len(test_cases):
        print(f"✅ PASS: Input validation works ({passed}/{len(test_cases)} cases)")
        return True
    else:
        print(f"❌ FAIL: Input validation failed ({passed}/{len(test_cases)} cases)")
        return False

def test_prediction_consistency():
    """Test that same inputs produce consistent predictions"""
    print("\n🧪 Testing prediction consistency...")
    
    payload = {
        "country": "Finland",
        "indicator": "Literacy rate, adult total (% of people ages 15 and above)",
        "year": 2024
    }
    
    predictions = []
    for i in range(3):
        response = requests.post(f"{API_BASE}/predict", json=payload)
        if response.status_code == 200:
            data = response.json()
            predictions.append(data['prediction'])
        else:
            print(f"❌ FAIL: Request {i+1} failed with status {response.status_code}")
            return False
    
    # Check if all predictions are the same (allowing small floating point differences)
    if len(set(round(p, 4) for p in predictions)) == 1:
        print(f"✅ PASS: Predictions are consistent ({predictions[0]:.2f})")
        return True
    else:
        print(f"❌ FAIL: Inconsistent predictions: {predictions}")
        return False

def test_prediction_multiple_countries():
    """Test predictions for multiple countries"""
    print("\n🧪 Testing predictions for multiple countries...")
    
    countries = ["Spain", "United States", "Japan", "Brazil", "Nigeria"]
    indicator = "Primary completion rate, total (% of relevant age group)"
    year = 2025
    
    passed = 0
    for country in countries:
        payload = {"country": country, "indicator": indicator, "year": year}
        response = requests.post(f"{API_BASE}/predict", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            if 'prediction' in data and isinstance(data['prediction'], (int, float)):
                passed += 1
                print(f"   {country}: {data['prediction']:.2f} (confidence: {data['confidence']:.1%})")
            else:
                print(f"   {country}: Invalid prediction format")
        else:
            print(f"   {country}: Failed with status {response.status_code}")
    
    if passed >= len(countries) * 0.8:  # Allow 20% failure for unknown countries
        print(f"✅ PASS: Multi-country predictions work ({passed}/{len(countries)})")
        return True
    else:
        print(f"❌ FAIL: Too many failures ({passed}/{len(countries)})")
        return False

def test_prediction_confidence_levels():
    """Test that confidence levels are reasonable"""
    print("\n🧪 Testing prediction confidence levels...")
    
    test_cases = [
        # Known country + common indicator = high confidence
        {"country": "Spain", "indicator": "Literacy rate, adult total (% of people ages 15 and above)", "expected_min": 0.7},
        # Common country + education indicator = medium+ confidence  
        {"country": "United States", "indicator": "Primary completion rate, total (% of relevant age group)", "expected_min": 0.5},
    ]
    
    passed = 0
    for case in test_cases:
        payload = {
            "country": case["country"],
            "indicator": case["indicator"], 
            "year": 2025
        }
        
        response = requests.post(f"{API_BASE}/predict", json=payload)
        if response.status_code == 200:
            data = response.json()
            confidence = data.get('confidence', 0)
            
            if confidence >= case["expected_min"]:
                passed += 1
                print(f"   {case['country']}: {confidence:.1%} confidence ✓")
            else:
                print(f"   {case['country']}: {confidence:.1%} confidence (expected ≥{case['expected_min']:.1%})")
        else:
            print(f"   {case['country']}: API failed")
    
    if passed == len(test_cases):
        print(f"✅ PASS: Confidence levels are reasonable")
        return True
    else:
        print(f"❌ FAIL: Confidence levels too low ({passed}/{len(test_cases)})")
        return False

def test_model_metadata():
    """Test that model metadata is correctly returned"""
    print("\n🧪 Testing model metadata...")
    
    payload = {
        "country": "Germany",
        "indicator": "Literacy rate, adult total (% of people ages 15 and above)",
        "year": 2025
    }
    
    response = requests.post(f"{API_BASE}/predict", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        model_info = data.get('model_info', {})
        
        expected_fields = ['type', 'accuracy', 'training_samples']
        if all(field in model_info for field in expected_fields):
            print(f"✅ PASS: Model metadata complete")
            print(f"   Type: {model_info['type']}")
            print(f"   Accuracy: {model_info['accuracy']}")
            print(f"   Training samples: {model_info['training_samples']:,}")
            return True
        else:
            print(f"❌ FAIL: Missing model metadata fields")
            return False
    else:
        print(f"❌ FAIL: API request failed")
        return False

def run_ml_tests():
    """Run all ML prediction tests"""
    print("🧪 RUNNING ML PREDICTION TESTS")
    print("=" * 50)
    
    if not wait_for_server():
        print("❌ Server not available, skipping tests")
        return
    
    tests = [
        test_prediction_api_basic,
        test_prediction_validation,
        test_prediction_consistency,
        test_prediction_multiple_countries,
        test_prediction_confidence_levels,
        test_model_metadata
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"🎯 ML TESTS COMPLETE: {passed}/{len(tests)} PASSED")
    
    if passed == len(tests):
        print("🎉 ALL ML TESTS PASSED!")
    else:
        print("⚠️  SOME ML TESTS FAILED!")
    
    return passed == len(tests)

if __name__ == "__main__":
    run_ml_tests()

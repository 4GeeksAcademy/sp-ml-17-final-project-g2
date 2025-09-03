#!/usr/bin/env python3
"""
Test Runner: Execute All Phase 1 Tests
Purpose: Run all tests in sequence and provide comprehensive report
"""

import subprocess
import sys
import time

def run_test_suite(test_path, test_name):
    """Run a test suite and return results"""
    print(f"\n🧪 RUNNING: {test_name}")
    print("=" * 60)
    
    try:
        result = subprocess.run([sys.executable, test_path], 
                              capture_output=True, text=True, timeout=60)
        
        # Print the output
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        success = result.returncode == 0
        return success, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        print("❌ TEST TIMEOUT: Test took too long to complete")
        return False, "", "Timeout"
    except Exception as e:
        print(f"❌ TEST ERROR: {e}")
        return False, "", str(e)

def main():
    """Run all tests and generate report"""
    print("🚀 EDUINSIGHT COMPLETE TEST SUITE")
    print("=" * 60)
    print("Testing: Database + API Routes + Frontend + ML Integration")
    print("=" * 60)
    
    test_suites = [
        ("tests/database/test_database_connection_and_queries.py", 
         "Database Connection & Queries"),
        ("tests/api/test_api_endpoints_functionality.py", 
         "API Endpoints Functionality"),
        ("tests/test_phase_1_integration_complete.py", 
         "Phase 1 Integration Complete"),
        ("tests/ml/test_ml_predictions_functionality.py",
         "ML Predictions Functionality"),
        ("tests/test_ml_integration_complete.py",
         "Complete ML Integration Workflow")
    ]
    
    results = []
    start_time = time.time()
    
    for test_path, test_name in test_suites:
        success, stdout, stderr = run_test_suite(test_path, test_name)
        results.append((test_name, success, stdout, stderr))
        
        if not success:
            print(f"\n⚠️  {test_name} FAILED - Continuing with remaining tests...")
    
    # Generate final report
    total_time = time.time() - start_time
    
    print("\n" + "=" * 60)
    print("🎯 FINAL TEST REPORT")
    print("=" * 60)
    
    passed = sum(1 for _, success, _, _ in results if success)
    total = len(results)
    
    for test_name, success, _, _ in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nResults: {passed}/{total} test suites passed")
    print(f"Time: {total_time:.1f} seconds")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - COMPLETE PLATFORM READY!")
        print("✅ Database connection working")
        print("✅ API endpoints functional") 
        print("✅ Integration validated")
        print("✅ ML predictions operational")
        print("✅ Frontend interfaces working")
        print("\n💡 Ready for production deployment!")
        return True
    else:
        print(f"\n⚠️  {total - passed} TEST SUITE(S) FAILED")
        print("❌ Platform needs fixes before deployment")
        print("\n🔧 Check the detailed output above for specific issues")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

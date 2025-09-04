#!/bin/bash

# EduInsight ML Prediction API - Test Suite Runner
# Comprehensive testing for data quality, API functionality, and ML predictions

echo "🧪 EduInsight ML Prediction API Test Suite"
echo "=========================================="

# Check if server is running
echo "🔍 Checking if development server is running..."
if ! curl -s http://localhost:3000/api/predict >/dev/null 2>&1; then
    echo "❌ Server not running on localhost:3000"
    echo "   Please start the server with: cd webapp && npm run dev"
    exit 1
fi
echo "✅ Server is running"

# Install Python dependencies if needed
echo "📦 Checking Python dependencies..."
python3 -c "import requests" 2>/dev/null || {
    echo "Installing requests..."
    pip3 install requests
}

echo ""
echo "Available test suites:"
echo "1) 🔍 Quick data quality troubleshooter (recommended first)"
echo "2) 🧪 Comprehensive API test suite (28 tests)"
echo "3) 🔧 Individual component tests (database/api/ml)"
echo "4) 🚀 Run all tests (full validation)"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo "🔍 Running quick data quality troubleshooter..."
        python3 troubleshoot_data_quality.py
        ;;
    2)
        echo "🧪 Running comprehensive test suite..."
        python3 test_prediction_api_comprehensive.py
        ;;
    3)
        echo "� Running individual component tests..."
        echo ""
        echo "📊 Testing database functionality..."
        python3 database/test_database_connection_and_queries.py
        echo ""
        echo "🌐 Testing API endpoints..."
        python3 api/test_api_endpoints_functionality.py
        echo ""
        echo "🤖 Testing ML predictions..."
        python3 ml/test_ml_predictions_functionality.py
        ;;
    4)
        echo "🚀 Running full test suite..."
        echo ""
        echo "1️⃣ Quick troubleshooter..."
        python3 troubleshoot_data_quality.py
        echo ""
        echo "2️⃣ Comprehensive API tests..."
        python3 test_prediction_api_comprehensive.py
        echo ""
        echo "3️⃣ Component tests..."
        python3 database/test_database_connection_and_queries.py
        python3 api/test_api_endpoints_functionality.py
        python3 ml/test_ml_predictions_functionality.py
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🏁 Testing complete!"
echo ""
echo "💡 Troubleshooting tips:"
echo "   • For data quality issues: Check TEST_RESULTS.md"
echo "   • For API errors: Check server logs in terminal"
echo "   • For visualization: Test in browser at http://localhost:3000/predictions"
echo "   • For database issues: Check connection and data integrity"

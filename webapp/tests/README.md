# EduInsight Testing Suite

Comprehensive test suite for the EduInsight ML prediction webapp, covering data quality, API functionality, and ML model predictions.

## 🚀 Quick Start

```bash
# Start the development server first
cd webapp && npm run dev

# Run tests
cd tests
./run_tests.sh
```

## 📁 Test Structure

```
tests/
├── run_tests.sh                           # 🎯 Main test runner (start here)
├── troubleshoot_data_quality.py          # 🔍 Quick diagnostics
├── test_prediction_api_comprehensive.py  # 🧪 Full API test suite (28 tests)
├── TEST_RESULTS.md                       # 📊 Latest test results & status
├── api/
│   └── test_api_endpoints_functionality.py    # 🌐 API endpoints
├── database/
│   └── test_database_connection_and_queries.py # 📊 Database tests
└── ml/
    └── test_ml_predictions_functionality.py    # 🤖 ML model tests
```

## 🧪 Test Suites

### 1. **Quick Troubleshooter** (Recommended First)
```bash
python3 troubleshoot_data_quality.py
```
- ✅ Detects "teeth curve" visualization issues
- ✅ Validates historical data quality
- ✅ Checks for duplicate years and extreme jumps
- ✅ Analyzes prediction progression

### 2. **Comprehensive API Tests** (Production Validation)
```bash
python3 test_prediction_api_comprehensive.py
```
- 🎯 28 automated tests across 6 categories
- ⚡ Performance benchmarking (response time)
- 🔒 Edge case validation
- 📊 Data quality verification
- 🎨 Prediction logic validation

### 3. **Component Tests** (Development)
```bash
# Database functionality
python3 database/test_database_connection_and_queries.py

# API endpoints
python3 api/test_api_endpoints_functionality.py

# ML predictions
python3 ml/test_ml_predictions_functionality.py
```

## 📊 Test Results

### Current Status: **85.7% Pass Rate** ✅

**Key Achievements:**
- ✅ Fixed "teeth curve" visualization issues
- ✅ Progressive predictions working (different values per year)
- ✅ Data quality validation (no duplicate years)
- ✅ API performance: 1.52s avg response time

**Known Issues:**
- ⚠️ Brazil enrollment data has extreme historical jumps (database issue)
- ⚠️ Some countries missing historical data (coverage issue)

See `TEST_RESULTS.md` for detailed analysis.

## 🔧 Test Categories

### **Data Quality Tests**
- Duplicate year detection
- Extreme value jump identification
- Historical data validation
- Bounds checking (0-100%)

### **API Functionality Tests**
- Basic prediction requests
- Response structure validation
- Error handling
- Performance benchmarking

### **ML Logic Tests**
- Progressive prediction validation
- Indicator-specific logic
- Country-specific adaptations
- Trend analysis accuracy

### **Visualization Tests**
- Historical context generation
- Timeline data structure
- Chart data validation

## 🎯 Success Criteria

- ✅ **Data Quality**: No duplicate years, smooth trends
- ✅ **Progressive Predictions**: Unique values per year
- ✅ **API Performance**: <3s response time, >80% success rate
- ✅ **Visualization**: Clean line charts, proper hover data
- ✅ **Bounds**: All predictions within 0-100% range

## 🛠️ Adding New Tests

1. **Quick Diagnostics**: Add to `troubleshoot_data_quality.py`
2. **API Tests**: Add to `test_prediction_api_comprehensive.py`
3. **Component Tests**: Add to respective `api/`, `database/`, or `ml/` folders

## 🚨 Troubleshooting

### Common Issues:
1. **Server not running**: Start with `npm run dev` in webapp folder
2. **Python dependencies**: Install with `pip3 install requests`
3. **Test timeouts**: Check server performance and database connection
4. **Data quality issues**: Run troubleshooter first to identify problems

### Debug Tips:
- Check server terminal for DEBUG messages
- Review `TEST_RESULTS.md` for known issues
- Test manually in browser at `http://localhost:3000/predictions`
- Verify database connection and data integrity

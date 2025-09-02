# EduInsight Phase 1 Test Suite

## Overview
Comprehensive test suite for validating Phase 1 implementation (Database + API Routes).

## Test Structure

```
tests/
├── database/
│   └── test_database_connection_and_queries.py    # Database layer tests
├── api/
│   └── test_api_endpoints_functionality.py        # API endpoints tests
├── test_phase_1_integration_complete.py           # Full integration tests
├── run_all_tests.py                              # Test runner
├── test_requirements.txt                          # Python dependencies
└── README.md                                      # This file
```

## Quick Start

### 1. Install Test Dependencies
```bash
pip install -r tests/test_requirements.txt
```

### 2. Start Next.js Server (for API tests)
```bash
npm run dev
```

### 3. Run All Tests
```bash
cd webapp
python3 tests/run_all_tests.py
```

### 4. Run Individual Test Suites
```bash
# Database tests only
python3 tests/database/test_database_connection_and_queries.py

# API tests only (requires server running)
python3 tests/api/test_api_endpoints_functionality.py

# Integration tests only (requires server running)
python3 tests/test_phase_1_integration_complete.py
```

## Test Descriptions

### Database Tests (`test_database_connection_and_queries.py`)
- **test_database_connection_is_successful**: Verifies SQLite connection works
- **test_countries_list_contains_expected_data**: Validates country list (195 countries)
- **test_indicators_list_contains_education_metrics**: Validates education indicators (64 indicators)
- **test_spain_country_data_retrieval**: Tests specific country data queries
- **test_country_summary_provides_aggregated_metrics**: Tests summary statistics

### API Tests (`test_api_endpoints_functionality.py`)
- **test_countries_api_returns_valid_json_list**: Tests GET /api/countries
- **test_indicators_api_returns_education_metrics**: Tests GET /api/indicators
- **test_country_data_api_with_spain_returns_records**: Tests GET /api/data
- **test_country_data_api_with_year_filter**: Tests year filtering
- **test_country_summary_api_returns_aggregated_data**: Tests summary endpoint
- **test_api_error_handling_for_invalid_country**: Tests error handling

### Integration Tests (`test_phase_1_integration_complete.py`)
- **test_database_to_api_data_consistency**: Compares DB vs API data
- **test_complete_data_flow_for_spain_education_analysis**: Full workflow test
- **test_data_quality_for_dashboard_requirements**: Validates data for frontend
- **test_api_performance_for_frontend_use**: Tests response times
- **test_phase_1_readiness_checklist**: Complete Phase 1 validation

## Expected Results

### ✅ All Tests Pass
- Database: 5/5 tests passed
- API: 6/6 tests passed  
- Integration: 5/5 tests passed
- **Total: 16/16 tests passed**

### Success Criteria
- ✅ 195 countries available
- ✅ 64 education indicators available
- ✅ Spain data retrieval working
- ✅ API endpoints responding correctly
- ✅ Data quality suitable for dashboard
- ✅ Performance acceptable for frontend

## Troubleshooting

### Common Issues

#### "Server not responding"
- Start Next.js server: `npm run dev`
- Wait for "Ready" message before running API tests

#### "Database connection failed"
- Check database path in test files
- Ensure `eduinsight.db` exists in `../database/`

#### "Import errors"
- Install test requirements: `pip install -r tests/test_requirements.txt`
- Check Python path in test files

### Test Dependencies
- **Python 3.7+**
- **requests** library for API testing
- **pandas** (via existing requirements.txt)
- **Next.js dev server** running on localhost:3000

## Phase 1 Validation Checklist

When all tests pass, Phase 1 is validated for:
- [x] Database connection and queries
- [x] API endpoint functionality
- [x] Data consistency between DB and API
- [x] Error handling
- [x] Performance requirements
- [x] Frontend integration readiness

**Next Step: Implement Phase 1 frontend components (Country selector, metrics cards, basic charts)**

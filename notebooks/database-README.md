# Database Module

This directory implements Step 3 of the project: storing education data in a database for efficient access and querying.

## Purpose

The database module provides:
- Persistent storage for 340K+ education records
- Fast SQL queries for web application
- Data integrity and concurrent access
- Professional data management practices

## Files

- `create_schema.sql` - Database schema definition
- `database_setup.ipynb` - Database creation and data loading notebook
- `db_utils.py` - Database utility functions for web application

## Database Choice

SQLite is used for simplicity and portability while demonstrating SQL skills required by the project.

## Application Workflow

### How the Database Powers the Web Application

```
┌─────────────────────────────────────────────────────────────────┐
│                    EduInsight Web Application                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      User Interactions                         │
│  • Select Country: "Spain"                                     │
│  • Choose Indicator: "Primary enrollment rate"                 │
│  • Set Time Range: 2015-2023                                   │
│  • Request Prediction for 2024                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database Queries                            │
│                                                                 │
│  db.get_country_performance('Spain', [2015,2016,...,2023])     │
│  ├── SELECT year, indicator_name, estimate                     │
│  ├── FROM education_data                                        │
│  ├── WHERE setting = 'Spain' AND year IN (2015...2023)        │
│  └── Returns: Historical trends for visualization              │
│                                                                 │
│  db.get_regional_comparison('enrollment')                      │
│  ├── SELECT whoreg6, AVG(estimate) as avg_value               │
│  ├── FROM education_data WHERE indicator_name LIKE '%enroll%'  │
│  └── Returns: Spain vs Regional averages                       │
│                                                                 │
│  db.get_data_for_prediction('Spain', 2023)                    │
│  ├── SELECT * FROM education_data                              │
│  ├── WHERE setting = 'Spain' AND year = 2023                  │
│  └── Returns: Features for ML model input                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Processing                             │
│                                                                 │
│  1. Format data for visualization                              │
│  2. Prepare features for ML prediction                         │
│  3. Calculate country rankings                                  │
│  4. Generate comparison metrics                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Web App Response                             │
│                                                                 │
│  📊 Interactive Charts: Spain's education trends               │
│  🎯 ML Prediction: 2024 enrollment rate = 85.3%               │
│  🌍 Regional Ranking: Spain ranks 12th in Europe              │
│  📈 Trend Analysis: +2.1% improvement over 5 years            │
└─────────────────────────────────────────────────────────────────┘
```

### Database vs CSV Performance Comparison

Based on actual benchmarks with 340,145 education records:

```
Scenario 1: Cold Start (First User Request)
─────────────────────────────────────────────
CSV File Approach:
User Request → Load 340K CSV → Filter data → Response
   0.01s           0.57s         0.02s        0.59s TOTAL

Database Approach:
User Request → SQL Query → Response  
   0.01s          0.035s      0.035s TOTAL

Cold Start Performance: Database is 16.7x faster (590ms vs 35ms)

Scenario 2: Subsequent Queries (Data Cached)
──────────────────────────────────────────────
CSV (In-Memory): ~0.018s per query
Database:        ~0.036s per query

In-Memory Performance: CSV is 2x faster for simple filters

Scenario 3: Web Application Reality
──────────────────────────────────────
✅ Database wins for: Multiple users, cold starts, complex queries
✅ CSV wins for: Single user with data pre-loaded in memory
🎯 Real web apps: Database provides consistent performance
```

### Real-World Application Scenarios

**Scenario 1: Country Performance Dashboard**
```
User selects "France" → db.get_country_performance('France')
└── Returns: All French education indicators for visualization
```

**Scenario 2: Regional Benchmarking**
```
User wants to compare regions → db.get_regional_comparison('literacy')
└── Returns: Average literacy rates by WHO region
```

**Scenario 3: ML Prediction**
```
User requests 2024 prediction → db.get_data_for_prediction('Germany', 2023)
└── Returns: Latest German data as features for XGBoost model
```

**Scenario 4: Trend Analysis**
```
User analyzes trends → Custom SQL through db connection
└── Returns: Multi-year, multi-country comparative data
```

## Workflow

1. Run `database_setup.ipynb` to create database and load data
2. Use `db_utils.py` functions in web application for data access
3. Database enables fast country comparisons and trend analysis
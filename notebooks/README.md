# Notebooks Directory

## 📓 EDA and Data Processing Pipeline

### `01_eda_data_cleaning.ipynb`
**Purpose**: Comprehensive Exploratory Data Analysis and Machine Learning preprocessing pipeline for the EduInsight project.

## 🎯 Data Splitting Strategy

### **Dataset Overview**
- **Source**: Global education indicators (1970-2023)  
- **Total Records**: 340,145 education measurements
- **Countries**: 195 countries/territories
- **Time Period**: 53 years of historical data
- **Indicators**: 64 distinct education metrics

### **Temporal Train-Test Split**
**Strategy**: Chronological split to prevent data leakage and ensure realistic model evaluation

**Training Set (1970-2016)**:
- **273,488 samples (80%)**
- Used for model training and hyperparameter tuning
- Covers 47 years of historical education data
- Enables learning of long-term trends and patterns

**Test Set (2017-2023)**:
- **66,657 samples (20%)**
- Reserved for final model evaluation
- Represents recent/future periods unseen during training
- Simulates real-world deployment scenarios

### **Features and Target Definition**

#### **Target Variable**
- **`estimate`**: Education indicator values (continuous variable)
- Represents various education metrics (enrollment rates, completion ratios, literacy scores, etc.)

#### **Feature Categories**

**Categorical Features (Encoded)**:
- `setting_encoded`: Country/territory identifier
- `indicator_abbr_encoded`: Education metric abbreviation  
- `indicator_name_encoded`: Full indicator description
- `dimension_encoded`: Measurement dimension (total, male, female, etc.)
- `subgroup_encoded`: Population subgroup analysis
- `iso3_encoded`: ISO3 country codes
- `whoreg6_encoded`: WHO regional classifications
- `wbincome2024_encoded`: World Bank income categories
- `flag_encoded`: Data quality flags

**Numerical Features**:
- `year`: Temporal component (1970-2023)
- `setting_average`: Country-level education averages

**Boolean Features**:
- `favourable_indicator`: Indicator direction (higher = better)
- `is_gender_analysis`: Gender-disaggregated data flag
- `is_wealth_analysis`: Wealth-based analysis flag  
- `is_residence_analysis`: Urban/rural residence analysis flag

## 🔄 Preprocessing Pipeline

1. **Data Cleaning**: Removed missing values and duplicates
2. **Label Encoding**: Transformed 9 categorical variables to numerical format
3. **Feature Scaling**: Applied StandardScaler for normalization
4. **Temporal Validation**: Chronological split preserving time-series structure
5. **Export**: Saved preprocessing objects (scaler.pkl, label_encoders.pkl) for production

## 🎯 Alignment with User Story

**User Story**: *"As an educational policymaker, I want to quickly assess my country's education performance compared to similar nations and predict future trends, so that I can make informed decisions about resource allocation and policy interventions."*

**How Our Split Supports This**:
- **Historical Training**: 47 years of data enables robust pattern learning
- **Future Validation**: Testing on 2017-2023 data simulates real-world prediction scenarios
- **Country Comparisons**: Preserved country encodings enable benchmarking
- **Trend Analysis**: Temporal structure maintained for forecasting capabilities
- **Policy Decisions**: Multiple demographic dimensions support targeted interventions

## 📁 Generated Datasets

### **Essential Files Kept**:

**Main Dataset**:
- `data/processed/ml_ready_data.csv` (82MB) - Complete feature matrix with target variable used for splitting

**Train/Test Splits**:
- `data/processed/X_train.csv` (78MB) - Training features (273,488 samples, 1970-2016)
- `data/processed/X_test.csv` (19MB) - Testing features (66,657 samples, 2017-2023)
- `data/processed/y_train.csv` (1.3MB) - Training target values
- `data/processed/y_test.csv` (312KB) - Testing target values

**Preprocessing Objects**:
- `data/processed/scaler.pkl` - StandardScaler for feature normalization
- `data/processed/label_encoders.pkl` - Label encoders for categorical variables

## 🤖 Machine Learning Model Training Pipeline

### `02_model_training_xgboost.ipynb`
**Purpose**: Advanced machine learning model development using XGBoost regression for educational indicator prediction with comprehensive evaluation and production-ready model export.

## 🎯 Model Development Strategy

### **Algorithm Selection Rationale**
**Primary Algorithm**: XGBoost (Extreme Gradient Boosting)
- **Chosen for**: Superior performance with mixed categorical/numerical features
- **Advantages**: Handles complex non-linear relationships in education data
- **Interpretability**: Provides feature importance for policy insights
- **Robustness**: Excellent handling of temporal patterns across 50+ years

### **Model Comparison Framework**
**Benchmark Algorithms Tested**:
1. **XGBoost Regressor** (Optimized) - Primary model
2. **Random Forest Regressor** - Tree-based comparison
3. **Ridge Regression** - Linear baseline
4. **Naive Baseline** - Mean prediction benchmark

### **Hyperparameter Optimization**
**XGBoost Grid Search Parameters**:
- `n_estimators`: [100, 200] - Number of trees
- `max_depth`: [6, 8] - Tree depth control
- `learning_rate`: [0.1, 0.15] - Learning step size
- `subsample`: [0.8, 0.9] - Sample fraction per tree

**Validation Strategy**: 3-fold TimeSeriesSplit for temporal data integrity

## 📊 Model Performance Results

### **Outstanding Performance Achieved**
**XGBoost (Optimized) - Champion Model**:
- **R² Score**: 94.75% (exceptional variance explanation)
- **RMSE**: 7.69% (excellent prediction accuracy)
- **MAE**: 4.72% (median absolute error)
- **MAPE**: 4.72% (policy-relevant metric)

### **Algorithm Comparison Results**
**Performance Ranking**:
1. **XGBoost**: R² = 0.9475 (Champion)
2. **Random Forest**: R² = 0.8482 (Strong alternative)
3. **Ridge Regression**: R² = 0.6846 (Linear baseline)
4. **Naive Baseline**: R² = -0.0044 (Reference point)

**Key Insight**: XGBoost outperforms alternatives by significant margins, validating algorithm choice.

## 🔍 Feature Importance Analysis

### **Top 10 Most Important Features** (XGBoost Feature Importance)
1. **setting_average** (46.9%) - Country-level education context
2. **favourable_indicator** (12.1%) - Indicator direction flag
3. **indicator_abbr_encoded** (12.1%) - Education metric type
4. **indicator_name_encoded** (9.4%) - Detailed indicator description
5. **flag_encoded** (6.8%) - Data quality indicators
6. **whoreg6_encoded** (4.4%) - WHO regional classification
7. **wbincome2024_encoded** (3.3%) - World Bank income groups
8. **subgroup_encoded** (1.8%) - Population demographics
9. **year** (1.2%) - Temporal component
10. **iso3_encoded** (1.2%) - Country identifier

### **Policy Insights from Feature Importance**
- **Context Dominates**: Country-level averages are the strongest predictor (46.9%)
- **Indicator Type Matters**: Education metric classification highly influential (21.5% combined)
- **Regional Patterns**: Geographic and economic factors contribute significantly
- **Temporal Trends**: Year effect is moderate but consistent

## 📈 Model Validation and Quality Assessment

### **Prediction Quality Analysis**
**Performance by Indicator Value Ranges**:
- **0-20% Range**: RMSE = 5.97%, Best performance
- **20-40% Range**: RMSE = 8.28%
- **40-60% Range**: RMSE = 9.34%
- **60-80% Range**: RMSE = 8.12%
- **80-100% Range**: RMSE = 8.77%

### **Policy-Relevant Metrics**
- **Median Absolute Error**: 2.43% (excellent for decision support)
- **95% Confidence Interval**: ±17.01% (suitable for trend analysis)
- **Typical Prediction Error**: ±4.7 percentage points

## 🚀 Production Model Export

### **Model Artifacts Generated**
**Primary Model**:
- `models/eduinsight_xgboost_model.pkl` - Trained XGBoost model ready for deployment

**Model Documentation**:
- `models/model_metadata.pkl` - Comprehensive model information including:
  - Performance metrics (R², RMSE, MAE, MAPE)
  - Feature importance rankings
  - Best hyperparameters
  - Training dataset specifications
  - Production deployment metadata

### **Model Specifications for Production**
- **Training Samples**: 273,488 (1970-2016)
- **Test Samples**: 66,657 (2017-2023)
- **Features**: 15 engineered features
- **Model Type**: XGBoost Regressor
- **Best Parameters**: learning_rate=0.1, max_depth=8, n_estimators=100, subsample=0.9


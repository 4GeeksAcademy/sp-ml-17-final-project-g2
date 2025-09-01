# Processed Data Directory

This directory contains the machine learning-ready datasets for the EduInsight platform, derived from global education indicators spanning 1970-2023.

## Dataset Overview

The processed data represents 340,145 education indicator observations from 195 countries, transformed into a format suitable for XGBoost regression modeling. The target is to predict education indicator percentage values (0-100%) based on contextual features.

## Data Split Strategy

**Temporal Split Approach**: Data is split chronologically to simulate real-world forecasting scenarios where models predict future education trends based on historical patterns.

- **Training Period**: 1970-2016 (273,488 samples)
- **Testing Period**: 2017-2023 (66,657 samples)

This temporal approach ensures the model learns from historical data to predict recent years, making it suitable for policy forecasting applications.

## Files Description

### Training Data
- **X_train.csv**: Training features (273,488 samples × 15 features)
- **y_train.csv**: Training target values (education indicator percentages)

### Testing Data  
- **X_test.csv**: Testing features (66,657 samples × 15 features)
- **y_test.csv**: Testing target values (education indicator percentages)

### Complete Dataset
- **ml_ready_data.csv**: Full processed dataset with features and target combined

### Preprocessing Artifacts
- **scaler.pkl**: StandardScaler object for numerical feature normalization
- **label_encoders.pkl**: LabelEncoder objects for categorical feature encoding

## Features (15 total)

### Primary Features (Highest Importance)
1. **setting_average** (46.9% importance) - Average indicator value for the same setting/context
2. **favourable_indicator** (12.1% importance) - Binary flag indicating if higher values are favorable
3. **indicator_abbr_encoded** (12.1% importance) - Encoded indicator abbreviation

### Contextual Features
4. **indicator_name_encoded** (9.4% importance) - Encoded full indicator name
5. **flag_encoded** (6.8% importance) - Data quality and estimation flags
6. **whoreg6_encoded** (4.4% importance) - WHO regional classification
7. **wbincome2024_encoded** (3.3% importance) - World Bank income group classification
8. **subgroup_encoded** (1.8% importance) - Population subgroup (total, male, female, etc.)

### Temporal and Geographic Features
9. **year** (1.2% importance) - Observation year (1970-2023)
10. **iso3_encoded** (1.2% importance) - Country ISO3 code

### Additional Features
11-15. Various encoded categorical variables with lower importance

## Target Variable

**obs_value**: Education indicator percentage values ranging from 0% to 100%
- **Mean**: 43.69%
- **Range**: 0.0% - 100.0%
- **Type**: Continuous percentage values representing education outcomes

Examples include literacy rates, completion rates, enrollment ratios, and transition rates across different education levels and demographic groups.

## Preprocessing Applied

1. **Missing Value Handling**: Comprehensive cleaning and imputation
2. **Categorical Encoding**: Label encoding for all categorical variables
3. **Feature Scaling**: StandardScaler normalization for numerical features
4. **Feature Engineering**: Creation of contextual features like setting_average
5. **Temporal Preparation**: Chronological ordering for time-series aware splitting

## Model Performance Context

The processed data enables XGBoost models to achieve:
- **R² Score**: 94.75% (excellent variance explanation)
- **RMSE**: 7.69% (low prediction error)
- **MAE**: 4.72% (median absolute error)

This performance level makes the data suitable for policy decision support and education trend forecasting.
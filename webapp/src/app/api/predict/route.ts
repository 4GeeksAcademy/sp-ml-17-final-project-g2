import { NextRequest, NextResponse } from 'next/server';
import { executePythonScript } from '../../../lib';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, indicator, year } = body;

    // Validate required parameters
    if (!country || !indicator || !year) {
      return NextResponse.json(
        { error: 'Missing required parameters: country, indicator, year' },
        { status: 400 }
      );
    }

    // Validate year range
    const yearNum = parseInt(year);
    if (yearNum < 1970 || yearNum > 2030) {
      return NextResponse.json(
        { error: 'Year must be between 1970 and 2030' },
        { status: 400 }
      );
    }

    const scriptCode = `
import sys
import os
sys.path.append('.')
sys.path.append('../models')
sys.path.append('../data/processed')
import json
import pickle
import pandas as pd
import numpy as np
from db_utils import EduInsightDB

try:
    # Load model and encoders (using relative paths from database directory)
    with open('../models/eduinsight_xgboost_model.pkl', 'rb') as f:
        model = pickle.load(f)
    
    with open('../data/processed/label_encoders.pkl', 'rb') as f:
        encoders = pickle.load(f)
    
    with open('../data/processed/scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    
    # Get database connection for feature engineering
    db = EduInsightDB()
    
    # Prepare input data
    country = '${country}'
    indicator = '${indicator}'
    year = ${yearNum}
    
    # Fix common country name issues
    country_mapping = {
        'United States': 'United States of America',
        'US': 'United States of America',
        'USA': 'United States of America',
        'UK': 'The United Kingdom',
        'United Kingdom': 'The United Kingdom'
    }
    
    if country in country_mapping:
        country = country_mapping[country]
    
    # Create feature vector
    features = {}
    confidence = 0.95  # Start with high confidence
    
    # Encode categorical features with proper error handling
    try:
        features['setting_encoded'] = encoders['setting'].transform([country])[0]
        print(f"DEBUG: Country '{country}' encoded as {features['setting_encoded']}", file=sys.stderr)
    except ValueError:
        # Country not in training data - use most similar or average
        features['setting_encoded'] = 0  # Use first country as fallback
        confidence -= 0.3
        print(f"DEBUG: Unknown country '{country}', using fallback", file=sys.stderr)
    
    # Better indicator matching
    try:
        features['indicator_name_encoded'] = encoders['indicator_name'].transform([indicator])[0]
        print(f"DEBUG: Indicator encoded as {features['indicator_name_encoded']}", file=sys.stderr)
    except ValueError:
        # Try partial matching
        indicator_lower = indicator.lower()
        best_match = None
        best_score = 0
        
        for idx, enc_indicator in enumerate(encoders['indicator_name'].classes_):
            enc_lower = enc_indicator.lower()
            # Simple word overlap scoring
            words1 = set(indicator_lower.split())
            words2 = set(enc_lower.split())
            overlap = len(words1.intersection(words2))
            score = overlap / max(len(words1), len(words2))
            
            if score > best_score and score > 0.3:  # At least 30% word overlap
                best_score = score
                best_match = idx
        
        if best_match is not None:
            features['indicator_name_encoded'] = best_match
            confidence -= 0.1
            print(f"DEBUG: Indicator matched with score {best_score:.2f}", file=sys.stderr)
        else:
            features['indicator_name_encoded'] = 0  # Fallback
            confidence -= 0.2
            print(f"DEBUG: No good indicator match found", file=sys.stderr)
    
    # Get indicator abbreviation (first word or first few chars)
    indicator_words = indicator.split()
    if len(indicator_words) > 0:
        indicator_abbr = indicator_words[0]
    else:
        indicator_abbr = indicator[:10]
    
    try:
        features['indicator_abbr_encoded'] = encoders['indicator_abbr'].transform([indicator_abbr])[0]
    except ValueError:
        features['indicator_abbr_encoded'] = 0
        confidence -= 0.05
    
    # Set more realistic defaults based on training data analysis with regional context
    features['dimension_encoded'] = 0  # Total (most common)
    features['subgroup_encoded'] = 0   # Total (most common)
    features['iso3_encoded'] = features['setting_encoded']  # Same as country
    
    # Improved regional classification with better defaults
    # WHO regions: 0=African, 1=Americas, 2=European, 3=Eastern Mediterranean, 4=South-East Asia, 5=Western Pacific
    regional_mapping = {
        # African countries
        'Chad': 0, 'Nigeria': 0, 'South Africa': 0, 'Egypt': 0, 'Kenya': 0, 'Ghana': 0,
        # Americas
        'United States of America': 1, 'Brazil': 1, 'Canada': 1, 'Mexico': 1, 'Argentina': 1,
        # European
        'Spain': 2, 'Germany': 2, 'France': 2, 'United Kingdom': 2, 'Italy': 2, 'The United Kingdom': 2,
        # Eastern Mediterranean
        'Saudi Arabia': 3, 'Iran': 3, 'Iraq': 3, 'Jordan': 3,
        # South-East Asia
        'India': 4, 'Thailand': 4, 'Indonesia': 4, 'Myanmar': 4,
        # Western Pacific
        'China': 5, 'Japan': 5, 'Australia': 5, 'South Korea': 5, 'Philippines': 5
    }
    
    features['whoreg6_encoded'] = regional_mapping.get(country, 3)  # Default to Eastern Mediterranean (median region)
    
    # Income classification with more nuanced defaults
    # 0=Low income, 1=Lower middle income, 2=Upper middle income, 3=High income
    income_mapping = {
        # High income countries
        'United States of America': 3, 'Japan': 3, 'Germany': 3, 'France': 3, 'The United Kingdom': 3,
        'Australia': 3, 'Canada': 3, 'Spain': 3, 'Italy': 3, 'South Korea': 3,
        # Upper middle income
        'Brazil': 2, 'China': 2, 'Mexico': 2, 'Argentina': 2, 'South Africa': 2, 'Iran': 2,
        # Lower middle income  
        'India': 1, 'Nigeria': 1, 'Egypt': 1, 'Philippines': 1, 'Indonesia': 1,
        # Low income
        'Chad': 0, 'Myanmar': 0
    }
    
    features['wbincome2024_encoded'] = income_mapping.get(country, 1)  # Default to lower middle income
    features['flag_encoded'] = 0       # No flag (most common)
    features['year'] = year
    
    # Get REAL historical average for the country (this is crucial!)
    # Add temporal context and trend analysis
    try:
        historical_data = db.get_country_performance(country)
        if historical_data is not None and not historical_data.empty:
            # Improved indicator matching - try exact match first, then progressively broader
            similar_data = None
            
            # 1. Try exact indicator name match
            exact_match = historical_data[
                historical_data['indicator_name'] == indicator
            ]
            
            if not exact_match.empty:
                similar_data = exact_match
                print(f"DEBUG: Found exact indicator match with {len(similar_data)} samples", file=sys.stderr)
            
            # 2. Try key concept matching (more specific than just first 2 words)
            elif 'literacy' in indicator.lower():
                similar_data = historical_data[
                    historical_data['indicator_name'].str.contains('literacy', case=False, na=False)
                ]
                print(f"DEBUG: Found literacy indicators with {len(similar_data)} samples", file=sys.stderr)
            
            elif any(term in indicator.lower() for term in ['enrollment', 'enrolment']):
                similar_data = historical_data[
                    historical_data['indicator_name'].str.contains('enrollment|enrolment', case=False, na=False)
                ]
                print(f"DEBUG: Found enrollment indicators with {len(similar_data)} samples", file=sys.stderr)
            
            elif 'completion' in indicator.lower():
                similar_data = historical_data[
                    historical_data['indicator_name'].str.contains('completion', case=False, na=False)
                ]
                print(f"DEBUG: Found completion indicators with {len(similar_data)} samples", file=sys.stderr)
            
            # 3. Fallback to first 2 words (but this often catches too much)
            else:
                similar_data = historical_data[
                    historical_data['indicator_name'].str.contains(
                        '|'.join(indicator.split()[:2]), case=False, na=False
                    )
                ]
                print(f"DEBUG: Using fallback word matching with {len(similar_data)} samples", file=sys.stderr)
            
            if not similar_data.empty:
                # Calculate temporal features
                similar_data_sorted = similar_data.sort_values('year')
                features['setting_average'] = similar_data['estimate'].mean()
                
                # Add temporal trend analysis (without changing model structure)
                recent_data = similar_data_sorted.tail(5)  # Last 5 years
                older_data = similar_data_sorted.head(5)   # First 5 years
                
                if len(recent_data) >= 2 and len(older_data) >= 2:
                    recent_mean = recent_data['estimate'].mean()
                    older_mean = older_data['estimate'].mean()
                    trend_factor = (recent_mean - older_mean) / max(older_mean, 1)
                    
                    # Adjust setting_average based on temporal trend
                    if abs(trend_factor) > 0.1:  # Significant trend
                        # Project trend forward for future predictions
                        years_ahead = year - similar_data_sorted['year'].max()
                        if years_ahead > 0:
                            projected_change = trend_factor * years_ahead * 0.3  # Dampened projection
                            features['setting_average'] = max(0, min(100, 
                                features['setting_average'] * (1 + projected_change)))
                
                print(f"DEBUG: Using similar indicator average with temporal adjustment: {features['setting_average']:.2f}", file=sys.stderr)
                
                # Enhanced confidence based on data recency and completeness
                latest_year = similar_data_sorted['year'].max()
                data_recency = 2023 - latest_year  # Assuming 2023 as reference
                if data_recency <= 3:
                    confidence += 0.05  # Bonus for recent data
                elif data_recency > 7:
                    confidence -= 0.1   # Penalty for old data
                    
            else:
                # Use general country average with temporal context
                all_data_sorted = historical_data.sort_values('year')
                features['setting_average'] = historical_data['estimate'].mean()
                
                # Add general trend analysis for the country
                if len(all_data_sorted) >= 10:
                    recent_years = all_data_sorted.tail(5)
                    older_years = all_data_sorted.head(5)
                    
                    if len(recent_years) >= 3 and len(older_years) >= 3:
                        recent_mean = recent_years['estimate'].mean()
                        older_mean = older_years['estimate'].mean()
                        general_trend = (recent_mean - older_mean) / max(older_mean, 1)
                        
                        # Slight adjustment based on general country trend
                        years_ahead = year - all_data_sorted['year'].max()
                        if years_ahead > 0 and abs(general_trend) > 0.05:
                            projected_change = general_trend * years_ahead * 0.2
                            features['setting_average'] = max(0, min(100,
                                features['setting_average'] * (1 + projected_change)))
                
                print(f"DEBUG: Using general country average with temporal context: {features['setting_average']:.2f}", file=sys.stderr)
                confidence -= 0.1
        else:
            # Use global average from training data (more realistic than 50)
            # Add year-based adjustment for global trends
            base_global_average = 75.0
            
            # Simple global trend adjustment (education generally improving over time)
            year_factor = (year - 2020) * 0.5  # Modest improvement assumption
            features['setting_average'] = min(100, base_global_average + year_factor)
            confidence -= 0.2
            print(f"DEBUG: No historical data, using global average with year adjustment: {features['setting_average']:.2f}", file=sys.stderr)
            
    except Exception as e:
        # Fallback with year-based adjustment
        base_fallback = 75.0
        year_factor = (year - 2020) * 0.3
        features['setting_average'] = min(100, base_fallback + year_factor)
        confidence -= 0.2
        print(f"DEBUG: Error getting historical data: {e}, using fallback with temporal adjustment", file=sys.stderr)
    
    # Set indicator characteristics based on content with cultural awareness
    reading_keywords = ['reading', 'literacy', 'literate']
    math_keywords = ['math', 'numeracy', 'arithmetic', 'mathematics']
    completion_keywords = ['completion', 'complete', 'graduation']
    enrollment_keywords = ['enrollment', 'enroll', 'attendance']
    
    indicator_lower = indicator.lower()
    
    # More sophisticated indicator classification with cultural context
    # Note: "Favorable" is context-dependent - high enrollment may not be favorable 
    # if it means child labor reduction is needed, etc.
    base_favorable_indicators = ['literacy', 'completion', 'graduation', 'enrollment']
    potentially_unfavorable = ['dropout', 'inequality', 'gap', 'disparity']
    
    if any(keyword in indicator_lower for keyword in reading_keywords + math_keywords + completion_keywords + enrollment_keywords):
        # Check for negative indicators that shouldn't be considered favorable
        if any(neg_word in indicator_lower for neg_word in potentially_unfavorable):
            features['favourable_indicator'] = 0  # Lower values are better for negative indicators
        else:
            features['favourable_indicator'] = 1
    else:
        features['favourable_indicator'] = 0
    
    # Set analysis type flags
    features['is_gender_analysis'] = 1 if any(word in indicator_lower for word in ['gender', 'male', 'female', 'boy', 'girl']) else 0
    features['is_wealth_analysis'] = 1 if any(word in indicator_lower for word in ['wealth', 'income', 'rich', 'poor']) else 0
    features['is_residence_analysis'] = 1 if any(word in indicator_lower for word in ['rural', 'urban', 'residence']) else 0
    
    # Create feature array in correct order
    feature_names = ['setting_encoded', 'indicator_abbr_encoded', 'indicator_name_encoded', 
                     'dimension_encoded', 'subgroup_encoded', 'iso3_encoded', 'whoreg6_encoded', 
                     'wbincome2024_encoded', 'flag_encoded', 'year', 'setting_average', 
                     'favourable_indicator', 'is_gender_analysis', 'is_wealth_analysis', 'is_residence_analysis']
    
    feature_array = np.array([[features[name] for name in feature_names]])
    
    print(f"DEBUG: Raw features: {feature_array[0]}", file=sys.stderr)
    
    # CRITICAL: Apply scaling (model was trained on scaled features!)
    scaled_features = scaler.transform(feature_array)
    print(f"DEBUG: Scaled features: {scaled_features[0]}", file=sys.stderr)
    print(f"DEBUG: Key features - setting_average: {features['setting_average']:.2f}, country_encoded: {features['setting_encoded']}, indicator_encoded: {features['indicator_name_encoded']}", file=sys.stderr)
    
    # Make prediction with scaled features
    prediction = model.predict(scaled_features)[0]
    
    # Ensure confidence is reasonable with data quality assessment
    confidence = max(0.2, min(0.95, confidence))
    
    # Add data quality assessment
    data_quality_score = 1.0
    quality_issues = []
    
    # Check for potential data quality issues
    if features['setting_encoded'] == 0:  # Fallback country encoding
        data_quality_score -= 0.15
        quality_issues.append("Unknown country")
        
    if features['indicator_name_encoded'] == 0:  # Fallback indicator encoding
        data_quality_score -= 0.1
        quality_issues.append("Indicator approximation")
        
    if features['setting_average'] == 75.0:  # Global fallback average
        data_quality_score -= 0.2
        quality_issues.append("No historical data")
        
    # Adjust confidence based on data quality
    confidence = confidence * data_quality_score
    
    # Generate historical context and trend predictions
    historical_context = {}
    try:
        # Get historical data for the last 20 years
        current_year = 2023  # Last year with reliable data
        start_year = max(1990, current_year - 19)  # 20 years back
        
        # Get actual historical data
        if historical_data is not None and not historical_data.empty and similar_data is not None and not similar_data.empty:
            # Filter historical data for the specific indicator and time range
            recent_data = similar_data[
                (similar_data['year'] >= start_year) & 
                (similar_data['year'] <= current_year)
            ].sort_values('year')
            
            # Clean data: handle duplicates by taking the median value per year
            # This handles cases where there are multiple data sources or gender-disaggregated data
            cleaned_data = recent_data.groupby('year')['estimate'].agg([
                'median',   # Use median as it's robust to outliers
                'count',    # Track how many values per year
                'std'       # Standard deviation to assess quality
            ]).reset_index()
            
            # Rename columns for clarity
            cleaned_data.columns = ['year', 'estimate', 'data_points', 'std_dev']
            
            # Fill NaN standard deviations (when only 1 data point) with 0
            cleaned_data['std_dev'] = cleaned_data['std_dev'].fillna(0)
            
            print(f"DEBUG: Cleaned data for {country} - {len(cleaned_data)} years, avg {cleaned_data['data_points'].mean():.1f} points per year", file=sys.stderr)
            
            historical_points = []
            for _, row in cleaned_data.iterrows():
                historical_points.append({
                    'year': int(row['year']),
                    'value': float(row['estimate']),
                    'type': 'historical'
                })
            
            # Generate predictions for missing years between last data and target year
            if len(historical_points) > 0:
                last_data_year = cleaned_data['year'].max()
                
                # Predict intermediate years if there's a gap
                missing_years = []
                
                # Calculate more sophisticated trend for progressive predictions
                if len(cleaned_data) >= 3:
                    # Analyze historical trend over different time windows
                    years = cleaned_data['year'].values
                    values = cleaned_data['estimate'].values
                    
                    # Calculate trend using multiple methods
                    linear_trend = np.polyfit(years, values, 1)[0]
                    
                    # Recent trend (last 5 years if available)
                    recent_years = years[-5:] if len(years) >= 5 else years
                    recent_values = values[-5:] if len(values) >= 5 else values
                    recent_trend = np.polyfit(recent_years, recent_values, 1)[0] if len(recent_years) > 1 else linear_trend
                    
                    # Conservative trend weighting - limit extreme projections
                    weighted_trend = (linear_trend * 0.3 + recent_trend * 0.7)
                    
                    # Cap trend magnitude to prevent unrealistic projections
                    max_yearly_change = 2.0  # Maximum 2% change per year
                    weighted_trend = max(-max_yearly_change, min(max_yearly_change, weighted_trend))
                    
                    # Adaptive dampening based on indicator type and current level
                    last_value = values[-1]
                    
                    # Different dampening strategies by indicator type
                    if 'literacy' in indicator.lower():
                        # Literacy rates: very stable for developed countries
                        if last_value > 90:  # High literacy countries should be very stable
                            dampening_factor = 0.05  # Extremely conservative
                            weighted_trend = max(-0.2, min(0.2, weighted_trend))  # Cap at 0.2% per year
                            # For very high performers, assume stability rather than decline
                            if weighted_trend < -0.1:
                                weighted_trend = 0.05  # Slight improvement instead of decline
                        else:
                            dampening_factor = 0.3
                            weighted_trend = max(-1.0, min(1.0, weighted_trend))
                        plateau_resistance = max(0.1, (100 - last_value) / 100)
                    elif any(term in indicator.lower() for term in ['enrollment', 'enrolment']):
                        # Enrollment: more variable but still bounded
                        if last_value > 95:  # Near universal enrollment
                            dampening_factor = 0.1
                            weighted_trend = max(-0.5, min(0.5, weighted_trend))
                            if weighted_trend < -0.2:
                                weighted_trend = 0.1  # Assume slight improvement
                        else:
                            dampening_factor = 0.4
                            weighted_trend = max(-2.0, min(2.0, weighted_trend))
                        plateau_resistance = max(0.15, (100 - last_value) / 100)
                    else:
                        # Other indicators: moderate dampening
                        dampening_factor = 0.3
                        weighted_trend = max(-1.5, min(1.5, weighted_trend))
                        plateau_resistance = max(0.2, (100 - last_value) / 100)
                    
                    print(f"DEBUG: Trend analysis - Linear: {linear_trend:.3f}, Recent: {recent_trend:.3f}, Capped Weighted: {weighted_trend:.3f}", file=sys.stderr)
                else:
                    # Minimal trend for limited data - assume stability
                    weighted_trend = 0
                    dampening_factor = 0.1
                    plateau_resistance = 0.5
                
                # Generate progressive predictions year by year with stability focus
                if historical_points:
                    base_value = historical_points[-1]['value']  # Last known historical value
                else:
                    base_value = features['setting_average']
                
                # For progressive predictions, use a more stable approach
                for pred_year in range(last_data_year + 1, year + 1):
                    # Create prediction for this year
                    temp_features = features.copy()
                    temp_features['year'] = pred_year
                    
                    # Years since last known data
                    years_ahead = pred_year - last_data_year
                    
                    # Simple, realistic progression based on indicator type and current level
                    if 'literacy' in indicator.lower() and base_value > 90:
                        # High literacy countries: assume stability with tiny improvements
                        progression = 0.1 * years_ahead  # 0.1% per year improvement
                        projected_value = min(99.5, base_value + progression)
                    elif 'literacy' in indicator.lower():
                        # Lower literacy countries: moderate improvement
                        progression = 0.5 * years_ahead  # 0.5% per year improvement
                        projected_value = min(95, base_value + progression)
                    elif any(term in indicator.lower() for term in ['enrollment', 'enrolment']) and base_value > 90:
                        # High enrollment: stability with small fluctuations
                        progression = 0.2 * years_ahead + (years_ahead % 2 - 0.5)  # Small variation
                        projected_value = max(85, min(99, base_value + progression))
                    elif any(term in indicator.lower() for term in ['enrollment', 'enrolment']):
                        # Lower enrollment: moderate improvement
                        progression = 1.0 * years_ahead  # 1% per year improvement
                        projected_value = min(95, base_value + progression)
                    else:
                        # Other indicators: conservative improvement
                        progression = 0.3 * years_ahead
                        projected_value = max(0, min(100, base_value + progression))
                    
                    temp_features['setting_average'] = projected_value
                    
                    # Create feature array and predict
                    temp_array = np.array([[temp_features[name] for name in feature_names]])
                    temp_scaled = scaler.transform(temp_array)
                    temp_prediction = model.predict(temp_scaled)[0]
                    
                    # Blend model prediction with stable progression (60% model, 40% stable)
                    blended_prediction = temp_prediction * 0.6 + projected_value * 0.4
                    
                    # Ensure realistic bounds
                    blended_prediction = max(0, min(100, blended_prediction))
                    
                    missing_years.append({
                        'year': pred_year,
                        'value': float(blended_prediction),
                        'type': 'predicted' if pred_year < year else 'target'
                    })
                    
                    print(f"DEBUG: Year {pred_year}, Base: {base_value:.1f}, Projected: {projected_value:.1f}, Model: {temp_prediction:.1f}, Blended: {blended_prediction:.1f}", file=sys.stderr)
                
                historical_context = {
                    'historical_data': historical_points,
                    'predictions': missing_years,
                    'trend_info': {
                        'data_points': len(historical_points),
                        'year_range': f"{start_year}-{current_year}",
                        'last_known_year': int(last_data_year),
                        'last_known_value': float(recent_data.iloc[-1]['estimate'])
                    }
                }
            else:
                historical_context = {
                    'historical_data': [],
                    'predictions': [{
                        'year': year,
                        'value': float(prediction),
                        'type': 'target'
                    }],
                    'trend_info': {
                        'data_points': 0,
                        'note': 'No historical data available for this indicator'
                    }
                }
        else:
            # No historical data - just return the target prediction
            historical_context = {
                'historical_data': [],
                'predictions': [{
                    'year': year,
                    'value': float(prediction),
                    'type': 'target'
                }],
                'trend_info': {
                    'data_points': 0,
                    'note': 'No historical data available for this country/indicator combination'
                }
            }
            
    except Exception as trend_error:
        print(f"DEBUG: Trend analysis failed: {trend_error}", file=sys.stderr)
        historical_context = {
            'historical_data': [],
            'predictions': [{
                'year': year,
                'value': float(prediction),
                'type': 'target'
            }],
            'trend_info': {
                'data_points': 0,
                'note': 'Trend analysis unavailable'
            }
        }
    
    result = {
        'prediction': float(prediction),
        'confidence': float(confidence),
        'year': year,
        'country': country,
        'indicator': indicator,
        'historical_context': historical_context,
        'model_info': {
            'type': 'XGBoost Regressor',
            'accuracy': '94.75%',
            'training_samples': 273488
        },
        'debug_info': {
            'setting_average': float(features['setting_average']),
            'country_encoded': int(features['setting_encoded']),
            'indicator_encoded': int(features['indicator_name_encoded']),
            'data_quality_score': float(data_quality_score),
            'quality_issues': quality_issues,
            'regional_context': {
                'who_region': int(features['whoreg6_encoded']),
                'income_level': int(features['wbincome2024_encoded'])
            }
        }
    }
    
    print(json.dumps(result))
    
except Exception as e:
    error_result = {
        'error': f'Prediction failed: {str(e)}',
        'country': '${country}',
        'indicator': '${indicator}',
        'year': ${yearNum}
    }
    print(json.dumps(error_result))
`;

    const result = await executePythonScript(scriptCode) as { error?: string };
    
    // Check if result contains an error
    if (result.error) {
      return NextResponse.json(result, { status: 500 });
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in ML prediction:', error);
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}

// Also support GET for simple testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country') || 'Spain';
  const indicator = searchParams.get('indicator') || 'Literacy rate, adult total (% of people ages 15 and above)';
  const year = searchParams.get('year') || '2025';

  // Redirect to POST method
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ country, indicator, year }),
    headers: { 'Content-Type': 'application/json' }
  }));
}

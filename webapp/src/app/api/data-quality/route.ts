import { NextRequest, NextResponse } from 'next/server';
import { executePythonScript } from '../../../lib/index';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country') || '';

  try {
    const scriptCode = `
import sys
import os
sys.path.append('.')
sys.path.append('../database')
import json
import pandas as pd
from db_utils import EduInsightDB

try:
    db = EduInsightDB()
    country = '${country}'
    
    # Get comprehensive data quality analysis
    if country:
        # Country-specific analysis
        country_data = db.get_country_performance(country)
        
        if country_data is not None and not country_data.empty:
            # Temporal coverage analysis
            year_range = country_data['year'].max() - country_data['year'].min()
            missing_years = set(range(country_data['year'].min(), country_data['year'].max() + 1)) - set(country_data['year'].unique())
            
            # Indicator coverage analysis
            total_indicators = country_data['indicator_name'].nunique()
            indicators_by_year = country_data.groupby('year')['indicator_name'].nunique()
            avg_indicators_per_year = indicators_by_year.mean()
            
            # Data recency analysis
            latest_year = country_data['year'].max()
            data_age = 2023 - latest_year
            
            # Completeness analysis
            total_possible_records = year_range * total_indicators
            actual_records = len(country_data)
            completeness_ratio = actual_records / max(total_possible_records, 1)
            
            # Quality score calculation
            recency_score = max(0, (10 - data_age) / 10) if data_age <= 10 else 0
            coverage_score = min(1, avg_indicators_per_year / 20)  # Assuming 20 is good coverage
            completeness_score = min(1, completeness_ratio)
            
            overall_quality = (recency_score + coverage_score + completeness_score) / 3
            
            result = {
                'country': country,
                'data_quality': {
                    'overall_score': float(overall_quality),
                    'recency_score': float(recency_score),
                    'coverage_score': float(coverage_score),
                    'completeness_score': float(completeness_score)
                },
                'statistics': {
                    'total_records': int(actual_records),
                    'year_range': int(year_range),
                    'latest_year': int(latest_year),
                    'data_age_years': int(data_age),
                    'total_indicators': int(total_indicators),
                    'avg_indicators_per_year': float(avg_indicators_per_year),
                    'missing_years': len(missing_years),
                    'completeness_ratio': float(completeness_ratio)
                },
                'recommendations': []
            }
            
            # Generate recommendations based on quality issues
            if data_age > 5:
                result['recommendations'].append(f"Data is {data_age} years old - predictions may be less reliable")
            if completeness_ratio < 0.3:
                result['recommendations'].append("Limited data coverage - consider alternative countries for comparison")
            if avg_indicators_per_year < 5:
                result['recommendations'].append("Few indicators available - results may not be comprehensive")
            if len(missing_years) > year_range * 0.3:
                result['recommendations'].append("Significant data gaps detected - temporal analysis may be limited")
                
        else:
            result = {
                'country': country,
                'error': 'No data available for this country',
                'data_quality': {
                    'overall_score': 0.0,
                    'recency_score': 0.0,
                    'coverage_score': 0.0,
                    'completeness_score': 0.0
                },
                'recommendations': ['This country has no available education data in our database']
            }
    else:
        # Global data quality overview
        all_data = db.execute_query("SELECT COUNT(*) as total_records, COUNT(DISTINCT setting) as countries, COUNT(DISTINCT indicator_name) as indicators, MIN(date) as earliest_year, MAX(date) as latest_year FROM education_data")
        
        result = {
            'global_overview': {
                'total_records': int(all_data.iloc[0]['total_records']),
                'countries': int(all_data.iloc[0]['countries']),
                'indicators': int(all_data.iloc[0]['indicators']),
                'time_span': f"{int(all_data.iloc[0]['earliest_year'])}-{int(all_data.iloc[0]['latest_year'])}"
            }
        }
    
    print(json.dumps(result))
    
except Exception as e:
    error_result = {
        'error': f'Data quality analysis failed: {str(e)}',
        'country': '${country}'
    }
    print(json.dumps(error_result))
`;

    const result = await executePythonScript(scriptCode) as { error?: string };
    
    if (result.error) {
      return NextResponse.json(result, { status: 500 });
    }
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=7200'
      }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in data quality analysis:', error);
    return NextResponse.json(
      { error: `Failed to analyze data quality: ${errorMessage}` },
      { status: 500 }
    );
  }
}

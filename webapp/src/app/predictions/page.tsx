'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Brain, Target, TrendingUp, AlertCircle, CheckCircle, BarChart3, Sparkles, Calendar } from 'lucide-react';

interface PredictionResult {
  prediction: number;
  confidence: number;
  year: number;
  country: string;
  indicator: string;
  historical_context?: {
    historical_data: Array<{
      year: number;
      value: number;
      type: 'historical';
    }>;
    predictions: Array<{
      year: number;
      value: number;
      type: 'predicted' | 'target';
    }>;
    trend_info: {
      data_points: number;
      year_range?: string;
      last_known_year?: number;
      last_known_value?: number;
      note?: string;
    };
  };
  model_info: {
    type: string;
    accuracy: string;
    training_samples: number;
  };
  debug_info?: {
    setting_average: number;
    country_encoded: number;
    indicator_encoded: number;
    data_quality_score: number;
    quality_issues: string[];
    regional_context: {
      who_region: number;
      income_level: number;
    };
  };
  error?: string;
}

export default function PredictionsPage() {
  const [countries, setCountries] = useState<string[]>([]);
  const [indicators, setIndicators] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('Spain');
  const [selectedIndicator, setSelectedIndicator] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string>('');
  
  // Chart hover state
  const [hoveredPoint, setHoveredPoint] = useState<{year: number, value: number, type: string} | null>(null);
  const [mousePosition, setMousePosition] = useState<{x: number, y: number}>({x: 0, y: 0});

  // Function to identify primary indicators
  const isPrimaryIndicator = (indicator: string): boolean => {
    const primaryKeywords = [
      'literacy', 'literate', 'reading', 'writing',
      'enrollment', 'enrolment', 'school attendance',
      'completion', 'graduate', 'finishing',
      'net enrollment', 'gross enrollment',
      'primary education', 'secondary education'
    ];
    
    const lowerIndicator = indicator.toLowerCase();
    return primaryKeywords.some(keyword => lowerIndicator.includes(keyword));
  };

  // Function to format indicator display with icon
  const formatIndicatorDisplay = (indicator: string): string => {
    if (isPrimaryIndicator(indicator)) {
      return `🥇 ${indicator.length > 55 ? indicator.substring(0, 55) + '...' : indicator}`;
    }
    return indicator.length > 60 ? `${indicator.substring(0, 60)}...` : indicator;
  };

  // Fetch countries and indicators on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, indicatorsRes] = await Promise.all([
          fetch('/api/countries'),
          fetch('/api/indicators')
        ]);
        
        const countriesData = await countriesRes.json();
        const indicatorsData = await indicatorsRes.json();
        
        setCountries(countriesData);
        setIndicators(indicatorsData);
        
        // Set default indicator to a literacy indicator if available
        if (indicatorsData.length > 0) {
          // Try to find a literacy indicator as default
          const literacyIndicator = indicatorsData.find((ind: string) => 
            ind.toLowerCase().includes('literacy rate, adult')
          );
          setSelectedIndicator(literacyIndicator || indicatorsData[0]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load data');
      }
    };

    fetchData();
  }, []);

  const handlePredict = async () => {
    if (!selectedCountry || !selectedIndicator || !selectedYear) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const requestData = {
      country: selectedCountry,
      indicator: selectedIndicator,
      year: parseInt(selectedYear)
    };

    console.log('Sending prediction request:', requestData);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Received prediction response:', data);

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError('Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ML Predictions</h1>
                <p className="text-gray-600">XGBoost Education Forecasting (94.75% Accuracy)</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-500">Model Training</div>
                <div className="font-semibold text-gray-900">273K+ Samples</div>
              </div>
              <Link
                href="/"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Usage Instructions */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">How to Use ML Predictions</h3>
              <div className="text-purple-800 space-y-2">
                <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-purple-600" />Select a country you want to analyze</p>
                <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-purple-600" />Choose an education indicator (e.g., literacy rate, enrollment)</p>
                <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-purple-600" />Pick a target year (2024-2030) for the prediction</p>
                <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-purple-600" />Our XGBoost model will predict the indicator value with confidence score</p>
                <p className="text-sm italic mt-2">⚡ Model trained on 273K+ data points with 94.75% accuracy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Indicator Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Education Indicators Guide</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Primary Indicators */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-amber-800">🥇 Primary Indicators</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-amber-900">Literacy Rate</p>
                    <p className="text-amber-700">Foundation of education - most reliable predictor</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-amber-900">Primary/Secondary Enrollment</p>
                    <p className="text-amber-700">Access to education - key development metric</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-amber-900">Completion Rates</p>
                    <p className="text-amber-700">Educational effectiveness and retention</p>
                  </div>
                </div>
                <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 mt-4">
                  <p className="text-amber-800 font-medium text-xs">💡 These indicators are most reliable for predictions due to consistent global data collection and strong correlation with development outcomes.</p>
                </div>
              </div>
            </div>

            {/* Secondary Indicators */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-blue-800">📊 Specialized Indicators</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-blue-900">Gender Parity Indices</p>
                    <p className="text-blue-700">Educational equality measurements</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-blue-900">Out-of-School Rates</p>
                    <p className="text-blue-700">Educational access challenges</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-blue-900">Learning Assessments</p>
                    <p className="text-blue-700">Quality and learning outcomes</p>
                  </div>
                </div>
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mt-4">
                  <p className="text-blue-800 font-medium text-xs">📈 More specialized metrics with varying data availability - useful for specific policy insights.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-purple-100 rounded">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-purple-900 mb-1">💡 Prediction Tip</p>
                <p className="text-purple-800">Start with <span className="font-semibold text-amber-700">Primary Indicators</span> for most reliable predictions. Our XGBoost model performs best on literacy rates and enrollment data due to comprehensive historical datasets.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Target className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Generate Prediction</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 bg-white text-slate-900 font-medium rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education Indicator
                <span className="text-xs text-amber-600 ml-2">🥇 = Primary Indicator</span>
              </label>
              <select
                value={selectedIndicator}
                onChange={(e) => setSelectedIndicator(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 bg-white text-slate-900 font-medium rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
              >
                {indicators.map(indicator => (
                  <option 
                    key={indicator} 
                    value={indicator}
                    style={{
                      backgroundColor: isPrimaryIndicator(indicator) ? '#fef3c7' : 'white',
                      fontWeight: isPrimaryIndicator(indicator) ? '600' : '400'
                    }}
                  >
                    {formatIndicatorDisplay(indicator)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Primary indicators (🥇) provide the most reliable predictions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Year
              </label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                min="2024"
                max="2030"
                placeholder="e.g., 2025"
                className="w-full px-4 py-3 border-2 border-slate-300 bg-white text-slate-900 font-medium rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
              />
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Prediction...</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-5 w-5" />
                <span>Generate Prediction</span>
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Prediction Result */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-4 mb-6">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Prediction Result</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Main Prediction */}
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Predicted Value</div>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {result.prediction.toFixed(2)}
                </div>
                <div className="text-gray-600">
                  {result.indicator.length > 50 
                    ? `${result.indicator.substring(0, 50)}...` 
                    : result.indicator}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {result.country} • {result.year}
                </div>
              </div>

              {/* Confidence & Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Confidence Level</span>
                  <span className={`font-bold ${getConfidenceColor(result.confidence)}`}>
                    {getConfidenceText(result.confidence)} ({(result.confidence * 100).toFixed(1)}%)
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Model Type</span>
                  <span className="font-semibold text-gray-900">{result.model_info.type}</span>
                </div>

                {/* Enhanced Quality Information */}
                {result.debug_info && (
                  <>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span className="text-blue-700 font-medium">Data Quality</span>
                      <span className={`font-bold ${
                        result.debug_info.data_quality_score >= 0.7 ? 'text-green-600' : 
                        result.debug_info.data_quality_score >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(result.debug_info.data_quality_score * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="text-green-700 font-medium">Historical Average</span>
                      <span className="font-semibold text-green-900">
                        {result.debug_info.setting_average.toFixed(1)}%
                      </span>
                    </div>

                    {result.debug_info.quality_issues && result.debug_info.quality_issues.length > 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="font-medium text-yellow-800 mb-2">Quality Notes:</div>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {result.debug_info.quality_issues.map((issue, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">⚠️</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.debug_info.regional_context && (
                      <div className="p-4 bg-indigo-50 rounded-lg">
                        <div className="font-medium text-indigo-800 mb-2">Regional Context:</div>
                        <div className="text-sm text-indigo-700 space-y-1">
                          <div>WHO Region: {['African', 'Americas', 'European', 'E. Mediterranean', 'SE Asia', 'W. Pacific'][result.debug_info.regional_context.who_region] || 'Unknown'}</div>
                          <div>Income Level: {['Low', 'Lower middle', 'Upper middle', 'High'][result.debug_info.regional_context.income_level] || 'Unknown'}</div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Model Accuracy</span>
                  <span className="font-semibold text-gray-900">{result.model_info.accuracy}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Training Data</span>
                  <span className="font-semibold text-gray-900">
                    {result.model_info.training_samples.toLocaleString()} samples
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Confidence Level</span>
                <span>{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    result.confidence >= 0.8 ? 'bg-green-500' :
                    result.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.confidence * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Historical Trend Visualization */}
        {result && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <div className="text-sm">
              <p><strong>Debug Info:</strong></p>
              <p>• historical_context exists: {result.historical_context ? 'YES' : 'NO'}</p>
              {result.historical_context && (
                <>
                  <p>• historical_data length: {result.historical_context.historical_data?.length || 0}</p>
                  <p>• predictions length: {result.historical_context.predictions?.length || 0}</p>
                  <p>• data_points: {result.historical_context.trend_info?.data_points || 0}</p>
                </>
              )}
            </div>
          </div>
        )}
        
        {result && result.historical_context && result.historical_context.trend_info.data_points > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <div className="flex items-center space-x-4 mb-6">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Historical Trend & Predictions</h3>
            </div>
            
            {result.historical_context.trend_info.data_points > 0 ? (
              <div>
                <div className="mb-4 text-sm text-gray-600">
                  <div className="flex flex-wrap gap-4">
                    <span>📊 <strong>{result.historical_context.trend_info.data_points}</strong> historical data points</span>
                    {result.historical_context.trend_info.year_range && (
                      <span>📅 Range: <strong>{result.historical_context.trend_info.year_range}</strong></span>
                    )}
                    {result.historical_context.trend_info.last_known_value && (
                      <span>📈 Last known: <strong>{result.historical_context.trend_info.last_known_value}%</strong> ({result.historical_context.trend_info.last_known_year})</span>
                    )}
                  </div>
                </div>

                {/* Clean Line Chart Visualization */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">{result.indicator}</h4>
                    <p className="text-sm text-gray-600">{result.country} • Timeline View</p>
                  </div>
                  
                  {(() => {
                    // Combine and sort all data
                    const historicalData = result.historical_context.historical_data || [];
                    const predictionData = result.historical_context.predictions || [];
                    
                    // Get last 12 historical points and all predictions
                    const recentHistorical = historicalData.slice(-12);
                    const allData = [...recentHistorical, ...predictionData].sort((a, b) => a.year - b.year);
                    
                    if (allData.length === 0) return <div className="text-center text-gray-500">No data available</div>;

                    // Fixed scale from 0 to 100% for better big picture view
                    const chartHeight = 250;
                    const chartWidth = Math.min(700, allData.length * 35);
                    const leftMargin = 60;
                    const bottomMargin = 40;
                    
                    return (
                      <div className="flex justify-center">
                        <div 
                          className="relative bg-white rounded border border-gray-200 shadow-sm" 
                          style={{ width: `${chartWidth + leftMargin}px`, height: `${chartHeight + bottomMargin}px` }}
                        >
                          {/* Tooltip overlay */}
                          {hoveredPoint && (
                            <div
                              className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 pointer-events-none shadow-lg"
                              style={{
                                left: `${mousePosition.x + 10}px`,
                                top: `${mousePosition.y - 40}px`,
                                transform: mousePosition.x > window.innerWidth - 200 ? 'translateX(-100%)' : 'none'
                              }}
                            >
                              <div className="font-semibold">{hoveredPoint.year}</div>
                              <div className="text-yellow-300">{hoveredPoint.value.toFixed(1)}%</div>
                              <div className="text-xs text-gray-300 capitalize">
                                {hoveredPoint.type === 'target' ? '🎯 Target Year' : 
                                 hoveredPoint.type === 'predicted' ? '🔮 ML Prediction' : 
                                 '📊 Historical Data'}
                              </div>
                            </div>
                          )}

                          {/* Y-axis labels */}
                          <div className="absolute left-0 top-0 flex flex-col justify-between text-xs text-gray-500 font-mono" style={{ height: `${chartHeight}px`, width: `${leftMargin-10}px` }}>
                            <span className="text-right">100%</span>
                            <span className="text-right">75%</span>
                            <span className="text-right">50%</span>
                            <span className="text-right">25%</span>
                            <span className="text-right">0%</span>
                          </div>
                          
                          {/* Chart Area */}
                          <div className="absolute" style={{ left: `${leftMargin}px`, top: '0px', width: `${chartWidth - leftMargin}px`, height: `${chartHeight}px` }}>
                            <svg width={chartWidth - leftMargin} height={chartHeight} className="absolute inset-0">
                              {/* Grid lines */}
                              {Array.from({ length: 5 }, (_, i) => (
                                <line
                                  key={i}
                                  x1="0"
                                  y1={i * (chartHeight / 4)}
                                  x2={chartWidth - leftMargin}
                                  y2={i * (chartHeight / 4)}
                                  stroke="#f3f4f6"
                                  strokeWidth="1"
                                />
                              ))}
                              
                              {/* Vertical separation between historical and predicted data */}
                              {(() => {
                                const lastHistoricalIndex = recentHistorical.length - 1;
                                if (lastHistoricalIndex >= 0 && predictionData.length > 0) {
                                  const x = ((lastHistoricalIndex + 0.5) / (allData.length - 1)) * (chartWidth - leftMargin);
                                  return (
                                    <line
                                      x1={x}
                                      y1="0"
                                      x2={x}
                                      y2={chartHeight}
                                      stroke="#d1d5db"
                                      strokeWidth="2"
                                      strokeDasharray="5,5"
                                    />
                                  );
                                }
                                return null;
                              })()}
                              
                              {/* Data line */}
                              <polyline
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="3"
                                points={allData.map((point, index) => {
                                  const x = (index / (allData.length - 1)) * (chartWidth - leftMargin);
                                  const y = chartHeight - (point.value / 100) * chartHeight;
                                  return `${x},${y}`;
                                }).join(' ')}
                              />
                              
                              {/* Data points with hover tooltips */}
                              {allData.map((point, index) => {
                                const x = (index / (allData.length - 1)) * (chartWidth - leftMargin);
                                const y = chartHeight - (point.value / 100) * chartHeight;
                                
                                let color = '#3b82f6'; // Blue for historical
                                let size = 4;
                                if (point.type === 'predicted') { color = '#10b981'; size = 5; } // Green for predictions
                                if (point.type === 'target') { color = '#f59e0b'; size = 6; } // Yellow for target
                                
                                return (
                                  <g key={index}>
                                    <circle
                                      cx={x}
                                      cy={y}
                                      r={size}
                                      fill={color}
                                      stroke="white"
                                      strokeWidth="2"
                                      className="hover:stroke-gray-400 hover:stroke-4 transition-all duration-200 cursor-pointer"
                                      onMouseEnter={(e) => {
                                        setHoveredPoint({year: point.year, value: point.value, type: point.type});
                                        setMousePosition({x: e.clientX, y: e.clientY});
                                      }}
                                      onMouseLeave={() => setHoveredPoint(null)}
                                      onMouseMove={(e) => {
                                        setMousePosition({x: e.clientX, y: e.clientY});
                                      }}
                                    />
                                    
                                    {/* Enhanced hover area for better interaction */}
                                    <circle
                                      cx={x}
                                      cy={y}
                                      r={size + 6}
                                      fill="transparent"
                                      className="cursor-pointer"
                                      onMouseEnter={(e) => {
                                        setHoveredPoint({year: point.year, value: point.value, type: point.type});
                                        setMousePosition({x: e.clientX, y: e.clientY});
                                      }}
                                      onMouseLeave={() => setHoveredPoint(null)}
                                      onMouseMove={(e) => {
                                        setMousePosition({x: e.clientX, y: e.clientY});
                                      }}
                                    />
                                  </g>
                                );
                              })}
                            </svg>
                          </div>
                          
                          {/* X-axis labels */}
                          <div className="absolute flex justify-between text-xs text-gray-500 font-mono" style={{ left: `${leftMargin}px`, top: `${chartHeight + 10}px`, width: `${chartWidth - leftMargin}px` }}>
                            {allData.filter((_, i) => i % Math.max(1, Math.floor(allData.length / 6)) === 0).map((point, index) => (
                              <span key={index}>{point.year}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Legend */}
                  <div className="mt-6 flex justify-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span>Historical Data</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span>ML Predictions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span>Target Year</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Summary Cards */}
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-5">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-blue-800 font-semibold">Historical Average</div>
                    </div>
                    <div className="text-blue-900 text-2xl font-bold">
                      {result.historical_context.historical_data.length > 0 
                        ? (result.historical_context.historical_data.reduce((sum, d) => sum + d.value, 0) / result.historical_context.historical_data.length).toFixed(1)
                        : 'N/A'
                      }%
                    </div>
                    <div className="text-blue-700 text-xs mt-1">
                      Based on {result.historical_context.historical_data.length} data points
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-5">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-green-800 font-semibold">ML Prediction</div>
                    </div>
                    <div className="text-green-900 text-2xl font-bold">
                      {result.prediction.toFixed(1)}%
                    </div>
                    <div className="text-green-700 text-xs mt-1">
                      Target year {result.year}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-5">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-purple-800 font-semibold">Forecast Span</div>
                    </div>
                    <div className="text-purple-900 text-2xl font-bold">
                      {result.historical_context.predictions.filter(p => p.type === 'predicted').length}
                    </div>
                    <div className="text-purple-700 text-xs mt-1">
                      Years predicted
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No Historical Data Available</p>
                <p className="text-sm mt-2">
                  {result.historical_context.trend_info.note || 'This country/indicator combination has limited historical data.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Model Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Model</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <strong>Algorithm:</strong> XGBoost (Extreme Gradient Boosting)<br/>
              <strong>Training Data:</strong> 273,488 education records<br/>
              <strong>Features:</strong> 15 engineered features including country, indicator, year, and historical averages
            </div>
            <div>
              <strong>Performance:</strong> 94.75% R² accuracy<br/>
              <strong>Coverage:</strong> 195 countries, 64 indicators<br/>
              <strong>Time Range:</strong> 1970-2023 (predicting 2024-2030)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

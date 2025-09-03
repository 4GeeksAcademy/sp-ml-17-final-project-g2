'use client';

import { useState, useEffect } from 'react';
import { Brain, Target, TrendingUp, AlertCircle, CheckCircle, ArrowLeft, BarChart3, Sparkles, Calendar, Globe } from 'lucide-react';

interface PredictionResult {
  prediction: number;
  confidence: number;
  year: number;
  country: string;
  indicator: string;
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
        
        // Set default indicator
        if (indicatorsData.length > 0) {
          setSelectedIndicator(indicatorsData[0]);
        }
      } catch (err) {
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

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: selectedCountry,
          indicator: selectedIndicator,
          year: parseInt(selectedYear)
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
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
              <a
                href="/"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </a>
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
              </label>
              <select
                value={selectedIndicator}
                onChange={(e) => setSelectedIndicator(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 bg-white text-slate-900 font-medium rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
              >
                {indicators.map(indicator => (
                  <option key={indicator} value={indicator}>
                    {indicator.length > 60 ? `${indicator.substring(0, 60)}...` : indicator}
                  </option>
                ))}
              </select>
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

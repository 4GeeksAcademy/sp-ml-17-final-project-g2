'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Globe, TrendingUp, BookOpen, Users, Filter, CheckCircle, Info } from 'lucide-react';

interface EducationRecord {
  year: number;
  indicator_name: string;
  estimate: number;
}

interface CountrySummary {
  reading_score: number | null;
  math_score: number | null;
  science_score: number | null;
  total_records: number;
}

interface DataQuality {
  country?: string;
  data_quality: {
    overall_score: number;
    recency_score: number;
    coverage_score: number;
    completeness_score: number;
  };
  statistics: {
    total_records: number;
    year_range: number;
    latest_year: number;
    data_age_years: number;
    total_indicators: number;
    avg_indicators_per_year: number;
    missing_years: number;
    completeness_ratio: number;
  };
  recommendations: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Info tooltip component
const InfoTooltip = ({ content }: { content: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Information"
      >
        <Info className="h-4 w-4" />
      </button>
      {showTooltip && (
        <div className="absolute z-10 w-64 p-3 mt-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg -left-32">
          {content}
          <div className="absolute -top-1 left-32 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [countries, setCountries] = useState<string[]>([]);
  const [indicators, setIndicators] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('Spain');
  const [startYear, setStartYear] = useState<string>('2020');
  const [endYear, setEndYear] = useState<string>('2023');
  const [countryData, setCountryData] = useState<EducationRecord[]>([]);
  const [countrySummary, setCountrySummary] = useState<CountrySummary | null>(null);
  const [dataQuality, setDataQuality] = useState<DataQuality | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [countriesRes, indicatorsRes] = await Promise.all([
          fetch('/api/countries'),
          fetch('/api/indicators')
        ]);
        
        const countriesData = await countriesRes.json();
        const indicatorsData = await indicatorsRes.json();
        
        setCountries(countriesData);
        setIndicators(indicatorsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch country data when selection changes
  useEffect(() => {
    const fetchCountryData = async () => {
      if (!selectedCountry) return;
      
      setLoading(true);
      try {
        // Generate years array from start to end year
        const years: number[] = [];
        const start = parseInt(startYear);
        const end = parseInt(endYear);
        for (let year = start; year <= end; year++) {
          years.push(year);
        }
        const yearsParam = years.join(',');
        
        console.log(`Fetching data for ${selectedCountry} with years ${yearsParam}`);
        
        const [dataRes, summaryRes, qualityRes] = await Promise.all([
          fetch(`/api/data?country=${encodeURIComponent(selectedCountry)}&years=${yearsParam}`),
          fetch(`/api/data?country=${encodeURIComponent(selectedCountry)}&summary=true`),
          fetch(`/api/data-quality?country=${encodeURIComponent(selectedCountry)}`)
        ]);
        
        if (!dataRes.ok) {
          throw new Error(`Data API failed: ${dataRes.status}`);
        }
        if (!summaryRes.ok) {
          throw new Error(`Summary API failed: ${summaryRes.status}`);
        }
        if (!qualityRes.ok) {
          throw new Error(`Quality API failed: ${qualityRes.status}`);
        }
        
        const data = await dataRes.json();
        const summary = await summaryRes.json();
        const quality = await qualityRes.json();
        
        console.log(`Received ${data.length} data points for ${selectedCountry}`);
        console.log('First few data points:', data.slice(0, 3));
        
        setCountryData(data);
        setCountrySummary(summary);
        setDataQuality(quality);
      } catch (error) {
        console.error('Error fetching country data:', error);
        // Set empty data on error to prevent stale data
        setCountryData([]);
        setCountrySummary(null);
        setDataQuality(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }, [selectedCountry, startYear, endYear]);

  // Process data for charts - improved to show all indicators
  const processedData = countryData.reduce((acc, record) => {
    const year = record.year;
    const existing = acc.find(item => item.year === year);
    
    // More comprehensive indicator categorization
    const getIndicatorCategory = (name: string) => {
      const lowerName = name.toLowerCase();
      if (lowerName.includes('literacy')) return 'literacy';
      if (lowerName.includes('enrollment') || lowerName.includes('enrolment')) return 'enrollment';
      if (lowerName.includes('completion') || lowerName.includes('complete')) return 'completion';
      if (lowerName.includes('reading') || lowerName.includes('pisa')) return 'reading';
      if (lowerName.includes('math') || lowerName.includes('mathematics')) return 'math';
      if (lowerName.includes('science')) return 'science';
      if (lowerName.includes('unemployment') || lowerName.includes('employment')) return 'employment';
      if (lowerName.includes('attainment') || lowerName.includes('education')) return 'education_level';
      if (lowerName.includes('teacher') || lowerName.includes('trained')) return 'teaching_quality';
      if (lowerName.includes('out of school') || lowerName.includes('dropout')) return 'access';
      return 'other';
    };
    
    const indicatorKey = getIndicatorCategory(record.indicator_name);
    
    if (existing) {
      // Take the average if multiple indicators of the same type exist for the same year
      if (existing[indicatorKey]) {
        existing[indicatorKey] = (existing[indicatorKey] + record.estimate) / 2;
      } else {
        existing[indicatorKey] = record.estimate;
      }
    } else {
      const newEntry: Record<string, number> = { year };
      newEntry[indicatorKey] = record.estimate;
      acc.push(newEntry);
    }
    
    return acc;
  }, [] as Record<string, number>[]).sort((a, b) => a.year - b.year);

  // Improved indicator distribution for pie chart
  const indicatorCounts = countryData.reduce((acc, record) => {
    const lowerName = record.indicator_name.toLowerCase();
    const category = lowerName.includes('literacy') ? 'Literacy' :
                    lowerName.includes('enrollment') || lowerName.includes('enrolment') ? 'Enrollment' :
                    lowerName.includes('completion') || lowerName.includes('complete') ? 'Completion' :
                    lowerName.includes('reading') || lowerName.includes('pisa') ? 'Reading' :
                    lowerName.includes('math') || lowerName.includes('mathematics') ? 'Mathematics' :
                    lowerName.includes('science') ? 'Science' :
                    lowerName.includes('unemployment') || lowerName.includes('employment') ? 'Employment' :
                    lowerName.includes('attainment') || lowerName.includes('education') ? 'Education Level' :
                    lowerName.includes('teacher') || lowerName.includes('trained') ? 'Teaching Quality' :
                    lowerName.includes('out of school') || lowerName.includes('dropout') ? 'Access' :
                    'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(indicatorCounts).map(([name, value]) => ({ name, value }));

  // Add debug info to show when data changes
  console.log('Dashboard Data Update:', {
    selectedCountry,
    yearRange: `${startYear}-${endYear}`,
    dataPoints: countryData.length,
    chartData: processedData.length,
    indicators: Object.keys(indicatorCounts)
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">EduInsight</h1>
                <p className="text-gray-600">Global Education Analytics Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-500">Data Coverage</div>
                <div className="font-semibold text-gray-900">{countries.length} Countries • {indicators.length} Indicators</div>
              </div>
              <a
                href="/predictions"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>ML Predictions</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Usage Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use the Dashboard</h3>
              <div className="text-blue-800 space-y-2">
                <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-blue-600" />Select a country from the dropdown to view its education data</p>
                <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-blue-600" />Choose a start and end year to define your analysis period</p>
                <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-blue-600" />Charts update automatically when you change selections</p>
                <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-blue-600" />Hover over the &ldquo;i&rdquo; icons for detailed explanations of each element</p>
                <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-blue-600" />Use ML Predictions tab to forecast future education trends</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Dashboard Controls</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Country
                <InfoTooltip content="Choose a country to view its education indicators and trends. Data availability varies by country and time period." />
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 bg-white text-slate-900 font-medium rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Year
                <InfoTooltip content="Select the starting year for your analysis. Data availability varies by indicator and country." />
              </label>
              <select
                value={startYear}
                onChange={(e) => {
                  const newStartYear = e.target.value;
                  if (parseInt(newStartYear) > parseInt(endYear)) {
                    setEndYear(newStartYear);
                  }
                  setStartYear(newStartYear);
                }}
                className="w-full px-4 py-3 border-2 border-slate-300 bg-white text-slate-900 font-medium rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              >
                {Array.from({ length: 54 }, (_, i) => 2024 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Year
                <InfoTooltip content="Select the ending year for your analysis. Choose a range that provides meaningful trend analysis." />
              </label>
              <select
                value={endYear}
                onChange={(e) => {
                  const newEndYear = e.target.value;
                  if (parseInt(newEndYear) < parseInt(startYear)) {
                    setStartYear(newEndYear);
                  }
                  setEndYear(newEndYear);
                }}
                className="w-full px-4 py-3 border-2 border-slate-300 bg-white text-slate-900 font-medium rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              >
                {Array.from({ length: 54 }, (_, i) => 2024 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="font-semibold text-slate-900">Selected: </span>
                <span className="text-indigo-600">{selectedCountry}</span>
                <span className="text-slate-500 mx-2">•</span>
                <span className="text-indigo-600">{startYear}-{endYear}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="font-semibold text-slate-900">Data Points: </span>
                <span className="text-green-600">{countryData.length}</span>
              </div>
              {loading && (
                <div className="flex items-center space-x-2 text-amber-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent"></div>
                  <span className="text-sm font-medium">Loading...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Quality Assessment */}
        {dataQuality && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Data Quality Assessment</h3>
              <InfoTooltip content="This assessment evaluates the reliability of education data for the selected country based on recency, coverage, and completeness. Higher scores indicate more reliable data for analysis and predictions." />
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${dataQuality.data_quality.overall_score >= 0.7 ? 'text-green-600' : dataQuality.data_quality.overall_score >= 0.4 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {(dataQuality.data_quality.overall_score * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-500">Overall Quality</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${dataQuality.data_quality.recency_score >= 0.7 ? 'text-green-600' : dataQuality.data_quality.recency_score >= 0.4 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {(dataQuality.data_quality.recency_score * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-500">Data Recency</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${dataQuality.data_quality.coverage_score >= 0.7 ? 'text-green-600' : dataQuality.data_quality.coverage_score >= 0.4 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {(dataQuality.data_quality.coverage_score * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-500">Indicator Coverage</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${dataQuality.data_quality.completeness_score >= 0.7 ? 'text-green-600' : dataQuality.data_quality.completeness_score >= 0.4 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {(dataQuality.data_quality.completeness_score * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-500">Data Completeness</div>
              </div>
            </div>
            
            {dataQuality.recommendations && dataQuality.recommendations.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Data Quality Recommendations:</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  {dataQuality.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">⚠️</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Key Metrics */}
        {countrySummary && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 flex items-center">
                    Literacy Rate
                    <InfoTooltip content="Average literacy rates for this country, including adult and youth literacy percentages. This is a key indicator of basic education effectiveness." />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {countrySummary.reading_score?.toFixed(1) || 'N/A'}%
                  </div>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 flex items-center">
                    Enrollment Rate
                    <InfoTooltip content="Average enrollment rates across different education levels. This shows how well the country is providing access to education." />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {countrySummary.math_score?.toFixed(1) || 'N/A'}%
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 flex items-center">
                    Completion Rate
                    <InfoTooltip content="Average completion rates for primary and secondary education. This indicates how effectively students finish their education programs." />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {countrySummary.science_score?.toFixed(1) || 'N/A'}%
                  </div>
                </div>
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 flex items-center">
                    Total Records
                    <InfoTooltip content="Total number of education data points available for this country in our database. More records typically indicate better data coverage." />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {countrySummary.total_records.toLocaleString()}
                  </div>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Trend Line Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Education Trends Over Time</h3>
              <InfoTooltip content="This line chart shows how different education indicators change over your selected time period. Each line represents a different type of indicator (literacy, enrollment, completion, etc.). Trends help identify progress or areas needing attention." />
            </div>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="literacy" stroke="#3B82F6" strokeWidth={3} name="Literacy" />
                  <Line type="monotone" dataKey="enrollment" stroke="#10B981" strokeWidth={3} name="Enrollment" />
                  <Line type="monotone" dataKey="completion" stroke="#F59E0B" strokeWidth={3} name="Completion" />
                  <Line type="monotone" dataKey="education_level" stroke="#8B5CF6" strokeWidth={3} name="Education Level" />
                  <Line type="monotone" dataKey="employment" stroke="#EF4444" strokeWidth={3} name="Employment" />
                  <Line type="monotone" dataKey="access" stroke="#06B6D4" strokeWidth={3} name="Access" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Indicator Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Indicator Distribution</h3>
              <InfoTooltip content="This pie chart shows the distribution of different types of education indicators available for the selected country and time period. It helps you understand what types of data are most available for analysis." />
            </div>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Performance Comparison */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Performance Comparison</h3>
              <InfoTooltip content="This bar chart compares different education indicators across years. Each bar represents a year, with different colored segments showing various indicators. Use this to compare performance across different areas of education." />
            </div>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="literacy" fill="#3B82F6" name="Literacy" />
                  <Bar dataKey="enrollment" fill="#10B981" name="Enrollment" />
                  <Bar dataKey="completion" fill="#F59E0B" name="Completion" />
                  <Bar dataKey="education_level" fill="#8B5CF6" name="Education Level" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Data Summary Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Recent Data Summary</h3>
              <InfoTooltip content="This table shows the most recent 5 years of data for key education indicators. Use this for a quick numerical overview of the country's education performance. '-' indicates no data available for that indicator and year." />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Literacy</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Education Level</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedData.slice(-5).map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.literacy?.toFixed(1) || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.enrollment?.toFixed(1) || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.completion?.toFixed(1) || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.education_level?.toFixed(1) || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500">
          <p>EduInsight Dashboard • Powered by ML-driven Education Analytics</p>
          <p className="text-sm mt-1">Data from {countries.length} countries worldwide</p>
        </footer>
      </div>
    </div>
  );
}

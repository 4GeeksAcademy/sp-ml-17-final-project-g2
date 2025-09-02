'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Globe, TrendingUp, BookOpen, Users, Calendar, Filter } from 'lucide-react';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const [countries, setCountries] = useState<string[]>([]);
  const [indicators, setIndicators] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('Spain');
  const [selectedYears, setSelectedYears] = useState<string>('2020,2021,2022,2023');
  const [countryData, setCountryData] = useState<EducationRecord[]>([]);
  const [countrySummary, setCountrySummary] = useState<CountrySummary | null>(null);
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
        const [dataRes, summaryRes] = await Promise.all([
          fetch(`/api/data?country=${encodeURIComponent(selectedCountry)}&years=${selectedYears}`),
          fetch(`/api/data?country=${encodeURIComponent(selectedCountry)}&summary=true`)
        ]);
        
        const data = await dataRes.json();
        const summary = await summaryRes.json();
        
        setCountryData(data);
        setCountrySummary(summary);
      } catch (error) {
        console.error('Error fetching country data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }, [selectedCountry, selectedYears]);

  // Process data for charts
  const processedData = countryData.reduce((acc, record) => {
    const year = record.year;
    const existing = acc.find(item => item.year === year);
    
    if (existing) {
      if (record.indicator_name.toLowerCase().includes('reading')) {
        existing.reading = record.estimate;
      } else if (record.indicator_name.toLowerCase().includes('math')) {
        existing.math = record.estimate;
      } else if (record.indicator_name.toLowerCase().includes('science')) {
        existing.science = record.estimate;
      }
    } else {
      const newEntry: any = { year };
      if (record.indicator_name.toLowerCase().includes('reading')) {
        newEntry.reading = record.estimate;
      } else if (record.indicator_name.toLowerCase().includes('math')) {
        newEntry.math = record.estimate;
      } else if (record.indicator_name.toLowerCase().includes('science')) {
        newEntry.science = record.estimate;
      }
      acc.push(newEntry);
    }
    
    return acc;
  }, [] as any[]).sort((a, b) => a.year - b.year);

  // Indicator distribution for pie chart
  const indicatorCounts = countryData.reduce((acc, record) => {
    const category = record.indicator_name.toLowerCase().includes('reading') ? 'Reading' :
                    record.indicator_name.toLowerCase().includes('math') ? 'Mathematics' :
                    record.indicator_name.toLowerCase().includes('science') ? 'Science' : 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(indicatorCounts).map(([name, value]) => ({ name, value }));

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
            <div className="text-right">
              <div className="text-sm text-gray-500">Data Coverage</div>
              <div className="font-semibold text-gray-900">{countries.length} Countries • {indicators.length} Indicators</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Dashboard Controls</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Range (comma-separated)
              </label>
              <input
                type="text"
                value={selectedYears}
                onChange={(e) => setSelectedYears(e.target.value)}
                placeholder="2020,2021,2022,2023"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {countrySummary && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Reading Score</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {countrySummary.reading_score?.toFixed(1) || 'N/A'}
                  </div>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Math Score</div>
                  <div className="text-2xl font-bold text-green-600">
                    {countrySummary.math_score?.toFixed(1) || 'N/A'}
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Science Score</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {countrySummary.science_score?.toFixed(1) || 'N/A'}
                  </div>
                </div>
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Records</div>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Education Trends Over Time</h3>
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
                  <Line type="monotone" dataKey="reading" stroke="#3B82F6" strokeWidth={3} />
                  <Line type="monotone" dataKey="math" stroke="#10B981" strokeWidth={3} />
                  <Line type="monotone" dataKey="science" stroke="#8B5CF6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Indicator Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Indicator Distribution</h3>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Comparison</h3>
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
                  <Bar dataKey="reading" fill="#3B82F6" />
                  <Bar dataKey="math" fill="#10B981" />
                  <Bar dataKey="science" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Data Summary Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Data Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reading</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Math</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Science</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedData.slice(-5).map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.reading?.toFixed(1) || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.math?.toFixed(1) || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.science?.toFixed(1) || '-'}</td>
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

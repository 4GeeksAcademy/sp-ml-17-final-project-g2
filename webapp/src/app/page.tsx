export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            EduInsight
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Global Education Analytics Platform
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Transform complex global education data into actionable insights through 
            machine learning predictions and interactive visualizations.
          </p>
        </div>
        
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
            <p className="text-gray-600 mb-4">
              Interactive country performance comparisons and regional analysis
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              View Dashboard
            </button>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">ML Predictions</h3>
            <p className="text-gray-600 mb-4">
              Forecast education trends using our XGBoost model (94.75% accuracy)
            </p>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Make Predictions
            </button>
          </div>
        </div>
        
        <div className="mt-16 bg-gray-50 p-8 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">340K+</div>
              <div className="text-sm text-gray-600">Records</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">195</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">64</div>
              <div className="text-sm text-gray-600">Indicators</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">50+</div>
              <div className="text-sm text-gray-600">Years</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

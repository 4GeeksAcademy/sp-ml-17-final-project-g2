#!/bin/bash

# EduInsight ML Production Startup Script for Render
echo "🚀 Starting EduInsight ML Application..."

# Set Python path to include current directory and subdirectories
export PYTHONPATH="${PYTHONPATH}:.:./database:./models:./data"

# Verify Python dependencies are installed
echo "📦 Verifying Python dependencies..."
python3 -c "import pandas, numpy, xgboost, sqlite3, pickle" || {
    echo "❌ Python dependencies missing. Installing..."
    pip install -r requirements.txt
}

# Verify database file exists
if [ ! -f "./database/eduinsight.db" ]; then
    echo "❌ Database file not found!"
    exit 1
fi

# Verify model files exist
if [ ! -f "./models/eduinsight_xgboost_model.pkl" ]; then
    echo "❌ ML model file not found!"
    exit 1
fi

echo "✅ All dependencies verified"
echo "🌐 Starting Next.js production server..."

# Start the Next.js application
npm start

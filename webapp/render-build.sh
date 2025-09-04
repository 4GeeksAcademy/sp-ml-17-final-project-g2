#!/bin/bash
# Simplified Render Build Script

echo "🔧 Render Build Starting..."

# 1. Clean environment
rm -rf node_modules package-lock.json .next

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Install Node.js dependencies
npm install --production=false

# 4. Set environment variables
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# 5. Build the application
npm run build

echo "✅ Build completed!"

#!/bin/bash
# Render Build Script - Ensures exact environment matching

echo "🔧 Render Environment Setup"
echo "=========================="

# 1. Environment Information
echo "📊 Environment Info:"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Python: $(python3 --version)"
echo "Working Directory: $(pwd)"
echo "User: $(whoami)"
echo ""

# 2. Clean Start
echo "🧹 Clean Environment:"
rm -rf node_modules package-lock.json .next
echo "✅ Cleaned node_modules, package-lock.json, and .next"

# 3. Python Setup (must come first)
echo "🐍 Setting up Python environment:"
pip install -r requirements.txt
echo "✅ Python dependencies installed"

# 4. Node.js Dependencies - Use exact versions
echo "📦 Installing Node.js dependencies with exact versions:"
npm install --production=false
echo "✅ Node.js dependencies installed"

# 5. Environment Variables
echo "🌍 Setting production environment:"
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
echo "✅ Environment variables set"

# 6. TypeScript Pre-compilation Check
echo "🔍 TypeScript verification:"
npx tsc --noEmit --skipLibCheck
if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation verified"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# 7. Build with verbose output
echo "🏗️ Building Next.js application:"
npm run build
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed with exit code $BUILD_EXIT_CODE"
    exit 1
fi

echo "🎉 Render build completed successfully!"

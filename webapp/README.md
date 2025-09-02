# EduInsight Web Application

## Framework Choice: React + Next.js

### Why Next.js?
- **Performance**: Server-side rendering for faster load times with 340K+ education records
- **Data Visualization**: Excellent React ecosystem for interactive charts and dashboards
- **Professional UI**: Perfect for policymakers and researchers who need responsive interfaces
- **API Integration**: Built-in API routes to connect with Python ML models and SQLite database
- **Production Ready**: Optimized deployment on platforms like Vercel or Heroku

## Project Structure (Current - Simple Start)

```
webapp/
├── src/
│   └── app/                   # Next.js App Router
│       ├── layout.tsx        # Main layout
│       ├── page.tsx          # Homepage
│       ├── globals.css       # Global styles
│       └── favicon.ico       # App icon
├── public/                   # Static assets
├── package.json             # Dependencies
└── README.md               # This file
```

## Next Steps (Future Development)
- Add `/components` folder for reusable UI components  
- Add `/lib` folder for API utilities and database connections
- Add `/types` folder for TypeScript definitions
- Add API routes in `/app/api` for backend integration
- Add dashboard and prediction pages

## Architecture Overview

### Frontend (Next.js/React)
- Interactive dashboards and charts
- Country comparison tools
- ML prediction interface
- Responsive design for all devices

### Backend (Next.js API Routes)
- `/api/countries` - Country data endpoints
- `/api/predictions` - ML model integration
- `/api/dashboard` - Dashboard data
- Connection to existing Python ML pipeline

### Integration Points
- **Database**: Connects to `../database/eduinsight.db`
- **ML Model**: Uses `../models/eduinsight_xgboost_model.pkl`
- **Data Processing**: Leverages existing data pipeline

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js, Recharts
- **Icons**: Lucide React
- **Database**: SQLite (via API routes)
- **ML Integration**: Python XGBoost model

## Target Users
- Educational policymakers
- Government officials
- International development organizations
- Education researchers and analysts

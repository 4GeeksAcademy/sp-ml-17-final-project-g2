# Machine Learning Final Project

This is the final project of our Machine Learning bootcamp, where we demonstrate the skills and knowledge acquired throughout our studies. Throughout this bootcamp, we have studied different models based on projects of different areas and types. Now it's time to create our own project using the algorithm that we think is best suited to our problem.

We will have to find a suitable dataset to work with, process it, train a model and finally make it available for consumption.

> *"Hard work always beats talent when talent doesn't work hard"* - Tim Notke

## 👥  Credits

**Team Members:**
> - [Iddaly Castro](https://github.com/iddalycastro)
> - [Théo Gédin](https://github.com/Tgedin)
> - [Alia Yuste](https://github.com/aliasys)

**Academy:** 
> - [4Geeks Academy](https://4geeksacademy.com/us/index) 
> - **Bootcamp:** Spain-DS-17 
> - **Mentor:** [Ing. Héctor Chocobar Torrejón](https://github.com/hchocobar/)
> - **Teacher Assitant:** [Beatriz Solana Ros](https://github.com/mezcolantriz)

## 🎯 Project Goal

The goal of this project is to develop a complete end-to-end Machine Learning solution that includes:
- Data acquisition and processing
- Exploratory Data Analysis (EDA)
- Model development and optimization
- Web application deployment
- Real-world problem-solving through ML techniques

## 🚀 Project Overview

**EduInsight: Global Education Analytics Platform**

### Problem Statement
Educational policymakers and researchers struggle to make data-driven decisions due to fragmented and complex global education data. With over 195 countries tracking 64+ education indicators across decades, stakeholders need an intuitive tool to identify patterns, predict trends, and benchmark performance to drive meaningful educational improvements.

### Web Application Proposition

**EduInsight** is an intelligent web application that transforms complex global education data into actionable insights through machine learning predictions and interactive visualizations.

#### User Story
*"As an educational policymaker, I want to quickly assess my country's education performance compared to similar nations and predict future trends, so that I can make informed decisions about resource allocation and policy interventions to improve educational outcomes."*

#### What We're Solving
- **Data Complexity**: Convert 340K+ education records into understandable insights
- **Benchmarking Challenge**: Enable instant country-to-country performance comparisons
- **Trend Prediction**: Forecast future education indicators using ML algorithms
- **Decision Support**: Provide evidence-based recommendations for policy makers

#### Key Features
- **Country Performance Dashboard**: Visual comparison of education metrics
- **Predictive Analytics**: ML-powered forecasting of education trends
- **Regional Benchmarking**: Compare performance against regional averages
- **Historical Analysis**: Track progress over 50+ years of education data
- **Policy Impact Simulation**: Model potential outcomes of educational interventions

### Dataset
**Global Education Indicators (1970-2023)**
- **340,145 instances** across 195 countries/territories
- **20+ variables** including categorical (regions, income levels) and numerical indicators
- **64 education metrics** covering enrollment, completion rates, and quality measures
- **50+ year timespan** enabling comprehensive trend analysis

### Methodology
Machine learning models trained on temporal data to predict education outcomes and identify key performance drivers, deployed through an interactive web interface for real-time insights.

### Target Users
- Educational policymakers and government officials
- International development organizations (UNESCO, World Bank, UNICEF)
- Education researchers and analysts
- NGOs working in education development

## 📝 Project Phases

### Step 1: Problem Definition
Start by defining a problem and turn it into a Machine Learning problem. This is the first step, since the data must meet a certain need and the Machine Learning process must aim at satisfying that need.

The choice of the data set must satisfy minimum requirements in terms of number of rows and predictor variables. At a minimum, it must contain:
- 60,000 instances (rows)
- 20 predictor variables, of which there must be at least 1 categorical variable

**NOTE:** Depending on the dataset and the case study to be explored, datasets that do not reach the established minimum may be evaluated and accepted.

### Step 2: Acquiring and Loading the Data Set
Since in the real world data does not usually arrive in a flat csv file, this data must be acquired by one of the following ways:
- Extracting data from some web page or portal using web scraping techniques
- Exploitation of a public database using SQL language (the database must support this language)
- Exploitation of a public API to obtain data

Once you have the data, you must store it in a CSV document and load it into Python using Pandas.

**NOTE:** Depending on the dataset and the case study to be explored, datasets downloaded by other means could be evaluated and accepted.

### Step 3: Store the Information
A widely used practice is to store the data, especially if they are massive, in a database for quick access to them. From all the databases we have studied, choose the one most compatible with your data and store it there. Then, perform queries using Python (with pure SQL code or using the wrappers we have studied in the course) to use the different statements: SELECT, JOIN, INSERT.... These queries must provide a value to start the analysis on the data prior to the statistics and EDA.

It is important to understand that in the real world we do not only have CSV as an ally to store data, since it is easier to lose a flat file like CSV than a database with its connections and data models inside. Security is also a critical and important factor for storing your data there, since a CSV does not provide any protection mechanism that other technologies do.

### Step 4: Perform a Descriptive Analysis
The raw data stored in a database can be a great and very valuable source of information. Before we begin to simplify and exploit them with EDA, we must know their fundamental statistical measures: means, modes, distributions, deviations, etcetera. Analyze the descriptive statistical variables of each of the predictors of the data set and theorize about the distribution that each of them follows.

Use hypothesis tests if you consider it necessary.

### Step 5: Perform a Full EDA
This step is vital to ensure that we keep the variables that are strictly necessary and eliminate those that are not relevant or do not provide information. Use the example Notebook we worked on and adapt it to this use case.

Make sure to conveniently divide the data set into train and test as we have seen in previous lessons.

### Step 6: Build the Model and Optimize It
Once you have your data ready, decide which model fits best and train it. If in doubt, try using several of the ones you have already studied. Select the one that best fits the data.

Remember that the hyperparameter optimization step is very important to explore and achieve the best version of the model.

### Step 7: Deploy the Model
Create a Machine Learning web application using your saved model. We built a modern **Next.js React application** with TypeScript and Tailwind CSS that integrates our XGBoost model through API routes. The application features interactive dashboards, ML prediction interfaces, and comprehensive data visualizations. The deployment is ready for cloud platforms like Vercel, Netlify, or any hosting service that supports Next.js applications.

## 📁 Project Structure

```
eduinsight-ml-project/
├── 📁 data/                    # Dataset storage and processing
│    ├── 📁 processed/          # ML-ready datasets and preprocessing objects
│    │    ├── ml_ready_data.csv # Preprocessed dataset for ML training
│    │    ├── scaler.pkl        # Feature scaling object
│    │    └── label_encoders.pkl # Categorical encoding objects
│    ├── 📁 raw/                # Original raw dataset
│    │    └── data.csv          # Raw education indicators dataset
│    └── README.md              # Data documentation
├── 📁 database/                # Database implementation and SQL queries
│    ├── create_schema.sql      # SQLite database schema definition
│    ├── database_setup.ipynb  # Database creation and data loading
│    ├── db_utils.py           # Database utility functions for web app
│    ├── eduinsight.db         # Production SQLite database
│    └── README.md             # Database documentation
├── 📁 docs/                   # Documentation and presentation materials
│    ├── metadata.pdf          # Dataset metadata and documentation
│    └── README.md             # Documentation index
├── 📁 models/                 # Trained ML model artifacts
│    ├── eduinsight_xgboost_model.pkl # Production XGBoost model
│    ├── model_metadata.pkl    # Model performance and configuration
│    └── README.md             # Model documentation
├── 📁 notebooks/              # Jupyter notebooks for EDA and ML
│    ├── 01_eda_data_cleaning.ipynb    # Data exploration and preprocessing
│    ├── 02_model_training_xgboost.ipynb # ML model development
│    └── README.md             # Notebooks documentation
├── 📁 webapp/                 # Next.js React Web Application
│    ├── 📁 src/               # Application source code
│    │    ├── 📁 app/          # Next.js 13+ app directory
│    │    │    ├── 📁 api/     # API routes for ML predictions
│    │    │    │    ├── 📁 predict/     # ML prediction endpoint
│    │    │    │    ├── 📁 countries/   # Countries data endpoint
│    │    │    │    ├── 📁 indicators/  # Indicators data endpoint
│    │    │    │    └── 📁 data/        # Dashboard data endpoint
│    │    │    ├── 📁 predictions/      # Prediction page
│    │    │    ├── dashboard.tsx        # Main dashboard component
│    │    │    ├── page.tsx            # Home page
│    │    │    ├── layout.tsx          # App layout
│    │    │    └── globals.css         # Global styles
│    │    ├── 📁 lib/          # Utility libraries
│    │    │    ├── api-client.ts       # API client functions
│    │    │    └── database.ts         # Database connection utilities
│    │    └── 📁 types/        # TypeScript type definitions
│    │         └── education.ts        # Education data types
│    ├── 📁 tests/             # Comprehensive test suite
│    │    ├── 📁 api/          # API endpoint tests
│    │    ├── 📁 database/     # Database functionality tests
│    │    ├── 📁 ml/           # ML prediction tests
│    │    ├── run_tests.sh     # Main test runner
│    │    ├── test_prediction_api_comprehensive.py # Full API test suite
│    │    ├── troubleshoot_data_quality.py         # Data quality diagnostics
│    │    ├── TEST_RESULTS.md  # Latest test results and status
│    │    └── README.md        # Testing documentation
│    ├── 📁 public/            # Static assets
│    ├── package.json          # Node.js dependencies
│    ├── tsconfig.json         # TypeScript configuration
│    ├── tailwind.config.js    # Tailwind CSS configuration
│    ├── next.config.ts        # Next.js configuration
│    └── README.md             # Web application documentation
├── requirements.txt           # Python dependencies
└── README.md                  # Main project documentation
```

## � Database Module (Step 3)

The `database/` folder implements persistent data storage for the EduInsight platform:

### Purpose
- **Data Persistence**: Store 340K+ education records efficiently
- **Fast Queries**: Enable rapid country comparisons and trend analysis
- **Web App Integration**: Provide database access for the web application
- **Academic Requirement**: Demonstrate SQL skills as required by the project

### Database Workflow

1. **Schema Creation**: `create_schema.sql` defines the education data structure
2. **Data Loading**: `database_setup.ipynb` creates database and loads processed data
3. **Web Integration**: `db_utils.py` provides database functions for the web application

### Key Features
- **SQLite Database**: Simple, portable, and efficient for our use case
- **Indexed Queries**: Fast access by country, year, indicator, and region
- **SQL Demonstrations**: Country performance, regional analysis, temporal trends
- **Production Ready**: Database utilities ready for web deployment

### Usage Example
```python
from database.db_utils import EduInsightDB

# Initialize database connection
db = EduInsightDB()

# Get all countries
countries = db.get_countries()

# Analyze country performance
spain_data = db.get_country_performance('Spain', years=[2020, 2021, 2022])

# Regional comparisons
regional_data = db.get_regional_comparison('enrollment')
```

## 🧪 Testing & Quality Assurance

The project includes a comprehensive testing suite ensuring reliability and data quality:

### Test Suite Overview
- **85.7% Pass Rate** across 28 automated tests
- **Data Quality Validation** - Detects duplicate years, extreme value jumps
- **API Functionality Testing** - Validates all prediction endpoints
- **ML Model Validation** - Ensures realistic prediction bounds
- **Database Integration** - Tests data retrieval and processing

### Test Categories
1. **Quick Troubleshooter** (`troubleshoot_data_quality.py`)
   - Rapid data quality diagnostics
   - Duplicate year detection
   - Extreme value analysis

2. **Comprehensive API Suite** (`test_prediction_api_comprehensive.py`)
   - Full endpoint validation
   - Progressive prediction testing
   - Error handling verification

3. **Component Tests** (organized by folder)
   - `/api/` - API endpoint functionality
   - `/database/` - Database queries and connections
   - `/ml/` - Machine learning model predictions

4. **Full Validation** - Complete project verification

### Running Tests
```bash
cd webapp/tests
./run_tests.sh  # Interactive menu with 4 options
```

### Test Results
Latest results show the system successfully handles:
- ✅ Country data retrieval and validation
- ✅ Progressive year-by-year predictions  
- ✅ Data quality and duplicate elimination
- ✅ API endpoint functionality
- ✅ ML model integration and bounds checking

## � Quick Start

### Prerequisites
- **Python 3.8+** with pandas, scikit-learn, and xgboost
- **Node.js 18+** and npm/yarn
- **Git** for version control

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/eduinsight-ml-project.git
   cd eduinsight-ml-project
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up the webapp**
   ```bash
   cd webapp
   npm install
   ```

4. **Initialize the database** (optional - already included)
   ```bash
   # Run the database setup notebook if you want to recreate the database
   jupyter notebook database/database_setup.ipynb
   ```

5. **Start the development server**
   ```bash
   cd webapp
   npm run dev
   ```

6. **Open the application**
   - Navigate to `http://localhost:3000`
   - Explore the dashboard and predictions interface

### Running Tests
```bash
cd webapp/tests
./run_tests.sh
```

Choose from:
1. Quick troubleshooter (data quality checks)
2. Comprehensive test suite (full API validation)
3. Component-specific tests
4. Complete project validation

## �🛠️ Technology Stack

### **Frontend & Web Application**
- **React 18** - Modern UI component library
- **Next.js 15** - Full-stack React framework with API routes
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful SVG icons

### **Backend & API**
- **Next.js API Routes** - Serverless functions for ML predictions
- **Python Integration** - ML model inference through Python scripts
- **SQLite Database** - Efficient data storage and queries

### **Data Processing & Analysis**
- **Python 3.x** - Core data processing language
- **Pandas & NumPy** - Data manipulation and numerical computing
- **Scikit-learn** - Machine learning preprocessing
- **XGBoost** - Gradient boosting ML algorithm

### **Machine Learning**
- **XGBoost Regressor** - Production ML model (94.75% R² accuracy)
- **Feature Engineering** - 15 engineered features
- **Hyperparameter Optimization** - Tuned for optimal performance
- **Model Persistence** - Pickle serialization for deployment

### **Data Visualization**
- **Custom SVG Charts** - Interactive line charts with hover tooltips
- **Responsive Design** - Mobile-friendly visualization
- **Real-time Updates** - Dynamic chart rendering

### **Database & Storage**
- **SQLite** - Lightweight, portable database
- **SQL Queries** - Complex data retrieval and analysis
- **Database Utilities** - Python wrappers for web integration

### **Development & Testing**
- **Jupyter Notebooks** - Interactive data analysis
- **Git Version Control** - Collaborative development
- **Python Test Suite** - Comprehensive API and data quality testing
- **Development Server** - Hot-reload development environment

### **Deployment & Production**
- **Next.js Production Build** - Optimized for deployment
- **Static Site Generation** - Fast page loads
- **API Routes** - Scalable backend architecture
- **Environmental Configuration** - Secure deployment settings

## 📊 Results

### Model Performance
- **Algorithm**: XGBoost Regressor with hyperparameter optimization
- **R² Score**: 94.75% - Excellent prediction accuracy
- **Features**: 15 engineered features from education indicators
- **Training Data**: 340K+ instances across 195 countries (1970-2023)
- **Validation**: Progressive year-by-year predictions with realistic bounds

### Key Features Delivered
✅ **Interactive Dashboard**: Real-time education data visualization
✅ **ML Predictions**: Future education indicator forecasting  
✅ **Country Comparisons**: Regional benchmarking and analysis
✅ **Data Quality**: Fixed "teeth curve" issues with median aggregation
✅ **Progressive Predictions**: Realistic year-by-year trend forecasting
✅ **Comprehensive Testing**: 85.7% test pass rate (28 automated tests)
✅ **Production Ready**: Clean code architecture with TypeScript

### Technical Achievements
- **Scalable Architecture**: Next.js API routes with Python ML integration
- **Data Processing**: Efficient SQLite database with 340K+ records
- **User Experience**: Responsive design with interactive charts and hover tooltips
- **Quality Assurance**: Comprehensive test suite with troubleshooting tools
- **Documentation**: Complete tech stack documentation and setup guides

## 🌐 Live Demo

*[Application ready for deployment - contact team for live demo link]*

## 🎓 Project Status

**Status**: ✅ **COMPLETED** - Production Ready

This project successfully demonstrates all required ML bootcamp competencies:
- ✅ **Problem Definition**: Global education analytics solution
- ✅ **Data Acquisition**: 340K+ education records across 195 countries  
- ✅ **Database Implementation**: SQLite with comprehensive queries
- ✅ **Statistical Analysis**: Complete EDA with hypothesis testing
- ✅ **Machine Learning**: XGBoost model with 94.75% accuracy
- ✅ **Web Deployment**: Modern React/Next.js application
- ✅ **Testing & QA**: 85.7% test pass rate with comprehensive validation

## 🙏 Acknowledgments

Special thanks to our mentors and instructors at **4Geeks Academy** for their guidance throughout this ML bootcamp journey. This project represents the culmination of our studies in data science, machine learning, and web development.

---

### 📧 Contact

For questions about this project, please reach out to any team member through their GitHub profiles listed in the credits section.

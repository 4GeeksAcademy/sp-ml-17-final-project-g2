-- EduInsight Database Schema
-- Education indicators database for ML model deployment

CREATE TABLE IF NOT EXISTS education_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting TEXT NOT NULL,
    indicator_name TEXT NOT NULL,
    indicator_abbr TEXT,
    year INTEGER NOT NULL,
    estimate REAL NOT NULL,
    whoreg6 TEXT,
    wbincome2024 TEXT,
    iso3 TEXT,
    dimension TEXT,
    subgroup TEXT,
    flag TEXT,
    setting_average REAL,
    favourable_indicator INTEGER,
    is_gender_analysis INTEGER,
    is_wealth_analysis INTEGER,
    is_residence_analysis INTEGER
);

CREATE INDEX IF NOT EXISTS idx_setting ON education_data(setting);
CREATE INDEX IF NOT EXISTS idx_year ON education_data(year);
CREATE INDEX IF NOT EXISTS idx_indicator ON education_data(indicator_name);
CREATE INDEX IF NOT EXISTS idx_region ON education_data(whoreg6);

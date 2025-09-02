// Education data types for EduInsight platform

export interface EducationRecord {
  year: number;
  indicator_name: string;
  estimate: number;
}

export interface CountrySummary {
  reading_score: number | null;
  math_score: number | null;
  science_score: number | null;
  total_records: number;
}

export interface CountryMetrics {
  country: string;
  latestYear: number;
  keyIndicators: {
    name: string;
    value: number;
    unit: string;
  }[];
}

export interface TrendData {
  country: string;
  indicator: string;
  data: Array<{
    year: number;
    value: number;
  }>;
}

"""
Database utility functions for EduInsight web application
"""

import sqlite3
import pandas as pd
from typing import Optional, List

class EduInsightDB:
    def __init__(self, db_path: str = 'database/eduinsight.db'):
        self.db_path = db_path
    
    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)
    
    def get_countries(self) -> List[str]:
        """Get list of all countries"""
        with self.get_connection() as conn:
            query = "SELECT DISTINCT setting FROM education_data ORDER BY setting"
            return [row[0] for row in conn.execute(query).fetchall()]
    
    def get_indicators(self) -> List[str]:
        """Get list of all indicators"""
        with self.get_connection() as conn:
            query = "SELECT DISTINCT indicator_name FROM education_data ORDER BY indicator_name"
            return [row[0] for row in conn.execute(query).fetchall()]
    
    def get_country_performance(self, country: str, years: Optional[List[int]] = None) -> pd.DataFrame:
        """Get performance data for a specific country"""
        with self.get_connection() as conn:
            params = [country]
            if years:
                placeholders = ','.join(['?'] * len(years))
                year_filter = f"AND year IN ({placeholders})"
                params.extend(years)
            else:
                year_filter = ""
            
            query = f"""
                SELECT year, indicator_name, estimate 
                FROM education_data 
                WHERE setting = ? {year_filter}
                ORDER BY year, indicator_name
            """
            df = pd.read_sql_query(query, conn, params=params)
            return df
    
    def get_country_summary(self, country: str) -> dict:
        """Get aggregated performance summary for a country"""
        with self.get_connection() as conn:
            query = """
                SELECT 
                    AVG(CASE WHEN indicator_name LIKE '%Reading%' OR indicator_name LIKE '%reading%' THEN estimate END) as reading_score,
                    AVG(CASE WHEN indicator_name LIKE '%Math%' OR indicator_name LIKE '%math%' THEN estimate END) as math_score,
                    AVG(CASE WHEN indicator_name LIKE '%Science%' OR indicator_name LIKE '%science%' THEN estimate END) as science_score,
                    COUNT(*) as total_records
                FROM education_data 
                WHERE setting = ?
            """
            result = conn.execute(query, [country]).fetchone()
            if result and result[3] > 0:
                return {
                    'reading_score': result[0] or 0,
                    'math_score': result[1] or 0,
                    'science_score': result[2] or 0,
                    'total_records': result[3]
                }
            return None
    
    def get_regional_comparison(self, indicator: str) -> pd.DataFrame:
        """Compare regions for a specific indicator"""
        with self.get_connection() as conn:
            query = """
            SELECT whoreg6, AVG(estimate) as avg_value, COUNT(*) as records
            FROM education_data 
            WHERE indicator_name LIKE ? AND whoreg6 IS NOT NULL
            GROUP BY whoreg6 
            ORDER BY avg_value DESC
            """
            # Optionally, validate indicator against known indicators
            # indicators = self.get_indicators()
            # if indicator not in indicators:
            #     raise ValueError("Invalid indicator name")
            escaped_indicator = self._escape_like(indicator)
            query = """
            SELECT whoreg6, AVG(estimate) as avg_value, COUNT(*) as records
            FROM education_data 
            WHERE indicator_name LIKE ? ESCAPE '\\' AND whoreg6 IS NOT NULL
            GROUP BY whoreg6 
            ORDER BY avg_value DESC
            """
            return pd.read_sql_query(query, conn, params=[f"%{escaped_indicator}%"])
    
    def get_data_for_prediction(self, country: str, year: int) -> pd.DataFrame:
        """Get features for ML prediction"""
        with self.get_connection() as conn:
            query = """
            SELECT * FROM education_data 
            WHERE setting = ? AND year = ?
            """
            return pd.read_sql_query(query, conn, params=[country, year])
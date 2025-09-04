// Database connection utility for the webapp
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

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

/**
 * Execute Python script to query the database
 * This bridges the Node.js API with the existing Python database utilities
 */
export async function executePythonScript(scriptCode: string): Promise<unknown> {
  try {
    // Try multiple potential database paths
    const possiblePaths = [
      path.join(process.cwd(), 'database'),
      path.join(process.cwd(), 'webapp', 'database'),
      path.join(process.cwd(), '..', 'database'),
    ];
    
    let databasePath = possiblePaths[0];
    
    // Check which path exists
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        databasePath = testPath;
        break;
      }
    }
    
    const { stdout, stderr } = await execAsync(`python3 -c "${scriptCode.replace(/"/g, '\\"')}"`, {
      cwd: databasePath,
      timeout: 30000,
    });

    if (stderr && stderr.trim() !== '') {
      console.error('Python stderr:', stderr);
    }

    const result = JSON.parse(stdout.trim());
    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Python execution error:', error);
    throw new Error(`Database query failed: ${errorMessage}`);
  }
}

/**
 * Get all available countries from the database
 */
export async function getCountries(): Promise<string[]> {
  const scriptCode = `
import sys
import os
sys.path.append('.')
from db_utils import EduInsightDB
import json

db = EduInsightDB()
countries = db.get_countries()
print(json.dumps(countries))
`;
  
  return await executePythonScript(scriptCode) as string[];
}

/**
 * Get all available indicators from the database
 */
export async function getIndicators(): Promise<string[]> {
  const scriptCode = `
import sys
import os
sys.path.append('.')
from db_utils import EduInsightDB
import json

db = EduInsightDB()
indicators = db.get_indicators()
print(json.dumps(indicators))
`;
  
  return await executePythonScript(scriptCode) as string[];
}

/**
 * Get education data for a specific country
 */
export async function getCountryPerformance(country: string, years?: number[]): Promise<EducationRecord[]> {
  const yearsFilter = years && years.length > 0 ? `[${years.join(', ')}]` : 'None';
  
  const scriptCode = `
import sys
import os
sys.path.append('.')
from db_utils import EduInsightDB
import json

db = EduInsightDB()
years_list = ${yearsFilter}
df = db.get_country_performance('${country}', years_list)
if df is not None and not df.empty:
    result = []
    for _, row in df.iterrows():
        result.append({
            'year': int(row['year']),
            'indicator_name': row['indicator_name'], 
            'estimate': float(row['estimate'])
        })
    print(json.dumps(result))
else:
    print(json.dumps([]))
`;
  
  return await executePythonScript(scriptCode) as EducationRecord[];
}

/**
 * Get summary statistics for a country
 */
export async function getCountrySummary(country: string): Promise<CountrySummary> {
  const scriptCode = `
import sys
import os
sys.path.append('.')
from db_utils import EduInsightDB
import json

db = EduInsightDB()
summary = db.get_country_summary('${country}')
if summary is not None:
    print(json.dumps(summary))
else:
    print(json.dumps({'reading_score': None, 'math_score': None, 'science_score': None, 'total_records': 0}))
`;
  
  return await executePythonScript(scriptCode) as CountrySummary;
}

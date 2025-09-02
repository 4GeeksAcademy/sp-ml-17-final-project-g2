import { NextRequest, NextResponse } from 'next/server';
import { getCountryPerformance, getCountrySummary } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');
    const yearsParam = searchParams.get('years');
    const summary = searchParams.get('summary') === 'true';

    if (!country) {
      return NextResponse.json(
        { error: 'Country parameter is required' },
        { status: 400 }
      );
    }

    // If summary is requested, return country summary
    if (summary) {
      const summaryData = await getCountrySummary(country);
      return NextResponse.json(summaryData);
    }

    // Parse years if provided
    let years: number[] | undefined;
    if (yearsParam) {
      try {
        years = yearsParam.split(',').map(year => parseInt(year.trim()));
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid years format. Use comma-separated numbers.' },
          { status: 400 }
        );
      }
    }

    const data = await getCountryPerformance(country, years);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching country data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch country data' },
      { status: 500 }
    );
  }
}

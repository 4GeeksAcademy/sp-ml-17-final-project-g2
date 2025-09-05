import { NextResponse } from 'next/server';
import { getCountries } from '../../../lib/index';

export async function GET() {
  try {
    // Add cache headers for better performance
    const countries = await getCountries();
    
    return NextResponse.json(countries, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: `Failed to fetch countries: ${errorMessage}` },
      { status: 500 }
    );
  }
}

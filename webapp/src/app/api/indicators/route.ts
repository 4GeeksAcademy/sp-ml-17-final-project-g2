import { NextResponse } from 'next/server';
import { getIndicators } from '../../../lib/index';

export async function GET() {
  try {
    const indicators = await getIndicators();
    
    return NextResponse.json(indicators, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching indicators:', error);
    return NextResponse.json(
      { error: `Failed to fetch indicators: ${errorMessage}` },
      { status: 500 }
    );
  }
}

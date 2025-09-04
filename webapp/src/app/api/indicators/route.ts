import { NextResponse } from 'next/server';
import { getIndicators } from '../../../lib';

export async function GET() {
  try {
    const indicators = await getIndicators();
    return NextResponse.json(indicators);
  } catch (error) {
    console.error('Error fetching indicators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch indicators' },
      { status: 500 }
    );
  }
}

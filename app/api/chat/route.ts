import { analyticsClient } from '@/lib/analytics-client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Check if analytics server is healthy
    const isHealthy = await analyticsClient.checkHealth();
    if (!isHealthy) {
      return NextResponse.json(
        { error: 'Analytics server is not available' },
        { status: 503 }
      );
    }

    // Process the question using the analytics client
    const response = await analyticsClient.processQuery(question);

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics chat error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to process analytics query',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { technicalAnalysisService } from '@/services/TechnicalAnalysisService';
import { enhancedRateLimiter } from '@/lib/api/enhanced-rate-limiter';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Check rate limiting
    const rateLimitStatus = enhancedRateLimiter.checkLimit('coinmarketcap');
    if (!rateLimitStatus.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitStatus.retryAfter 
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const symbols = searchParams.get('symbols')?.split(',');

    if (!symbol && !symbols) {
      return NextResponse.json(
        { success: false, error: 'Symbol or symbols parameter required' },
        { status: 400 }
      );
    }

    let analysis;

    if (symbol) {
      // Single symbol analysis
      logger.info(`Getting technical analysis for ${symbol}`);
      analysis = await technicalAnalysisService.getAnalysis(symbol.toUpperCase());
    } else if (symbols) {
      // Multiple symbols analysis
      logger.info(`Getting technical analysis for ${symbols.length} symbols`);
      const upperSymbols = symbols.map(s => s.toUpperCase());
      analysis = await technicalAnalysisService.getMultipleAnalysis(upperSymbols);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: analysis,
      source: 'technical-analysis-service'
    });

  } catch (error) {
    logger.error('Technical analysis API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate technical analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, symbol } = body;

    switch (action) {
      case 'clear-history':
        technicalAnalysisService.clearHistory(symbol);
        logger.info(`Cleared technical analysis history for ${symbol || 'all symbols'}`);
        
        return NextResponse.json({
          success: true,
          message: `History cleared for ${symbol || 'all symbols'}`
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Technical analysis POST API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
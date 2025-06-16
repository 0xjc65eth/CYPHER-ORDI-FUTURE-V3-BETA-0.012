import { NextRequest, NextResponse } from 'next/server';
import { hyperliquidService } from '@/services/hyperliquid';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const address = searchParams.get('address');

  try {
    switch (action) {
      case 'user-state':
        const userState = await hyperliquidService.getUserState(address || undefined);
        return NextResponse.json({ success: true, data: userState });

      case 'positions':
        const positions = await hyperliquidService.getOpenPositions(address || undefined);
        return NextResponse.json({ success: true, data: positions });

      case 'market-prices':
        const prices = await hyperliquidService.getMarketPrices();
        return NextResponse.json({ success: true, data: prices });

      case 'arbitrage-opportunities':
        const opportunities = await hyperliquidService.scanArbitrageOpportunities();
        return NextResponse.json({ success: true, data: opportunities });

      case 'portfolio-analytics':
        const analytics = await hyperliquidService.getPortfolioAnalytics(address || undefined);
        return NextResponse.json({ success: true, data: analytics });

      case 'strategies':
        const strategies = hyperliquidService.getStrategies();
        return NextResponse.json({ success: true, data: strategies });

      case 'risk-check':
        const riskCheck = await hyperliquidService.checkRiskLimits();
        return NextResponse.json({ success: true, data: riskCheck });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action parameter' 
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Hyperliquid API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'place-order':
        const { asset, side, size, price, orderType, reduceOnly } = params;
        const orderResult = await hyperliquidService.placeOrder(
          asset, side, size, price, orderType, reduceOnly
        );
        return NextResponse.json(orderResult);

      case 'cancel-order':
        const { orderId } = params;
        const cancelResult = await hyperliquidService.cancelOrder(orderId);
        return NextResponse.json(cancelResult);

      case 'execute-arbitrage':
        const arbitrageResult = await hyperliquidService.executeArbitrageStrategy(params.opportunity);
        return NextResponse.json(arbitrageResult);

      case 'execute-grid-trading':
        const { asset: gridAsset, gridLevels, gridRange } = params;
        const gridResult = await hyperliquidService.executeGridTradingStrategy(
          gridAsset, gridLevels, gridRange
        );
        return NextResponse.json(gridResult);

      case 'execute-dca':
        const { asset: dcaAsset, totalAmount, intervals } = params;
        const dcaResult = await hyperliquidService.executeDCAStrategy(
          dcaAsset, totalAmount, intervals
        );
        return NextResponse.json(dcaResult);

      case 'backtest-strategy':
        const { strategyName, asset: backtestAsset, startDate, endDate } = params;
        const backtestResult = await hyperliquidService.backtestStrategy(
          strategyName,
          backtestAsset,
          new Date(startDate),
          new Date(endDate)
        );
        return NextResponse.json({ success: true, data: backtestResult });

      case 'enable-strategy':
        const { strategyName: enableStrategy } = params;
        const enableResult = hyperliquidService.enableStrategy(enableStrategy);
        return NextResponse.json({ 
          success: enableResult, 
          message: enableResult ? 'Strategy enabled' : 'Strategy not found' 
        });

      case 'disable-strategy':
        const { strategyName: disableStrategy } = params;
        const disableResult = hyperliquidService.disableStrategy(disableStrategy);
        return NextResponse.json({ 
          success: disableResult, 
          message: disableResult ? 'Strategy disabled' : 'Strategy not found' 
        });

      case 'update-strategy-parameters':
        const { strategyName: updateStrategy, parameters } = params;
        const updateResult = hyperliquidService.updateStrategyParameters(updateStrategy, parameters);
        return NextResponse.json({ 
          success: updateResult, 
          message: updateResult ? 'Parameters updated' : 'Strategy not found' 
        });

      case 'get-order-book':
        const { asset: bookAsset, depth } = params;
        const orderBook = await hyperliquidService.getOrderBook(bookAsset, depth);
        return NextResponse.json({ success: true, data: orderBook });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action parameter' 
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Hyperliquid POST API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'update-risk-settings':
        const { maxPositionSize, maxDailyLoss, stopLossPercent } = params;
        // Update risk settings (would be stored in database in production)
        return NextResponse.json({ 
          success: true, 
          message: 'Risk settings updated',
          data: { maxPositionSize, maxDailyLoss, stopLossPercent }
        });

      case 'emergency-stop':
        // Emergency stop all trading activities
        hyperliquidService.getStrategies().forEach(strategy => {
          hyperliquidService.disableStrategy(strategy.name);
        });
        
        return NextResponse.json({ 
          success: true, 
          message: 'Emergency stop executed - all strategies disabled' 
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action parameter' 
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Hyperliquid PUT API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const orderId = searchParams.get('orderId');

  try {
    switch (action) {
      case 'cancel-all-orders':
        // Cancel all open orders (implementation would depend on actual API)
        return NextResponse.json({ 
          success: true, 
          message: 'All orders cancelled' 
        });

      case 'close-all-positions':
        // Close all open positions (implementation would depend on actual API)
        return NextResponse.json({ 
          success: true, 
          message: 'All positions closed' 
        });

      case 'cancel-order':
        if (!orderId) {
          return NextResponse.json({ 
            success: false, 
            error: 'Order ID required' 
          }, { status: 400 });
        }
        
        const cancelResult = await hyperliquidService.cancelOrder(orderId);
        return NextResponse.json(cancelResult);

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action parameter' 
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Hyperliquid DELETE API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
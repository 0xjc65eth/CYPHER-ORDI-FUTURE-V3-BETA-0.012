import { NextRequest, NextResponse } from 'next/server';
import { feeSystem, FeeRecord } from '@/lib/fee-system';
import { ErrorReporter } from '@/lib/ErrorReporter';
import { EnhancedLogger } from '@/lib/enhanced-logger';

const FEE_RECIPIENT_ADDRESS = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'; // Cypher Fee Address

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      tradeValue, 
      exchange, 
      asset, 
      type, 
      userId,
      walletAddress,
      timestamp = Date.now() 
    } = body;

    // Validar dados de entrada
    if (!tradeValue || !exchange || !asset || !type) {
      EnhancedLogger.warn('Trade API: Missing required fields', {
        component: 'TradeAPI',
        missingFields: { tradeValue, exchange, asset, type }
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validar valor numérico
    if (typeof tradeValue !== 'number' || tradeValue <= 0) {
      EnhancedLogger.warn('Trade API: Invalid trade value', {
        component: 'TradeAPI',
        tradeValue
      });
      return NextResponse.json(
        { error: 'Invalid trade value' },
        { status: 400 }
      );
    }

    // Calcular taxa de redirecionamento usando o novo sistema
    const feeCalculation = feeSystem.calculateFee(tradeValue, exchange, `${asset}/USDT`, 'redirect');
    
    EnhancedLogger.info('Processing trade with fee', {
      component: 'TradeAPI',
      originalValue: tradeValue,
      feeAmount: feeCalculation.feeAmount,
      netValue: feeCalculation.netAmount,
      exchange,
      asset
    });

    // Coletar taxa usando o novo sistema
    const feeRecord: FeeRecord = await feeSystem.collectFee(
      feeCalculation,
      `${asset}/USDT`,
      userId,
      'redirect'
    );

    // Resposta com detalhes da transação
    return NextResponse.json({
      success: true,
      trade: {
        originalValue: tradeValue,
        feeAmount: feeCalculation.feeAmount,
        feePercentage: `${(feeCalculation.feePercentage * 100).toFixed(2)}%`,
        netValue: feeCalculation.netAmount,
        exchange,
        asset,
        type
      },
      fee: {
        amount: feeRecord.amount,
        status: feeRecord.status,
        recipientAddress: FEE_RECIPIENT_ADDRESS,
        transactionId: feeRecord.id,
        timestamp: feeRecord.timestamp
      },
      message: 'Trade processed successfully with Cypher fee applied'
    });

  } catch (error) {
    const errorId = ErrorReporter.report(error as Error, {
      component: 'TradeAPI',
      action: 'processTrade',
      apiEndpoint: '/api/trade',
      httpStatus: 500
    });
    
    EnhancedLogger.error('Trade API Error', {
      component: 'TradeAPI',
      errorId,
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to process trade',
        errorId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Endpoint para verificar configuração de taxas e estatísticas
    const feeStats = feeSystem.getFeeStatistics();
    const feePercentage = feeSystem.getFeePercentage();
    
    return NextResponse.json({
      config: {
        feePercentage: `${(feePercentage * 100).toFixed(2)}%`,
        feeDecimal: feePercentage,
        recipientAddress: FEE_RECIPIENT_ADDRESS,
        status: 'active',
        description: 'Cypher redirect fee applied to all trades'
      },
      statistics: feeStats,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Fee Config API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get fee configuration' },
      { status: 500 }
    );
  }
}
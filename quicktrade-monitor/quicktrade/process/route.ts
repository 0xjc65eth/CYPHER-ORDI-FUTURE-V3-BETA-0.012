import { NextRequest, NextResponse } from 'next/server';

interface ProcessTradeRequest {
  analysisId: string;
  userAddress: string;
  selectedExchange: string;
  network: 'ethereum' | 'solana';
  fromToken: string;
  toToken: string;
  amount: number;
  acceptedFee: number;
}

interface FeeRecord {
  id: string;
  timestamp: number;
  userAddress: string;
  network: 'ethereum' | 'solana';
  originalAmount: number;
  serviceFee: number;
  exchange: string;
  fromToken: string;
  toToken: string;
  status: 'pending_redirect' | 'redirected' | 'pending_collection' | 'collected' | 'failed';
  destinationWallet: string;
  transactionHash?: string;
  redirectUrl: string;
  createdAt: string;
  updatedAt: string;
}

// Carteiras de destino para coleta de taxas (SUAS CARTEIRAS!)
const DESTINATION_WALLETS = {
  ethereum: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  arbitrum: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  optimism: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  polygon: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  base: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  avalanche: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  bsc: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  solana: 'EPbE1ZmLXkEJDitNb9KNu9Hq8mThS3P7LpBxdF3EkUwT'
};

// URLs base das exchanges
const EXCHANGE_URLS = {
  'UNISWAP': 'https://app.uniswap.org/#/swap',
  'SUSHISWAP': 'https://app.sushi.com/swap',
  'JUPITER': 'https://jup.ag/swap',
  'ORCA': 'https://www.orca.so/',
  'RAYDIUM': 'https://raydium.io/swap/'
};

function generateUniqueId(): string {
  return 'qt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

function buildExchangeUrl(
  baseUrl: string, 
  fromToken: string, 
  toToken: string, 
  amount: number,
  network: 'ethereum' | 'solana'
): string {
  const params = new URLSearchParams();
  
  // Parâmetros específicos por exchange
  switch (baseUrl) {
    case EXCHANGE_URLS.UNISWAP:
      params.set('inputCurrency', fromToken);
      params.set('outputCurrency', toToken);
      params.set('exactAmount', amount.toString());
      params.set('exactField', 'input');
      break;
      
    case EXCHANGE_URLS.JUPITER:
      params.set('inputMint', fromToken);
      params.set('outputMint', toToken);
      params.set('amount', amount.toString());
      break;
      
    case EXCHANGE_URLS.ORCA:
      params.set('from', fromToken);
      params.set('to', toToken);
      params.set('amount', amount.toString());
      break;
      
    case EXCHANGE_URLS.RAYDIUM:
      params.set('inputMint', fromToken);
      params.set('outputMint', toToken);
      params.set('amount', amount.toString());
      break;
      
    case EXCHANGE_URLS.SUSHISWAP:
      params.set('inputCurrency', fromToken);
      params.set('outputCurrency', toToken);
      params.set('exactAmount', amount.toString());
      break;
  }
  
  // Adicionar parâmetros de tracking
  params.set('utm_source', 'cypher_quicktrade');
  params.set('utm_medium', 'referral');
  params.set('utm_campaign', 'qt_redirect');
  
  return `${baseUrl}?${params.toString()}`;
}

async function saveFeeRecord(feeRecord: FeeRecord): Promise<void> {
  // Em produção, salvar no banco de dados
  // Por enquanto, apenas log
  console.log('Fee Record Saved:', feeRecord);
  
  // Simular salvamento no banco
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function notifyUser(userAddress: string, feeRecord: FeeRecord): Promise<void> {
  // Em produção, enviar notificação real (email, push, etc.)
  console.log(`Notificação enviada para ${userAddress}:`, {
    message: `Taxa de serviço de $${feeRecord.serviceFee.toFixed(4)} será coletada após a transação`,
    feeId: feeRecord.id,
    amount: feeRecord.serviceFee
  });
}

function validateTradeRequest(request: ProcessTradeRequest): { valid: boolean; error?: string } {
  // Validar exchange suportada
  if (!Object.keys(EXCHANGE_URLS).includes(request.selectedExchange.toUpperCase())) {
    return { valid: false, error: 'Exchange não suportada' };
  }
  
  // Validar rede
  if (!['ethereum', 'solana'].includes(request.network)) {
    return { valid: false, error: 'Rede não suportada' };
  }
  
  // Validar endereço da carteira
  if (!request.userAddress || request.userAddress.length < 32) {
    return { valid: false, error: 'Endereço de carteira inválido' };
  }
  
  // Validar valor mínimo
  if (request.amount < 10) {
    return { valid: false, error: 'Valor mínimo de $10 requerido' };
  }
  
  // Validar taxa máxima ($100)
  if (request.acceptedFee > 100) {
    return { valid: false, error: 'Taxa máxima de $100 excedida' };
  }
  
  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessTradeRequest = await request.json();
    
    // Validar requisição
    const validation = validateTradeRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    const {
      analysisId,
      userAddress,
      selectedExchange,
      network,
      fromToken,
      toToken,
      amount,
      acceptedFee
    } = body;
    
    // Gerar URL de redirecionamento
    const baseUrl = EXCHANGE_URLS[selectedExchange.toUpperCase() as keyof typeof EXCHANGE_URLS];
    const redirectUrl = buildExchangeUrl(baseUrl, fromToken, toToken, amount, network);
    
    // Criar registro de taxa
    const feeRecord: FeeRecord = {
      id: generateUniqueId(),
      timestamp: Date.now(),
      userAddress,
      network,
      originalAmount: amount,
      serviceFee: acceptedFee,
      exchange: selectedExchange,
      fromToken,
      toToken,
      status: 'pending_redirect',
      destinationWallet: DESTINATION_WALLETS[network],
      redirectUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Salvar registro
    await saveFeeRecord(feeRecord);
    
    // Notificar usuário
    await notifyUser(userAddress, feeRecord);
    
    // Log de auditoria
    const auditLog = {
      timestamp: Date.now(),
      userIP: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      action: 'trade_processed',
      analysisId,
      userAddress,
      transactionValue: amount,
      calculatedFee: acceptedFee,
      exchange: selectedExchange,
      network,
      feeRecordId: feeRecord.id,
      success: true
    };
    
    console.log('Trade Processing Audit:', auditLog);
    
    // Atualizar status para redirected
    feeRecord.status = 'redirected';
    feeRecord.updatedAt = new Date().toISOString();
    await saveFeeRecord(feeRecord);
    
    return NextResponse.json({
      success: true,
      data: {
        feeRecordId: feeRecord.id,
        redirectUrl,
        exchange: selectedExchange,
        serviceFee: acceptedFee,
        destinationWallet: DESTINATION_WALLETS[network],
        estimatedProcessingTime: network === 'ethereum' ? '2-5 minutes' : '30 seconds',
        instructions: {
          step1: 'Você será redirecionado para a exchange selecionada',
          step2: 'Complete sua transação normalmente na exchange',
          step3: 'Nossa taxa de serviço será coletada automaticamente',
          step4: 'Você receberá confirmação por email quando concluído'
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro no processamento do trade:', error);
    
    // Log de erro para auditoria
    const errorLog = {
      timestamp: Date.now(),
      userIP: request.headers.get('x-forwarded-for') || 'unknown',
      action: 'trade_process_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
    
    console.log('Trade Processing Error:', errorLog);
    
    return NextResponse.json(
      { 
        error: 'Erro no processamento do trade',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
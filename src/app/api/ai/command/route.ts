import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();
    
    // Por enquanto, retorna sucesso simulado
    // Em produção, isso se comunicaria com o ai-service.js
    const response = {
      status: 'success',
      command,
      timestamp: new Date().toISOString(),
      message: `AI command ${command} received`
    };
    
    console.log(`[AI API] Command received: ${command}`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('[AI API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process command' },
      { status: 500 }
    );
  }
}
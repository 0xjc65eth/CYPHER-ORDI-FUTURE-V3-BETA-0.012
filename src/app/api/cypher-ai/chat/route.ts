import { NextRequest, NextResponse } from 'next/server';

// Simplified chat API route without OpenAI dependency for build
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    // Simple mock response for now
    const response = {
      text: `Olá! Sou a Cypher AI. Você disse: "${message}". Esta é uma resposta de demonstração - o sistema completo está sendo finalizado!`,
      mood: 'friendly',
      emojis: ['🤖', '💰', '🚀'],
      action: 'chat',
      confidence: 0.8,
      audioUrl: null
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Cypher AI Chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Cypher AI Chat API is running',
    version: '3.0.0'
  });
}
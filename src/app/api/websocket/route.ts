import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'WebSocket endpoint - use external WebSocket server',
    status: 'available'
  });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    message: 'WebSocket endpoint - use external WebSocket server',
    status: 'available'
  });
}
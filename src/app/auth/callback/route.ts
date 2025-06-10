import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  console.log('OAuth callback (stub):', { code: !!code, error, error_description });

  if (error) {
    console.error('OAuth error:', error, error_description);
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/signin?error=${encodeURIComponent(error_description || error)}`
    );
  }

  // Mock successful auth for development
  if (code) {
    console.log('OAuth success (stub mode)');
    return NextResponse.redirect(`${requestUrl.origin}/dashboard?auth=success`);
  }

  // No code or error, redirect to sign in
  return NextResponse.redirect(`${requestUrl.origin}/auth/signin`);
}
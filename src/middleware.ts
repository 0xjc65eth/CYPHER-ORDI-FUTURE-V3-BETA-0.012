import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Redirecionar rotas antigas
  const pathname = request.nextUrl.pathname
  
  // Mapa de redirects
  const redirects: Record<string, string> = {
    '/home': '/',
    '/dashboard': '/',
    '/portfolio': '/wallet',
    '/quick-trade': '/quicktrade',
  }
  
  if (redirects[pathname]) {
    return NextResponse.redirect(new URL(redirects[pathname], request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

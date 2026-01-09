import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Privy handles authentication client-side
  // We'll check authentication in the layout/components instead
  // This middleware just ensures proper routing

  // Protect dashboard routes (excluding auth pages)
  const isDashboardRoute = 
    request.nextUrl.pathname !== '/' &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.startsWith('/api')

  // For dashboard routes, we'll let the client-side handle redirects
  // Privy will handle the authentication check in the components
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

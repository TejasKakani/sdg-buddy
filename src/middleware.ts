import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import getTokenPayload from '@/utils/getTokenPayload';
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {

    const tokenData: any = getTokenPayload(request);

    const path = request.nextUrl.pathname;

    if(path.startsWith('/_next/static/') || path.startsWith('/favicon.ico')) {
        const response = NextResponse.next();
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        return response;
    }

    const isPublicPath = path ==='/sign-in' || path === '/sign-up' || path === '/verify-email';

    const token = request.cookies.get('token')?.value || '';

    if((isPublicPath && token)) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if(!isPublicPath && !token) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/profile',
    '/sign-in',
    '/sign-up',
    '/verify-email',
    '/action'
  ]
}
import { NextResponse } from 'next/server';

export async function middleware(request) {
    const { pathname, searchParams } = request.nextUrl;

    // Handle admin override cookie
    if (searchParams.get('no_track') === 'true') {
        const newUrl = request.nextUrl.clone();
        newUrl.searchParams.delete('no_track');
        const response = NextResponse.redirect(newUrl);
        response.cookies.set('disable_analytics', 'true', {
            maxAge: 60 * 60 * 24 * 365, // 1 year
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        return response;
    }

    // 1. Skip assets, api routes, etc.
    const isAsset = pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2)$/);
    const isApi = pathname.startsWith('/api');
    const isNext = pathname.startsWith('/_next');

    if (isAsset || isApi || isNext) {
        return NextResponse.next();
    }

    const res = NextResponse.next();
    // Add security headers
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return res;
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
};

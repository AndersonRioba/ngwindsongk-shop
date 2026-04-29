import { NextResponse } from 'next/server';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // 1. Skip assets, api routes, etc.
    const isAsset = pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2)$/);
    const isApi = pathname.startsWith('/api');
    const isNext = pathname.startsWith('/_next');

    if (isAsset || isApi || isNext) {
        return NextResponse.next();
    }

    // 2. Prepare tracking data
    // Note: We can't use document.referrer or sessionStorage here as it's server-side.
    // We use headers.
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';
    const ip = request.headers.get('x-forwarded-for') || request.ip || '';
    
    // Attempt to get session ID from cookie if it exists
    let sessionId = request.cookies.get('analytics_session_id')?.value;
    
    // We can fire a background request to the API
    // Fire and forget
    try {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.ngwindsongk.com'}/api/pageviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': userAgent,
                'X-Forwarded-For': ip,
            },
            body: JSON.stringify({
                path: pathname,
                referrer: referrer,
                session_id: sessionId || 'server-session-' + Math.random().toString(36).substring(7),
                is_server_side: true,
            }),
        }).catch(() => {}); // Silent fail
    } catch (e) {
        // Silent fail
    }

    return NextResponse.next();
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

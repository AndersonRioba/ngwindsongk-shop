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

    // 2. Prepare tracking data
    // Note: We can't use document.referrer or sessionStorage here as it's server-side.
    // We use headers.
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';
    const ip = request.headers.get('x-forwarded-for') || request.ip || '';
    
    // Attempt to get session ID from cookie if it exists
    let sessionId = request.cookies.get('analytics_session_id')?.value;
    
    // Check for admin override cookie
    const disableAnalytics = request.cookies.get('disable_analytics')?.value === 'true';

    // We can fire a background request to the API
    // Fire and forget
    if (!disableAnalytics) {
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

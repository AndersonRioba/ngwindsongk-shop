'use client'

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function usePageTracking() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Ensure this only runs on the client
        if (typeof window === 'undefined') return;

        // Check for admin override cookie
        const disableAnalytics = document.cookie.includes('disable_analytics=true');
        if (disableAnalytics) return;

        // 1. Session ID management (persists for the browser session)
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('analytics_session_id', sessionId);
        }

        // 2. Prepare the tracking data
        const trackPage = async () => {
            const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
            
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ngwindsongk.com';
                const endpoint = apiBaseUrl.endsWith('/api') ? `${apiBaseUrl}/pageviews` : `${apiBaseUrl}/api/pageviews`;

                fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        path: url,
                        referrer: document.referrer,
                        session_id: sessionId,
                    }),
                    keepalive: true,
                }).catch(err => console.error('Analytics error:', err));
            } catch (error) {
                // Silent fail
            }
        };

        trackPage();

    }, [pathname, searchParams]);
}

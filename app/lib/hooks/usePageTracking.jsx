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
            // Strip marketing / ad tracking parameters to prevent fragmentation in analytics and DB truncation
            const cleanParams = new URLSearchParams();
            const trackingKeys = new Set([
                'fbclid', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'twclid', 'ttclid',
                '_ga', '_gl', 'ref_src', 'igshid', 'mc_cid', 'mc_eid'
            ]);

            searchParams.forEach((value, key) => {
                const lower = key.toLowerCase();
                if (!trackingKeys.has(lower) && !lower.startsWith('utm_')) {
                    cleanParams.append(key, value);
                }
            });

            const queryString = cleanParams.toString();
            const cleanPath = (queryString ? `${pathname}?${queryString}` : (pathname || '/')).slice(0, 255);
            
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
                        path: cleanPath,
                        referrer: document.referrer ? document.referrer.slice(0, 1000) : null,
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

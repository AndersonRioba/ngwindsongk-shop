'use client'

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function GoogleTag({ disableAnalytics }) {
    const pathname = usePathname();

    useEffect(() => {
        if (disableAnalytics) return;
        if (pathname && pathname.startsWith('/admin')) return;

        const fetchTrackingSettings = async () => {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.ngwindsongk.com/api';
                const endpoint = apiBase.endsWith('/api') ? `${apiBase}/settings?group=tracking` : `${apiBase}/api/settings?group=tracking`;
                const response = await fetch(endpoint);
                const data = await response.json();
                if (data.success && data.data) {
                    if (typeof window !== 'undefined' && window.gtag) {
                        if (data.data.google_tag_id) {
                            window.gtag('config', data.data.google_tag_id);
                        }
                        if (data.data.google_ads_id) {
                            window.gtag('config', data.data.google_ads_id);
                        } else if (data.data.purchase_event_snippet) {
                            const match = data.data.purchase_event_snippet.match(/AW-\d+/);
                            if (match) {
                                window.gtag('config', match[0]);
                            }
                        }
                    }
                }
            } catch (error) {
                // Keep default tag if API fetch fails
            }
        };

        fetchTrackingSettings();
    }, [disableAnalytics, pathname]);

    return null;
}

'use client'

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const DEFAULT_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || 'GT-P84567X7';

export default function GoogleTag({ disableAnalytics }) {
    const pathname = usePathname();
    const [tagId, setTagId] = useState(DEFAULT_TAG_ID);

    useEffect(() => {
        if (disableAnalytics) return;

        const fetchTrackingSettings = async () => {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const endpoint = apiBase.endsWith('/api') ? `${apiBase}/settings?group=tracking` : `${apiBase}/api/settings?group=tracking`;
                const response = await fetch(endpoint);
                const data = await response.json();
                if (data.success && data.data?.google_tag_id) {
                    setTagId(data.data.google_tag_id);
                }
            } catch (error) {
                // Keep default tag if API fetch fails
            }
        };

        fetchTrackingSettings();
    }, [disableAnalytics]);

    // Safeguards: Never track if disabled or if on any admin route
    if (disableAnalytics) return null;
    if (pathname && pathname.startsWith('/admin')) return null;
    if (!tagId) return null;

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`}
            />
            <Script
                id="google-analytics-dynamic"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${tagId}');
                    `,
                }}
            />
        </>
    );
}

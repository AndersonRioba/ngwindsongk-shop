'use client'

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function GoogleTag({ disableAnalytics }) {
    const [tagId, setTagId] = useState(null);

    useEffect(() => {
        if (disableAnalytics) return;

        const fetchTrackingSettings = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings?group=tracking`);
                const data = await response.json();
                if (data.success && data.data.google_tag_id) {
                    setTagId(data.data.google_tag_id);
                }
            } catch (error) {
                console.error("Failed to fetch tracking settings:", error);
            }
        };

        fetchTrackingSettings();
    }, [disableAnalytics]);

    if (disableAnalytics || !tagId) return null;

    return (
        <>
            <Script
                strategy="lazyOnload"
                src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`}
            />
            <Script
                id="google-analytics-dynamic"
                strategy="lazyOnload"
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

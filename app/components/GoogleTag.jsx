'use client'

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const DEFAULT_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || 'GT-P84567X7';
const DEFAULT_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-18053515081';

export default function GoogleTag({ disableAnalytics }) {
    const pathname = usePathname();
    const [tagId, setTagId] = useState(DEFAULT_TAG_ID);
    const [adsId, setAdsId] = useState(DEFAULT_ADS_ID);

    useEffect(() => {
        if (disableAnalytics) return;

        const fetchTrackingSettings = async () => {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.ngwindsongk.com/api';
                const endpoint = apiBase.endsWith('/api') ? `${apiBase}/settings?group=tracking` : `${apiBase}/api/settings?group=tracking`;
                const response = await fetch(endpoint);
                const data = await response.json();
                if (data.success && data.data) {
                    let activeTagId = tagId;
                    let activeAdsId = adsId;

                    if (data.data.google_tag_id) {
                        activeTagId = data.data.google_tag_id;
                        setTagId(activeTagId);
                    }
                    if (data.data.google_ads_id) {
                        activeAdsId = data.data.google_ads_id;
                        setAdsId(activeAdsId);
                    } else if (data.data.purchase_event_snippet) {
                        const match = data.data.purchase_event_snippet.match(/AW-\d+/);
                        if (match) {
                            activeAdsId = match[0];
                            setAdsId(activeAdsId);
                        }
                    }

                    // Dynamically push config to dataLayer if gtag is initialized
                    if (typeof window !== 'undefined' && window.gtag) {
                        if (activeTagId) window.gtag('config', activeTagId);
                        if (activeAdsId && activeAdsId !== activeTagId) window.gtag('config', activeAdsId);
                    }
                }
            } catch (error) {
                // Keep default tag if API fetch fails
            }
        };

        fetchTrackingSettings();
    }, [disableAnalytics, tagId, adsId]);

    // Safeguards: Never track if disabled or if on any admin route
    if (disableAnalytics) return null;
    if (pathname && pathname.startsWith('/admin')) return null;
    if (!tagId && !adsId) return null;

    const primaryScriptId = tagId || adsId;

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${primaryScriptId}`}
            />
            <Script
                id="google-analytics-dynamic"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        ${tagId ? `gtag('config', '${tagId}');` : ''}
                        ${adsId && adsId !== tagId ? `gtag('config', '${adsId}');` : ''}
                    `,
                }}
            />
        </>
    );
}

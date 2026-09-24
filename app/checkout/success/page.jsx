'use client'

import { useEffect, useContext } from "react";
import { CheckoutContext } from "@/app/lib/providers/CheckoutProvider";
import useCart from "@/app/lib/hooks/useCart";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { gsap } from "gsap";

export default function CheckoutSuccessPage(){
    const { 
        products, setProducts, setOrderDetails, setContact 
    } = useContext(CheckoutContext);

    const { clearCart } = useCart();
    const searchParams = useSearchParams();
    const paymentType = searchParams.get('type');

    useEffect(() => {
        // Animate success checkmark
        gsap.fromTo('.success-check', 
            { scale: 0, opacity: 0, rotate: -180 }, 
            { scale: 1, opacity: 1, rotate: 0, duration: 0.8, ease: "back.out(1.7)", delay: 0.2 }
        );

        // Track Conversions
        const executeSnippet = (snippetCode) => {
            if (!snippetCode) return;
            const trimmed = snippetCode.trim();
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function() { window.dataLayer.push(arguments); };

            if (trimmed.startsWith('<script') || trimmed.includes('</script>')) {
                try {
                    const fragment = document.createRange().createContextualFragment(trimmed);
                    document.head.appendChild(fragment);
                } catch (err) {
                    console.error("Failed to append script snippet:", err);
                }
            } else {
                try {
                    const runner = new Function('gtag', 'window', 'dataLayer', trimmed);
                    runner(window.gtag, window, window.dataLayer);
                } catch (err) {
                    console.error("Failed to execute snippet:", err);
                }
            }
        };

        const trackConversions = async () => {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.ngwindsongk.com/api';
                const trackingEndpoint = apiBase.endsWith('/api') 
                    ? `${apiBase}/settings?group=tracking` 
                    : `${apiBase}/api/settings?group=tracking`;

                // 1. Global Tracking
                const settingsRes = await fetch(trackingEndpoint);
                const settingsData = await settingsRes.json();
                if (settingsData.success && settingsData.data?.purchase_event_snippet) {
                    executeSnippet(settingsData.data.purchase_event_snippet);
                }

                // 2. Brand-Specific Tracking
                if (products && products.length > 0) {
                    const brandIds = [...new Set(products.map(p => p.brand?.id).filter(id => !!id))];
                    
                    for (const brandId of brandIds) {
                        const brandEndpoint = apiBase.endsWith('/api') 
                            ? `${apiBase}/brands/${brandId}` 
                            : `${apiBase}/api/brands/${brandId}`;
                        const brandRes = await fetch(brandEndpoint);
                        const brandData = await brandRes.json();
                        
                        if (brandData && brandData.purchase_snippet) {
                            executeSnippet(brandData.purchase_snippet);
                        }
                    }

                }
            } catch (error) {
                console.error("Conversion tracking failed:", error);
            }
        };
        trackConversions();

        // Clear cart and checkout context on success
        clearCart();
        setProducts([]);
        setOrderDetails({ full_name: '', phone: '', address: '', notes: '' });
        setContact('');
    }, [clearCart, products, setProducts, setOrderDetails, setContact]);



    return(
        <main className="md:max-w-[80vw] mx-auto md:my-20 p-2 flex justify-center items-center min-h-[50vh]">
            <div className="text-center md:w-1/2 lg:w-1/3 space-y-6 bg-white p-8 rounded-2xl shadow-xl border-[1px] border-gray-100">
                <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center success-check">
                    <span className="icon-[mdi--check-bold] w-12 h-12 text-green-500" />
                </div>
                
                <h1 className="text-4xl font-bold text-gray-800">
                    {paymentType === 'manual' ? 'Receipt Submitted!' : 'Order Placed!'}
                </h1>
                
                <p className="text-gray-600 text-lg">
                    {paymentType === 'manual' ? (
                        <>
                            Your M-Pesa receipt number has been successfully received. 
                            <br/><br/>
                            You will receive a confirmation notification of your order once it has been approved by the shop administrator.
                        </>
                    ) : (
                        <>
                            Your payment was successful and your order has been confirmed.
                            <br/><br/>
                            We have sent a receipt to your phone and email.
                        </>
                    )}
                </p>

                <div className="pt-6">
                    <button onClick={() => window.location.href = '/'} className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:bg-opacity-90 transition-all">
                        Continue Shopping
                    </button>
                </div>
            </div>
        </main>
    )
}

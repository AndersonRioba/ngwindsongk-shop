'use client'

import useSWR from "swr"
import { fetcher } from "@/app/lib/data"
import ProductListing, { ProductListingSkeleton } from "@/app/UI/ProductListing"

export default function OffersPage() {
    let { data: products, error, isLoading } = useSWR(['/products', { offers: true }], fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: true,
        errorRetryInterval: 300000
    });

    const productsList = Array.isArray(products) ? products : (products?.data || []);

    if (error) return (
        <div className="flex flex-col items-center justify-center py-20">
            <p className="text-red-500 font-semibold text-lg">Failed to load offers. Please try again later.</p>
        </div>
    );

    return (
        <div className="w-full">
            {/* Page Header */}
            <section className="relative overflow-hidden pt-12 pb-8 px-4 md:px-12">
                <div className="absolute inset-x-0 top-0 -z-10 h-full luxe-glow bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.08),_transparent_40%),linear-gradient(to_bottom,_rgba(255,255,255,0.9),_rgba(252,252,251,1))]" />
                
                <div className="mx-auto max-w-7xl">
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary mb-3 luxe-reveal">Exclusive Deals</p>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 uppercase italic tracking-tighter luxe-reveal luxe-delay-1">
                        Our Best Offers
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 luxe-reveal luxe-delay-2">
                        Discover top-quality products at special prices. From hearty pantry staples to gentle baby care, find the best value for your home.
                    </p>
                </div>
            </section>

            {/* Products Grid */}
            <section className="px-4 md:px-12 pb-24 mx-auto max-w-7xl">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-4">
                    {
                        isLoading ?
                        [...new Array(8)].map((_, i) => (
                            <div key={i} className="luxe-reveal" style={{ animationDelay: `${i * 100}ms` }}>
                                <ProductListingSkeleton />
                            </div>
                        ))
                        :
                        productsList.map((product, i) => (
                            <div key={product.id || i} className="luxe-reveal" style={{ animationDelay: `${i * 50}ms` }}>
                                <ProductListing data={product} />
                            </div>
                        ))
                    }
                </div>

                {/* Empty State */}
                {!isLoading && productsList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 px-4 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm mt-8">
                        <div className="w-24 h-24 mb-6 text-orange-200">
                            <span className="icon-[solar--fire-bold-duotone] w-full h-full" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Active Offers</h2>
                        <p className="text-gray-500 text-center max-w-md">
                            Check back soon for new special offers and new arrivals on your favorite products.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}

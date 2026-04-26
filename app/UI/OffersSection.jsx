'use client'

import Link from "next/link"
import ProductListing from "./ProductListing"

export default function OffersSection({ products }) {
    // Filter products that actually have discounts
    const offerProducts = products.filter(product => {
        const hasDirectDiscount = Number(product.discount) > 0;
        const hasVariationDiscount = product.product_variations?.some(v => Number(v.discount) > 0);
        return hasDirectDiscount || hasVariationDiscount;
    });

    if (!offerProducts || offerProducts.length === 0) {
        return null; // Return nothing if no offers
    }

    return (
        <section className="pt-16 pb-12 w-full mx-auto md:max-w-7xl overflow-hidden px-4 md:px-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
                <h2 className="text-xl md:text-3xl font-semibold text-black uppercase tracking-wide">
                    Our Offers
                </h2>
                <Link href="/offers" className="hidden md:flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    More Offers
                    <span className="icon-[heroicons--arrow-right-circle-solid] w-5 h-5 text-primary"/>
                </Link>
            </div>

            <div className="relative w-full">
                {/* Horizontal scroller matching layout in mockup */}
                <div 
                    className="flex flex-row overflow-x-auto gap-6 sm:gap-8 pb-8 pt-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x object-left"
                    style={{ WebkitOverflowScrolling: "touch" }}
                >
                    {offerProducts.map((product) => (
                        <div key={product.id} className="w-[85vw] sm:w-[20rem] flex-none snap-start">
                            <ProductListing data={product} />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="mt-4 flex justify-center md:hidden">
                <Link href="/offers" className="text-sm font-semibold text-primary hover:text-primary/80 underline underline-offset-4 pointer-events-auto">
                    View More Offers
                </Link>
            </div>
        </section>
    )
}

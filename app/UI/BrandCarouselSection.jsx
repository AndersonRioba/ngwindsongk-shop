'use client'

import Link from "next/link"
import Image from "next/image"
import { useRef } from "react"
import useSWR from "swr"
import { fetcher } from "@/app/lib/data"
import useCart from "@/app/lib/hooks/useCart"

import ProductListing, { ProductListingSkeleton } from "@/app/UI/ProductListing"
import { getImageUrl } from "@/app/lib/utils/image";

/**
 * @param {Object} props
 * @param {string}  props.title       — e.g. "Grainmill"
 * @param {string}  props.subtitle    — e.g. "Hearty oats & pantry staples"
 * @param {string}  props.barColor    — Tailwind bg class e.g. "bg-oats"
 * @param {string}  props.seeAllHref  — e.g. "/products/oats"
 * @param {string[]} props.categories — category names to include
 */
export default function BrandCarouselSection({
    title,
    subtitle,
    barColor,
    seeAllHref,
    categories = [],
    logoSrc,
    customStyle = {},
    fetchSlug,
    fallbackData,
}) {
    const scrollRef = useRef(null)

    // Fetch products specifically for this brand (max 15 for the carousel)
    const { data: brandData, error, isLoading } = useSWR(
        ['/products', { brand: fetchSlug || title, per_page: 15 }],
        fetcher,
        { 
            fallbackData: fallbackData,
            revalidateOnFocus: false,
            revalidateOnMount: !fallbackData, // Skip re-fetch if server already provided data
        }
    );

    const filtered = Array.isArray(brandData) ? brandData : (brandData?.data || []);

    // Auto-hide: only render once data has loaded and there are no products
    if (!isLoading && !error && filtered.length === 0) return null

    function scroll(dir) {
        if (!scrollRef.current) return
        scrollRef.current.scrollBy({ left: dir * 300, behavior: "smooth" })
    }

    return (
        <section className="pt-10 md:pt-14 w-full mx-auto md:max-w-7xl px-4 md:px-8">
            {/* ── Top bar ── */}
            <div 
                className={`${barColor} rounded-t-2xl px-5 md:px-8 py-4 flex items-center justify-between`}
                style={customStyle}
            >
                <div className="flex items-center gap-2">
                    {logoSrc && (
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-sm">
                            <Image 
                                src={getImageUrl(logoSrc)} 
                                alt={`${title} logo`} 
                                width={40}
                                height={40}
                                className="w-full h-full object-contain" 
                            />
                        </div>
                    )}
                    <div>
                        <p className="text-white font-bold text-lg tracking-wide">{title}</p>
                        {subtitle && <p className="text-white/75 text-xs mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                <Link
                    href={seeAllHref}
                    className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-semibold transition-colors"
                >
                    See All
                    <span className="icon-[ant-design--right-outlined] w-3.5 h-3.5" />
                </Link>
            </div>

            {/* ── Carousel ── */}
            <div className="relative bg-white rounded-b-2xl border border-t-0 border-black/6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                {/* Prev button */}
                <button
                    onClick={() => scroll(-1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-black/8 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                    aria-label="Scroll left"
                >
                    <span className="icon-[ant-design--left-outlined] w-4 h-4" />
                </button>

                {/* Cards row */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide px-10 py-5"
                >
                    {isLoading
                        ? [...Array(6)].map((_, i) => (
                            <div key={i} className="flex-none w-[280px] md:w-[320px] flex items-stretch">
                                <ProductListingSkeleton />
                            </div>
                        ))
                        : filtered.length > 0
                            ? filtered.map(product => (
                                <div key={product.id ?? product.name} className="flex-none w-[280px] md:w-[320px] flex items-stretch">
                                    <ProductListing product={product} data={product} />
                                </div>
                            ))
                            : (
                                <div className="flex-1 flex items-center justify-center py-12 text-sm text-black/40">
                                    No products found in this category.
                                </div>
                            )
                    }
                </div>

                {/* Next button */}
                <button
                    onClick={() => scroll(1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-black/8 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                    aria-label="Scroll right"
                >
                    <span className="icon-[ant-design--right-outlined] w-4 h-4" />
                </button>
            </div>
        </section>
    )
}

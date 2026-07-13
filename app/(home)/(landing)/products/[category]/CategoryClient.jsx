'use client'

import React, { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { fetcher } from "@/app/lib/data"
import ProductListing, { ProductListingSkeleton } from "@/app/UI/ProductListing"
import Pagination from "@/app/UI/Pagination"
import { useScrollRestoration } from "@/app/lib/hooks/useScrollRestoration"

export default function CategoryClient({ fallbackData, initialSearch = "" }) {
    let { category } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const page = parseInt(searchParams.get('page')) || 1;

    // "all" category should not send brand/category filters to the API
    const rawSlug = (category || "").toLowerCase().trim();
    const isAll = rawSlug === "all";

    // Local search state — seeded from URL param (SSR-compatible)
    const [searchInput, setSearchInput] = useState(initialSearch || searchParams.get('search') || "");

    // Guard: skip the debounce effect on initial mount so we don't append ?page=1
    const isFirstRender = useRef(true);

    // Debounced URL update so search is SSR-shareable
    useEffect(() => {
        // Don't touch the URL on the very first render — only react to user typing
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchInput.trim()) {
                params.set('search', searchInput.trim());
            } else {
                params.delete('search');
                params.delete('page');
            }
            if (searchInput.trim()) params.set('page', '1');
            router.replace(`/products/${category}?${params.toString()}`, { scroll: false });
        }, 400);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    // Track Brand Page View (only for specific brand pages)
    useEffect(() => {
        if (isAll) return;
        const trackBrandView = async () => {
            const spacedSlug = rawSlug.replaceAll('-', ' ').replaceAll('%20', ' ');
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`);
                const brands = await response.json();
                const currentBrand = brands.find(b =>
                    b.name.toLowerCase() === spacedSlug ||
                    b.name.toLowerCase().replaceAll(' ', '-') === rawSlug
                );
                if (currentBrand?.tracking_snippet) {
                    try {
                        const fragment = document.createRange().createContextualFragment(currentBrand.tracking_snippet);
                        document.head.appendChild(fragment);
                    } catch (e) {
                        console.error("Failed to inject brand tracking snippet:", e);
                    }
                }
            } catch (error) {
                console.error("Brand view tracking failed:", error);
            }
        };
        trackBrandView();
    }, [category, isAll, rawSlug]);

    // Build SWR params — no brand/category filter for "all"
    const swrParams = {
        page,
        per_page: 12,
        sort_by: 'newest',
    };

    if (!isAll) {
        swrParams.brand = rawSlug;
        swrParams.category = rawSlug;
    }

    // Include current search term in API call
    const currentSearch = searchParams.get('search') || "";
    if (currentSearch.trim()) {
        swrParams.search = currentSearch.trim();
    }

    let { data: productsData, error, isLoading } = useSWR(
        ['/products', swrParams],
        fetcher,
        {
            fallbackData: fallbackData,
            // Revalidate on mount so backend price changes are always visible
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            revalidateOnMount: true,
            errorRetryInterval: 300000
        }
    );

    useScrollRestoration(`category-${category}`, isLoading);

    const productsList = Array.isArray(productsData) ? productsData : (productsData?.data || []);
    const filteredProducts = productsList;

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage);
        router.push(`/products/${category}?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (error) return <p className="p-4 text-red-500">{error?.message || "An error occurred."}</p>;

    return (
        <div className="w-full luxe-reveal luxe-delay-4">

            {/* ── Inline search bar for "all products" page ── */}
            {isAll && (
                <div className="mb-8 max-w-2xl">
                    <div className="w-full h-11 relative group shadow-lg shadow-primary/10 rounded-2xl">
                        <span className="icon-[heroicons--magnifying-glass] absolute left-4 top-1/2 -translate-y-1/2 text-primary h-5 w-5 group-focus-within:scale-110 transition-transform" />
                        <input
                            type="search"
                            placeholder="Search all products…"
                            name="search"
                            id="product-search"
                            aria-label="Search all products"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            className="w-full h-full pl-12 pr-4 py-2 bg-white border border-primary/30 rounded-2xl focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all text-sm outline-none placeholder:text-gray-400 text-gray-800"
                        />
                        {searchInput && (
                            <button
                                onClick={() => setSearchInput("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Clear search"
                            >
                                <span className="icon-[heroicons--x-mark] w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {currentSearch && (
                        <p className="mt-2 text-xs text-gray-500">
                            Showing results for <span className="font-semibold text-primary">&ldquo;{currentSearch}&rdquo;</span>
                        </p>
                    )}
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:gap-8 pt-4 pb-12">
                {isLoading || error
                    ? [...new Array(12)].map((_, i) => (
                        <div key={i}>
                            <ProductListingSkeleton />
                        </div>
                    ))
                    : filteredProducts.map((product, i) => (
                        <div key={product.id || i}>
                            <ProductListing data={product} />
                        </div>
                    ))
                }
            </div>

            {/* Pagination */}
            <Pagination meta={productsData} onPageChange={handlePageChange} />

            {!isLoading && productsList.length === 0 && (
                <div className="luxe-reveal flex flex-col items-center justify-center px-4 py-16">
                    <div className="w-24 h-24 mb-6 text-gray-300">
                        <span className="icon-[heroicons--shopping-bag] w-full h-full" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Products Available</h2>
                    <p className="text-gray-500 text-center max-w-md">
                        We&apos;re currently updating our inventory. Please check back soon for our latest products.
                    </p>
                </div>
            )}

            {!isLoading && productsList.length > 0 && filteredProducts.length === 0 && (
                <div className="luxe-reveal flex flex-col items-center justify-center px-4 py-16">
                    <div className="w-24 h-24 mb-6 text-gray-300">
                        <span className="icon-[weui--search-outlined] w-full h-full" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">No matching products found</h2>
                    <p className="text-gray-500 text-center max-w-md">
                        Try a different search term for the product name, category, brand, or description.
                    </p>
                </div>
            )}
        </div>
    );
}


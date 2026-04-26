'use client'

import React, { useState, useEffect } from "react"
import useSWR from "swr"
import Masonry from "react-masonry-css"
import { fetcher } from "@/app/lib/data"
import ProductListing, { ProductListingSkeleton } from "@/app/UI/ProductListing"
import Search from "@/app/UI/Search"
import BreadCrump from "@/app/UI/BreadCrump"
import { useSearch } from "@/app/lib/providers/SearchProvider"

const BrandRow = ({ brandName, products }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [manualControl, setManualControl] = useState(false);

    // Only scroll if there are more than 3 products
    const shouldScroll = products.length > 3;

    useEffect(() => {
        if (!shouldScroll || isHovered || manualControl) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => prev + 1);
        }, 3000);

        return () => clearInterval(interval);
    }, [shouldScroll, isHovered, manualControl]);

    const handlePrev = () => {
        setManualControl(true);
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    };

    const handleNext = () => {
        setManualControl(true);
        setCurrentIndex((prev) => (prev + 1) % products.length);
    };

    useEffect(() => {
        if (currentIndex === products.length) {
            // Wait for transition, snap back quietly
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(0);

                // Restore transition
                setTimeout(() => setIsTransitioning(true), 50);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, products.length]);

    // Extend products for quiet loop end
    const extendedProducts = shouldScroll ? [...products, ...products.slice(0, 3)] : products;

    return (
        <div
            className="mb-6 pt-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="px-4 md:px-0 flex items-center justify-between mb-6">
                <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-black uppercase tracking-[0.4em]">{brandName}</h2>
            </div>

            <div className="relative overflow-hidden w-full py-4 px-4 md:px-0 carousel-container group">
                <style>{`
                    .carousel-track {
                        --slide-width: 100%;
                    }
                    @media (min-width: 640px) {
                        .carousel-track {
                            --slide-width: 50%;
                        }
                    }
                    @media (min-width: 768px) {
                        .carousel-track {
                            --slide-width: 33.333333%;
                        }
                    }
                `}</style>
                <div
                    className={`flex carousel-track ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
                    style={{
                        transform: `translateX(calc(-${currentIndex} * var(--slide-width)))`,
                    }}
                >
                    {extendedProducts.map((p, i) => (
                        <div key={`${p.id || i}-${i}`} className="w-full sm:w-1/2 md:w-1/3 flex-none shrink-0 px-3 flex flex-col items-stretch">
                            <ProductListing data={p} />
                        </div>
                    ))}
                </div>

                {shouldScroll && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Previous"
                        >
                            <span className="icon-[heroicons--chevron-left] block w-5 h-5 md:w-8 md:h-8 text-primary" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Next"
                        >
                            <span className="icon-[heroicons--chevron-right] block w-5 h-5 md:w-8 md:h-8 text-primary" />
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default function Products() {

    let { data: products, error, isLoading } = useSWR(['/products', { per_page: 500 }], fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: true,
        errorRetryInterval: 300000
    });

    const { search } = useSearch();
    const productsList = Array.isArray(products) ? products : (products?.data || []);
    const normalizedSearch = search.trim().toLowerCase();
    const hasActiveSearch = normalizedSearch.length > 0;
    const masonryBreakpoints = { default: 4, 768: 3, 640: 1 };
    const filteredProducts = productsList.filter((product) => {
        if (!normalizedSearch) return true;

        const searchableFields = [
            product?.name,
            product?.about,
            product?.category?.name,
            product?.brand?.name,
        ];

        return searchableFields.some((field) =>
            field?.toLowerCase().includes(normalizedSearch)
        );
    });

    // Group filtered products by brand name
    const groupedProducts = filteredProducts.reduce((acc, product) => {
        const brandName = product?.brand?.name || 'Exclusive Products';
        if (!acc[brandName]) {
            acc[brandName] = [];
        }
        acc[brandName].push(product);
        return acc;
    }, {});

    if (error) return <p className="p-4 text-red-500">{error?.message || "An error occurred while fetching products."}</p>

    return (
        <div className="w-full px-2 md:px-10 luxe-reveal luxe-delay-4 overflow-hidden">
            <div className="my-8 md:max-w-4xl md:mx-auto">
                <Search />
            </div>

            <BreadCrump />

            <div className="mt-8">
                {
                    isLoading || error ?
                        [...new Array(3)].map((_, i) => (
                            <div className="mb-12 pt-4" key={i}>
                                <div className="h-8 w-48 bg-gray-200 animate-pulse mb-6 rounded px-4 md:px-0"></div>
                                <div className="flex gap-6 overflow-hidden px-4 md:px-0">
                                    {[...new Array(4)].map((_, j) => (
                                        <div key={j} className="w-[85vw] sm:w-[45vw] md:w-[32vw] lg:w-[calc(33.333%-1rem)] max-w-[350px] shrink-0">
                                            <ProductListingSkeleton />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                        : hasActiveSearch ?
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:gap-8 pt-4 pb-12 w-full">
                                {filteredProducts.map((product, i) => (
                                    <div key={product.id || i}>
                                        <ProductListing data={product} />
                                    </div>
                                ))}
                            </div>
                            :
                            Object.entries(groupedProducts).map(([brandName, brandProducts]) => (
                                <BrandRow key={brandName} brandName={brandName} products={brandProducts} />
                            ))
                }
            </div>

            {
                (!isLoading && productsList.length === 0) &&
                <div className="luxe-reveal flex flex-col items-center justify-center px-4 py-16">
                    <div className="w-24 h-24 mb-6 text-gray-300">
                        <span className="icon-[heroicons--shopping-bag] w-full h-full" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Products Available</h2>
                    <p className="text-gray-500 text-center max-w-md">
                        We're currently updating our inventory. Please check back soon for our latest products.
                    </p>
                </div>
            }
            {
                (!isLoading && productsList.length > 0 && filteredProducts.length === 0) &&
                <div className="luxe-reveal flex flex-col items-center justify-center px-4 py-16">
                    <div className="w-24 h-24 mb-6 text-gray-300">
                        <span className="icon-[weui--search-outlined] w-full h-full" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">No matching products found</h2>
                    <p className="text-gray-500 text-center max-w-md">
                        Try a different search term for the product name, category, brand, or description.
                    </p>
                </div>
            }
        </div>
    )
}

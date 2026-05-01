'use client'

import React, { useEffect } from "react"

import useSWR from "swr"

import { useParams } from "next/navigation"
import { fetcher } from "@/app/lib/data"
import Masonry from "react-masonry-css"
import ProductListing, {ProductListingSkeleton} from "@/app/UI/ProductListing"
import { useCategorySearch } from "@/app/lib/providers/CategorySearchProvider"
import Pagination from "@/app/UI/Pagination"
import { useSearchParams, useRouter } from "next/navigation"

export default function Products(){
    let { category } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const page = parseInt(searchParams.get('page')) || 1;

    // Track Brand Page View
    useEffect(() => {
        const trackBrandView = async () => {
            const rawSlug = (category || "").toLowerCase().trim();
            const spacedSlug = rawSlug.replaceAll('-', ' ').replaceAll('%20', ' ');
            
            try {
                // Try to find a brand that matches the slug
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`);
                const brands = await response.json();
                const currentBrand = brands.find(b => 
                    b.name.toLowerCase() === spacedSlug || 
                    b.name.toLowerCase().replaceAll(' ', '-') === rawSlug
                );

                if (currentBrand && currentBrand.tracking_snippet) {
                    const executeSnippet = new Function(currentBrand.tracking_snippet);
                    executeSnippet();
                }
            } catch (error) {
                console.error("Brand view tracking failed:", error);
            }
        };
        trackBrandView();
    }, [category]);


    const masonryBreakpoints = {
      default: 3,
      768: 2,
      640: 1
    };

    // Normalise the URL slug so we can pass it as a server-side filter
    const rawSlug = (category || "").toLowerCase().trim();
    const spacedSlug = rawSlug.replaceAll('-', ' ').replaceAll('%20', ' ');
    const hyphenatedSlug = rawSlug.replaceAll(' ', '-').replaceAll('%20', '-');

    let { data: productsData, error, isLoading } = useSWR(['/products', {
        page,
        per_page: 12,
        sort_by: 'newest',
        // Send both brand & category filters — the API will match whichever is relevant
        brand: spacedSlug,
        category: spacedSlug,
    }], fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: true,
        errorRetryInterval: 300000
    });

    const { categorySearch } = useCategorySearch();
    const productsList = Array.isArray(productsData) ? productsData : (productsData?.data || []);

    const normalizedSearch = categorySearch.trim().toLowerCase();

    // Client-side fallback filter — ensures slug matching even if server doesn't filter
    const filteredProducts = productsList.filter((product) => {
        const catName = product?.category?.name?.toLowerCase() || "";
        const catSlug = catName.replaceAll(' ', '-');
        
        const brandName = product?.brand?.name?.toLowerCase() || "";
        const brandSlug = brandName.replaceAll(' ', '-');
        
        const productName = product?.name?.toLowerCase() || "";
        const productSlug = (product?.slug || productName).replaceAll(' ', '-');

        const isMatchForSlug = 
            catName === spacedSlug || 
            catName === hyphenatedSlug ||
            catSlug === rawSlug ||
            brandName === spacedSlug || 
            brandName === hyphenatedSlug ||
            brandSlug === rawSlug ||
            productName === spacedSlug ||
            productSlug === rawSlug;

        if (!isMatchForSlug) return false;

        // Search bar filter (if active)
        if (!normalizedSearch) return true;
        const searchableFields = [productName, catName, brandName, product?.about];
        return searchableFields.some((field) =>
            field?.toLowerCase().includes(normalizedSearch)
        );
    });

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage);
        router.push(`/products/${category}?${params.toString()}`);
        // Scroll to top on page change
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if(error) return <p>{error}</p>

    return(
        <div className="w-full luxe-reveal luxe-delay-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:gap-8 pt-4 pb-12">
                {
                    isLoading || error?
                    [...new Array(12)].map((_,i)=>(
                        <div key={i}>
                            <ProductListingSkeleton/>
                        </div>
                    ))
                    :
                    filteredProducts.map((product,i)=>(
                        <div key={product.id || i}>
                            <ProductListing data={product}/>
                        </div>
                    ))
                }
            </div>

            {/* Pagination */}
            <Pagination meta={productsData} onPageChange={handlePageChange} />
            {
              (!isLoading && productsList.length===0) &&
                <div className="luxe-reveal flex flex-col items-center justify-center px-4 py-16">
                    <div className="w-24 h-24 mb-6 text-gray-300">
                        <span className="icon-[heroicons--shopping-bag] w-full h-full"/>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Products Available</h2>
                    <p className="text-gray-500 text-center max-w-md">
                        We&apos;re currently updating our inventory. Please check back soon for our latest products.
                    </p>
                </div>
            }
            {
              (!isLoading && productsList.length > 0 && filteredProducts.length===0) &&
                <div className="luxe-reveal flex flex-col items-center justify-center px-4 py-16">
                    <div className="w-24 h-24 mb-6 text-gray-300">
                        <span className="icon-[weui--search-outlined] w-full h-full"/>
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

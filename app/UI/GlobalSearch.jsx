'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { fetcher } from '@/app/lib/data';
import { getImageUrl } from '@/app/lib/utils/image';
import useCart from '@/app/lib/hooks/useCart';
import Spinner from '@/app/UI/Spinner';
import { useRouter } from 'next/navigation';

function SearchResultItem({ product, closeSearch }) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    
    // Pick first variation or fallback to main product data
    const variation = product?.product_variations?.[0] || null;
    const price = variation?.price || product?.price;
    const image = product?.product_images?.find(i => i.is_primary)?.url || product?.product_images?.[0]?.url;

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(quantity, product.name, variation);
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-3 sm:gap-4">
            <Link href={`/products/${product.category?.slug || 'all'}/${product.slug}`} onClick={closeSearch} className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-lg flex-shrink-0">
                    <Image 
                        src={getImageUrl(image, '/product-placeholder.png')} 
                        alt={product.name}
                        fill
                        className="object-contain p-2"
                    />
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                    <p className="font-bold text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mb-0.5 truncate">{product.brand?.name}</p>
                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-1 sm:line-clamp-2 leading-tight pr-2">{product.name}</h4>
                    <p className="font-bold text-primary text-sm mt-1">KSh {Number(price).toLocaleString()}</p>
                </div>
            </Link>
            
            <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 w-full sm:w-auto border-t border-gray-50 sm:border-none pt-3 sm:pt-0">
                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 h-9">
                    <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
                    >-</button>
                    <span className="w-6 text-center text-xs font-semibold">{quantity}</span>
                    <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
                    >+</button>
                </div>
                <button 
                    onClick={handleAdd}
                    className="bg-primary text-white font-bold h-9 px-4 rounded-lg text-xs hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap flex-1 sm:flex-none"
                >
                    ADD TO CART
                </button>
            </div>
        </div>
    );
}

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const router = useRouter();

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Handle click outside to close
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Fetch Categories and Brands for filters
    const { data: catData } = useSWR(['/categories', {}], fetcher, { revalidateOnFocus: false });
    const { data: brandData } = useSWR(['/brands', {}], fetcher, { revalidateOnFocus: false });
    
    const categories = Array.isArray(catData) ? catData : (catData?.data || []);
    const brands = Array.isArray(brandData) ? brandData : (brandData?.data || []);

    // Fetch Products based on query and filters
    const searchParams = { per_page: 20 };
    if (debouncedQuery) searchParams.search = debouncedQuery;
    
    // In our backend, categories might need to be passed as an array or comma separated string.
    // Assuming backend takes array of IDs or names if we modify it. For now, we'll just use search if active.
    
    const { data: prodData, isLoading: isSearching } = useSWR(
        (isOpen && (debouncedQuery || selectedCategories.length || selectedBrands.length)) 
            ? ['/products', searchParams] 
            : null, 
        fetcher
    );
    
    const products = Array.isArray(prodData) ? prodData : (prodData?.data || []);

    // Filter products locally if backend doesn't support multiple category/brand arrays easily yet
    const filteredProducts = products.filter(p => {
        const matchCat = selectedCategories.length === 0 || selectedCategories.includes(p.category?.name);
        const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand?.name);
        return matchCat && matchBrand;
    });

    const toggleCategory = (catName) => {
        setSelectedCategories(prev => prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]);
    };

    const toggleBrand = (brandName) => {
        setSelectedBrands(prev => prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]);
    };

    const handleClearFilters = () => {
        setSelectedCategories([]);
        setSelectedBrands([]);
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-3xl mx-auto flex-1 z-50">
            {/* The Search Bar itself */}
            <div 
                className="relative flex items-center w-full h-12 bg-gray-50 border border-primary rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white shadow-sm cursor-text"
                onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}
            >
                <span className="icon-[heroicons--magnifying-glass] w-5 h-5 text-gray-400 ml-4 mr-2" />
                <input 
                    ref={inputRef}
                    type="text" 
                    placeholder="Search for all our products." 
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    className="flex-1 h-full bg-transparent outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                />
                {query && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setQuery(''); inputRef.current?.focus(); }}
                        className="p-2 mr-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <span className="icon-[material-symbols-light--close] w-5 h-5 block" />
                    </button>
                )}
            </div>

            {/* The Mega-Dropdown Overlay */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col md:flex-row max-h-[80vh] md:max-h-[600px]">
                    
                    {/* Mobile Close Bar */}
                    <div className="md:hidden flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                        <span className="font-bold text-gray-900">Search Results</span>
                        <button onClick={() => setIsOpen(false)} className="p-1 text-gray-500 hover:text-gray-900">
                            <span className="icon-[material-symbols-light--close] w-6 h-6 block" />
                        </button>
                    </div>

                    {/* Left Sidebar: Filters (Hidden if no query and no filters selected, maybe? No, let's keep it visible) */}
                    <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-5 overflow-y-auto hidden md:block">
                        <button 
                            onClick={handleClearFilters}
                            className="w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-gray-300 transition-colors mb-6 shadow-sm"
                        >
                            Clear all filters
                        </button>

                        {brands.length > 0 && (
                            <div className="mb-6">
                                <h5 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Brands & Producers</h5>
                                <div className="space-y-2">
                                    {brands.map(b => (
                                        <label key={b.id} className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedBrands.includes(b.name)}
                                                onChange={() => toggleBrand(b.name)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary transition-colors cursor-pointer"
                                            />
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors line-clamp-1">{b.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {categories.length > 0 && (
                            <div>
                                <h5 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Categories</h5>
                                <div className="space-y-2">
                                    {categories.map(c => (
                                        <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedCategories.includes(c.name)}
                                                onChange={() => toggleCategory(c.name)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary transition-colors cursor-pointer"
                                            />
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors line-clamp-1">{c.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Area: Results */}
                    <div className="flex-1 bg-white p-4 md:p-6 overflow-y-auto">
                        {!debouncedQuery && selectedCategories.length === 0 && selectedBrands.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <span className="icon-[heroicons--magnifying-glass] w-8 h-8 text-gray-300" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">Start typing to search</h4>
                                <p className="text-sm text-gray-500 max-w-xs">Find products by name, category, or brand.</p>
                            </div>
                        ) : isSearching && !products.length ? (
                            <div className="h-full flex flex-col items-center justify-center p-8">
                                <Spinner />
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div>
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                    <h4 className="font-bold text-gray-900">
                                        Products <span className="text-gray-400 font-normal ml-1">({filteredProducts.length})</span>
                                    </h4>
                                    <Link 
                                        href={`/products/all?search=${encodeURIComponent(debouncedQuery)}`}
                                        onClick={() => setIsOpen(false)}
                                        className="text-xs font-bold text-primary hover:underline"
                                    >
                                        View all
                                    </Link>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {filteredProducts.map((product, i) => (
                                        <SearchResultItem key={i} product={product} closeSearch={() => setIsOpen(false)} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <span className="icon-[heroicons--face-frown] w-8 h-8 text-gray-300" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">No products found</h4>
                                <p className="text-sm text-gray-500 max-w-xs">We couldn't find anything matching "{debouncedQuery}". Try a different term or checking your spelling.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

'use client'

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/app/lib/utils/image";
import useCart from "@/app/lib/hooks/useCart";

export function ProductListingSkeleton(){
    return(
        <div className="flex flex-col h-full overflow-hidden rounded-[1.5rem] border border-black/5 bg-white shadow-sm animate-pulse">
            <div className="aspect-square w-full bg-slate-200"></div>
            <div className="flex-1 flex flex-col p-5 gap-4">
                <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-3 w-full bg-slate-200 rounded"></div>
                    <div className="h-3 w-5/6 bg-slate-200 rounded"></div>
                </div>
                <div className="mt-auto pt-4 space-y-4">
                    <div className="h-8 w-full bg-slate-200 rounded-md"></div>
                    <div className="flex justify-between items-end">
                        <div className="h-5 w-20 bg-slate-200 rounded"></div>
                        <div className="h-10 w-24 bg-slate-200 rounded-md"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ProductListing({data}){
    let category = data.category?.name || "Product";
    let {addToCart} = useCart();
    const [variation, setVariation] = useState(() => {
        if(data.product_variations && data.product_variations.length > 0) {
            const offerVariation = data.product_variations.find(v => Number(v.discount) > 0);
            return offerVariation || data.product_variations[0];
        }
        return null;
    });
    const [quantity, setQuantity] = useState(1);
    const [imgSrc, setImgSrc] = useState(null);

    useEffect(()=>{
        if(data.product_variations && data.product_variations.length > 0) {
            const offerVariation = data.product_variations.find(v => Number(v.discount) > 0);
            setVariation(offerVariation || data.product_variations[0]);
        } else {
            setVariation(null);
        }
    },[data])

    const groupedVariations = useMemo(() => (data.product_variations || []).reduce((grouped, item) => {
        if (!grouped[item.attribute_name]) {
            grouped[item.attribute_name] = [];
        }
        grouped[item.attribute_name].push(item);
        return grouped;
    }, {}), [data.product_variations]);

    const handleVariationChange = (attributeName, selectedValue) => {
        const matchedVariation = (groupedVariations[attributeName] || []).find(item => item.attribute_value === selectedValue);
        if (matchedVariation) {
            setVariation(matchedVariation);
        }
    };

    const currentPrice = parseFloat(variation?.price ?? data.price ?? 0);
    const discountAmount = parseFloat(variation?.discount ?? data.discount ?? 0);
    const isOffer = discountAmount > 0;
    const finalPrice = isOffer ? Math.max(0, currentPrice - discountAmount) : currentPrice;
    const currentStock = variation?.stock ?? data.stock;

    const rawImage = variation?.image || data.product_images?.find(image=>image.is_primary)?.url || data.product_images?.[0]?.url || "";
    const primaryImage = getImageUrl(rawImage, '/product-placeholder.png');
    
    useEffect(() => {
        setImgSrc(primaryImage);
    }, [primaryImage]);

    const categorySlug = (data.brand?.name || category).toLowerCase().trim().replaceAll(' ', '-');
    const productSlug = (data.slug || data.name).toLowerCase().trim().replaceAll(' ', '-');
    const href = `/products/${categorySlug}/${productSlug}`;

    return(
        <div className="group flex flex-col h-full overflow-hidden rounded-[1.5rem] border border-black/5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1">
            
            {/* Image Section */}
            <Link href={href} className="relative aspect-square w-full bg-[#f5f5f3] overflow-hidden block">
                {
                    data.message && !isOffer && (
                        <span className="absolute top-3 left-3 z-10 bg-secondary text-white font-semibold py-1 px-2.5 rounded-full text-[10px] uppercase tracking-wider shadow-sm">
                            {data.message}
                        </span>
                    )
                }

                {imgSrc && (
                    <Image 
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                        src={imgSrc} 
                        alt={data.name} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={() => setImgSrc(null)}
                    />
                )}
            </Link>

            {/* Content Section */}
            <div className="flex-1 flex flex-col p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40 mb-1.5">{data.brand?.name || category}</p>
                <Link href={href} className="text-lg font-semibold text-black leading-snug line-clamp-1 hover:text-primary transition-colors">
                    {data.name}
                </Link>
                <p className="mt-2 text-sm text-black/60 line-clamp-2 leading-relaxed">
                    {data.about}
                </p>

                {/* Bottom area pushed to the bottom using mt-auto */}
                <div className="mt-auto pt-5 flex flex-col gap-4">
                    
                    {/* Variations */}
                    {Object.entries(groupedVariations).length > 0 && (
                        <div className="space-y-3">
                            {Object.entries(groupedVariations).map(([attributeName, variations]) => {
                                const sortedVariations = variations.slice().sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
                                const selectedValue = variation?.attribute_name === attributeName ? variation.attribute_value : sortedVariations[0]?.attribute_value;

                                return (
                                    <div key={attributeName} className="flex flex-col gap-1.5">
                                        <label htmlFor={`${data.id}-${attributeName}`} className="text-xs font-semibold text-black/70 tracking-wide">
                                            Select {attributeName}
                                        </label>
                                        <select
                                            className="w-full rounded-xl border border-black/10 bg-[#f9f9f7] px-3 py-3 text-sm font-medium text-black outline-none transition-colors focus:border-black/30 focus:bg-white"
                                            name={attributeName}
                                            id={`${data.id}-${attributeName}`}
                                            value={selectedValue}
                                            onChange={(e)=>handleVariationChange(attributeName, e.target.value)}
                                        >
                                            {sortedVariations.map((item) => (
                                                <option key={item.id ?? `${attributeName}-${item.attribute_value}`} value={item.attribute_value}>
                                                    {item.attribute_value}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Price and Cart Controls */}
                    <div className="flex items-end justify-between gap-2 border-t border-black/5 pt-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-1">Price</p>
                            <div className="flex flex-wrap items-baseline gap-2">
                                {isOffer ? (
                                    <>
                                        <span className="text-sm font-semibold text-black/30 line-through">
                                            Ksh {currentPrice.toLocaleString()}
                                        </span>
                                        <span className="text-xl font-bold text-[#dc2626]">Ksh {finalPrice.toLocaleString()}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xl font-bold text-black">Ksh {currentPrice.toLocaleString()}</span>
                                        {data.previous && (
                                            <span className="text-sm font-semibold text-black/30 line-through">
                                                Ksh {parseFloat(data.previous).toLocaleString()}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            {typeof currentStock !== "undefined" && (
                                <p className="mt-1 text-[11px] font-medium text-amber-600">
                                    {currentStock} in stock
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                            {/* Quantity Control */}
                            <div className="flex items-center h-11 rounded-xl border border-black/10 bg-white overflow-hidden shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    className="w-11 h-full flex items-center justify-center text-black/60 hover:text-black hover:bg-black/5 transition-colors"
                                >
                                    -
                                </button>
                                <input
                                    className="w-10 h-full text-center text-sm font-semibold text-black bg-transparent outline-none p-0"
                                    value={quantity}
                                    min={1}
                                    type="number"
                                    onChange={(e) => {
                                        const nextQuantity = Number.parseInt(e.target.value, 10);
                                        setQuantity(Number.isNaN(nextQuantity) || nextQuantity < 1 ? 1 : nextQuantity);
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setQuantity(prev => prev + 1)}
                                    className="w-11 h-full flex items-center justify-center text-black/60 hover:text-black hover:bg-black/5 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                            
                            {/* Add Button */}
                            <button
                                onClick={()=>addToCart(quantity, data.name, variation)}
                                className="h-11 px-6 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 active:scale-95"
                            >
                                <span className="icon-[ri--shopping-cart-line] w-4 h-4"/>
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

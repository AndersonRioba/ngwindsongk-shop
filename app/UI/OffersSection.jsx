'use client'

import { useState, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { fetcher } from "@/app/lib/data";
import ProductListing from "./ProductListing";
import { CartContext } from "@/app/lib/providers/CartProvider";
import { updateRecord, readRecord } from "@/app/lib/database";
import { popupE } from "@/app/lib/trigger";

export default function OffersSection({ products }) {
    const router = useRouter();
    const { cart, setCart } = useContext(CartContext);
    const [loadingOfferId, setLoadingOfferId] = useState(null);
    const [selectedChoices, setSelectedChoices] = useState({});
    const [showChoiceModal, setShowChoiceModal] = useState(false);
    const [pendingOffer, setPendingOffer] = useState(null);

    // Fetch active combo bundle offers for homepage showcase
    const { data: combosData } = useSWR(['/offers/active', {}], fetcher);
    const activeCombos = combosData?.data || [];

    // Filter products that actually have discounts
    const offerProducts = (products || []).filter(product => {
        const hasDirectDiscount = Number(product.discount) > 0;
        const hasVariationDiscount = product.product_variations?.some(v => Number(v.discount) > 0);
        return hasDirectDiscount || hasVariationDiscount;
    });

    if ((!offerProducts || offerProducts.length === 0) && activeCombos.length === 0) {
        return null;
    }

    const handleClaimClick = (offer, e) => {
        if (e) e.stopPropagation();
        const choiceItems = (offer?.items || []).filter(i => 
            Boolean(i.choice_group) || i.is_required === false || i.is_required === 0 || i.is_required === 'false' || i.is_required === '0'
        );
        if (choiceItems.length > 0) {
            setPendingOffer(offer);
            // Normalize all choice items under key "1" so only ONE product ID is ever sent
            setSelectedChoices({ "1": choiceItems[0].product_id });
            setShowChoiceModal(true);
        } else {
            handleClaimCombo(offer);
        }
    };

    const handleClaimCombo = async (offer, customChoices = null) => {
        setLoadingOfferId(offer.id);
        try {
            const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
            
            // Collect chosen product IDs for this combo
            const choicesToUse = customChoices || selectedChoices;
            const chosenIds = Object.values(choicesToUse).filter(Boolean);
            const queryParam = chosenIds.length > 0 ? `?choices=${chosenIds.join(',')}` : '';

            const res = await fetch(`${apiBaseUrl}/offers/${offer.id}/cart-payload${queryParam}`);
            const data = await res.json();

            if (data.success && data.cart_items?.length > 0) {
                const existingCart = (await readRecord('cart')) || cart || [];
                let updatedCart = [...existingCart];

                data.cart_items.forEach((newItem) => {
                    const existingIndex = updatedCart.findIndex(
                        (i) => i.product === newItem.product_id && (i.variation?.id || null) === (newItem.product_variation_id || null)
                    );

                    if (existingIndex > -1) {
                        updatedCart[existingIndex].quantity += newItem.quantity;
                    } else {
                        updatedCart.push({
                            product: newItem.product_id,
                            quantity: newItem.quantity,
                            variation: newItem.product_variation_id ? { id: newItem.product_variation_id, price: newItem.price } : null,
                            override_price: newItem.price,
                            bundle_title: newItem.bundle_title,
                            bundle_id: offer.id,
                            is_bundle_item: true,
                        });
                    }
                });

                await updateRecord('cart', updatedCart);
                setCart(updatedCart);
                popupE('Success', `Added ${offer.title} combo to cart.`);
                setShowChoiceModal(false);
                router.push('/cart');
            }
        } catch (err) {
            console.error('Failed to claim combo:', err);
        } finally {
            setLoadingOfferId(null);
        }
    };

    return (
        <section className="pt-16 pb-12 w-full mx-auto md:max-w-7xl overflow-hidden px-4 md:px-8 space-y-12">
            
            {/* Featured Combo Deals Section */}
            {activeCombos.length > 0 && (
                <div>
                    <div className="bg-primary rounded-t-2xl px-5 md:px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="icon-[heroicons--gift-solid] w-6 h-6 text-white/90" />
                            <div>
                                <p className="text-white/70 text-[10px] font-semibold uppercase tracking-[0.25em]">Limited Time Promos</p>
                                <p className="text-white font-bold text-lg tracking-wide">Featured Combo Deals</p>
                            </div>
                        </div>
                        <Link
                            href="/offers"
                            className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-semibold transition-colors"
                        >
                            View All Combos
                            <span className="icon-[ant-design--right-outlined] w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-b-2xl border border-t-0 border-black/6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8">
                        {activeCombos.map((combo) => (
                            <div key={combo.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 flex flex-col group hover:shadow-2xl transition-all duration-300">
                                <div className="relative w-full min-h-[240px] max-h-[340px] bg-slate-950 flex items-center justify-center overflow-hidden">
                                    <Image 
                                        src={combo.banner_image} 
                                        alt={combo.title} 
                                        width={1200}
                                        height={800}
                                        unoptimized
                                        className="w-full h-auto max-h-[340px] object-contain transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {combo.subtitle && (
                                        <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                                            {combo.subtitle}
                                        </span>
                                    )}
                                </div>

                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">{combo.title}</h3>
                                        <div className="flex items-baseline gap-3 my-2">
                                            <span className="text-2xl font-black text-amber-500">
                                                KES {Number(combo.bundle_price).toLocaleString()}
                                            </span>
                                            {combo.original_price && (
                                                <span className="text-sm font-bold text-gray-400 line-through">
                                                    KES {Number(combo.original_price).toLocaleString()}
                                                </span>
                                            )}
                                        </div>

                                </div>

                                <button
                                        disabled={loadingOfferId === combo.id}
                                        onClick={(e) => handleClaimClick(combo, e)}
                                        className="mt-4 w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        {loadingOfferId === combo.id ? (
                                            <span className="animate-spin icon-[fluent--spinner-24-filled] w-4 h-4" />
                                        ) : (
                                            <span className="icon-[heroicons--shopping-bag-solid] w-4 h-4" />
                                        )}
                                        <span>{loadingOfferId === combo.id ? 'Loading...' : 'Claim Combo Deal'}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Choice Selection Pop-Up Overlay */}
            {showChoiceModal && pendingOffer && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="relative w-full max-w-md bg-white rounded-[2rem] p-6 shadow-2xl border border-gray-100 flex flex-col space-y-5">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div>
                                <span className="text-[10px] font-black uppercase text-primary tracking-widest block">Customise Your Deal</span>
                                <h3 className="text-lg font-black text-gray-900">{pendingOffer.title}</h3>
                            </div>
                            <button
                                onClick={() => setShowChoiceModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all"
                            >
                                <span className="icon-[material-symbols-light--close] w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs font-semibold text-gray-600">
                            Please select your preferred item option before adding this combo deal to your shopping cart:
                        </p>

                        {/* Option Pickers */}
                        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                            {Object.entries(
                                (pendingOffer?.items || []).reduce((acc, item) => {
                                    const isChoice = Boolean(
                                        item.choice_group || item.is_required === false || item.is_required === 0 || item.is_required === 'false' || item.is_required === '0'
                                    );
                                    if (isChoice) {
                                        const groupKey = "1";
                                        if (!acc[groupKey]) acc[groupKey] = [];
                                        acc[groupKey].push(item);
                                    }
                                    return acc;
                                }, {})
                            ).map(([groupId, groupItems]) => (
                                <div key={groupId} className="bg-purple-50/70 p-4 rounded-2xl border border-primary/20 space-y-2">
                                    <span className="text-[11px] font-black uppercase text-primary tracking-wider block flex items-center gap-1">
                                        <span className="icon-[heroicons--adjustments-horizontal-solid] w-4 h-4 text-primary" />
                                        Choose 1 Option:
                                    </span>
                                    <div className="grid grid-cols-1 gap-2">
                                        {groupItems.map((item, itemIdx) => {
                                            const currentSelected = selectedChoices[groupId] || groupItems[0].product_id;
                                            const isSelected = String(currentSelected) === String(item.product_id);
                                            const optionLetter = String.fromCharCode(65 + itemIdx);
                                            return (
                                                <button
                                                    key={item.id || itemIdx}
                                                    type="button"
                                                    onClick={() => setSelectedChoices(prev => ({ ...prev, [groupId]: item.product_id }))}
                                                    className={`w-full p-3.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-primary text-white border-primary shadow-md'
                                                            : 'bg-white hover:bg-purple-50 text-gray-800 border-purple-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 text-primary'}`}>
                                                            Option {optionLetter}
                                                        </span>
                                                        <span>{item.product?.name || 'Option Item'}</span>
                                                    </div>
                                                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-white bg-white' : 'border-gray-300'}`}>
                                                        {isSelected && <span className="w-2 h-2 rounded-full bg-primary" />}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Confirm Action */}
                        <button
                            disabled={loadingOfferId === pendingOffer.id}
                            onClick={() => handleClaimCombo(pendingOffer)}
                            className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {loadingOfferId === pendingOffer.id ? (
                                <span className="animate-spin icon-[fluent--spinner-24-filled] w-5 h-5" />
                            ) : (
                                <span className="icon-[heroicons--shopping-bag-solid] w-5 h-5" />
                            )}
                            <span>Add Selection to Cart &amp; Checkout</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Individual Discounted Products Scroller */}
            {offerProducts.length > 0 && (
                <div>
                    <div className="bg-gray-900 rounded-t-2xl px-5 md:px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="icon-[heroicons--tag-solid] w-6 h-6 text-white/90" />
                            <p className="text-white font-bold text-lg tracking-wide">Special Product Offers</p>
                        </div>
                        <Link
                            href="/offers"
                            className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-semibold transition-colors"
                        >
                            More Offers
                            <span className="icon-[ant-design--right-outlined] w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="relative w-full bg-white rounded-b-2xl border border-t-0 border-black/6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                        <div 
                            className="flex flex-row overflow-x-auto gap-6 sm:gap-8 pb-8 pt-6 px-6 md:px-8 scrollbar-hide snap-x"
                            style={{ WebkitOverflowScrolling: "touch" }}
                        >
                            {offerProducts.map((product) => (
                                <div key={product.id} className="w-[85vw] sm:w-[20rem] flex-none snap-start">
                                    <ProductListing data={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            <div className="mt-4 flex justify-center md:hidden">
                <Link href="/offers" className="text-sm font-semibold text-primary hover:text-primary/80 underline underline-offset-4 pointer-events-auto">
                    View More Offers & Combo Deals
                </Link>
            </div>
        </section>
    )
}

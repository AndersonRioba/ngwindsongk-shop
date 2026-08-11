'use client'

import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { fetcher } from "@/app/lib/data";
import { CartContext } from "@/app/lib/providers/CartProvider";
import { updateRecord, readRecord } from "@/app/lib/database";
import { popupE } from "@/app/lib/trigger";

export default function OffersSlideshowPopup() {
    const router = useRouter();
    const { cart, setCart } = useContext(CartContext);
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadingOfferId, setLoadingOfferId] = useState(null);

    // Fetch active offer bundles
    const { data: offersData } = useSWR(['/offers/active', {}], fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        dedupingInterval: 60000,
    });

    const activeOffers = offersData?.data || [];
    const offersCount = activeOffers.length;

    useEffect(() => {
        if (offersCount > 0) {
            // Check if dismissed in this session
            const isDismissed = sessionStorage.getItem('dismissed_offer_slideshow');
            if (!isDismissed) {
                // Show instantly on load for fast response
                const timer = setTimeout(() => setIsOpen(true), 50);
                return () => clearTimeout(timer);
            }
        }
    }, [offersCount]);

    // Auto-play removed — user controls slides manually


    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('dismissed_offer_slideshow', 'true');
    };

    const [showChoiceModal, setShowChoiceModal] = useState(false);
    const [pendingOffer, setPendingOffer] = useState(null);
    const [selectedChoices, setSelectedChoices] = useState({});

    const handleClaimClick = (offer, e) => {
        if (e) e.stopPropagation();
        const choiceItems = (offer?.items || []).filter(i => 
            Boolean(i.choice_group) || i.is_required === false || i.is_required === 0 || i.is_required === 'false' || i.is_required === '0'
        );
        if (choiceItems.length > 0) {
            setPendingOffer(offer);
            // Normalize ALL choice items into a SINGLE group key "1"
            // so only one product ID is ever sent as ?choices=X
            setSelectedChoices({ "1": choiceItems[0].product_id });
            setShowChoiceModal(true);
        } else {
            handleOfferClick(offer);
        }
    };

    const handleOfferClick = async (offer, customChoices = null) => {
        setLoadingOfferId(offer.id);
        try {
            const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
            
            // Build choices query if present
            const choicesToUse = customChoices || selectedChoices;
            const chosenIds = Object.values(choicesToUse).filter(Boolean);
            const queryParam = chosenIds.length > 0 ? `?choices=${chosenIds.join(',')}` : '';

            const res = await fetch(`${apiBaseUrl}/offers/${offer.id}/cart-payload${queryParam}`);
            const data = await res.json();

            if (data.success && data.cart_items?.length > 0) {
                // Get existing cart
                const existingCart = (await readRecord('cart')) || cart || [];
                
                // Construct updated cart items
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

                // Persist updated cart
                await updateRecord('cart', updatedCart);
                setCart(updatedCart);

                popupE('Success', `Added ${offer.title} combo to cart.`);
                setIsOpen(false);
                setShowChoiceModal(false);
                router.push('/cart');
            } else {
                popupE('Notice', 'Unable to add offer bundle to cart.');
            }
        } catch (err) {
            console.error('Failed to add offer bundle to cart:', err);
            popupE('Error', 'Failed to add offer bundle to cart.');
        } finally {
            setLoadingOfferId(null);
        }
    };

    if (!isOpen) {
        if (activeOffers.length === 0) return null;
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 left-4 sm:bottom-8 sm:left-6 z-[90] bg-gray-900 hover:bg-black text-white px-5 py-3.5 rounded-full shadow-2xl border border-white/20 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 group"
                aria-label="Re-open Special Offer Deals"
            >
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <span className="icon-[heroicons--gift-solid] w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span className="text-xs font-black uppercase tracking-wider">
                    Special Offers ({offersCount})
                </span>
            </button>
        );
    }

    const currentOffer = activeOffers[currentIndex];

    // Group choice items if present
    const choiceGroupsMap = {};
    (currentOffer?.items || []).forEach(item => {
        if (item.choice_group) {
            if (!choiceGroupsMap[item.choice_group]) choiceGroupsMap[item.choice_group] = [];
            choiceGroupsMap[item.choice_group].push(item);
        }
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 transform transition-all duration-300 scale-100">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/80 hover:bg-white text-gray-800 backdrop-blur-md flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                    aria-label="Close offer pop-up"
                >
                    <span className="icon-[material-symbols-light--close] w-7 h-7" />
                </button>

                {/* Main Banner Slide Container */}
                <div className="relative group cursor-pointer bg-slate-950" onClick={() => handleOfferClick(currentOffer)}>
                    {/* Full Poster Image (Uncropped across all devices) */}
                    <div className="relative w-full flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-hidden">
                        <Image
                            src={currentOffer.banner_image}
                            alt={currentOffer.title}
                            width={1200}
                            height={800}
                            unoptimized
                            className="w-full h-auto max-h-[70vh] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />
                    </div>

                    {/* Offer Content Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 text-white flex flex-col justify-end">
                        {/* Subtitle / Tagline Badge */}
                        {currentOffer.subtitle && (
                            <span className="inline-block bg-primary text-white text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider w-fit mb-1.5 shadow-md">
                                {currentOffer.subtitle}
                            </span>
                        )}

                        {currentOffer.title && (
                            <h2 className="text-xl sm:text-3xl font-black tracking-tight drop-shadow-md mb-1 line-clamp-1">
                                {currentOffer.title}
                            </h2>
                        )}

                        {/* Pricing Badge */}
                        <div className="flex items-center gap-3 my-1">
                            <span className="text-xl sm:text-2xl font-black text-amber-400 drop-shadow">
                                KES {Number(currentOffer.bundle_price).toLocaleString()}
                            </span>
                            {currentOffer.original_price && (
                                <span className="text-sm sm:text-base font-bold text-gray-300 line-through opacity-80">
                                    KES {Number(currentOffer.original_price).toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* CTA Button */}
                        <button
                            disabled={loadingOfferId === currentOffer.id}
                            onClick={(e) => handleClaimClick(currentOffer, e)}
                            className="mt-2 w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3 transition-all active:scale-95 group-hover:scale-[1.01]"
                        >
                            {loadingOfferId === currentOffer.id ? (
                                <span className="animate-spin icon-[fluent--spinner-24-filled] w-5 h-5" />
                            ) : (
                                <span className="icon-[heroicons--shopping-bag-solid] w-5 h-5" />
                            )}
                            <span>{loadingOfferId === currentOffer.id ? 'Loading Bundle...' : 'Claim Offer & Proceed'}</span>
                        </button>
                    </div>
                </div>

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
                                            // Normalize all choice items into group "1" if single group, or use their choice_group
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
                                                const optionLetter = String.fromCharCode(65 + itemIdx); // A, B, C...
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
                                onClick={() => handleOfferClick(pendingOffer)}
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

                {/* Slideshow Controls (If multiple offers) */}
                {activeOffers.length > 1 && (
                    <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
                        {/* Indicators */}
                        <div className="flex items-center gap-2">
                            {activeOffers.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                        idx === currentIndex ? 'w-8 bg-primary' : 'w-2.5 bg-gray-600 hover:bg-gray-400'
                                    }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentIndex((prev) => (prev - 1 + activeOffers.length) % activeOffers.length)}
                                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition-all"
                                aria-label="Previous Slide"
                            >
                                <span className="icon-[fluent--chevron-left-16-filled] w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentIndex((prev) => (prev + 1) % activeOffers.length)}
                                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition-all"
                                aria-label="Next Slide"
                            >
                                <span className="icon-[fluent--chevron-right-16-filled] w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

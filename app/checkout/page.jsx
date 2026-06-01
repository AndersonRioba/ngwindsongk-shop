'use client'

import { useState, useContext, useEffect, useRef } from "react";
import { CheckoutContext } from "@/app/lib/providers/CheckoutProvider";
import { useRouter } from "next/navigation";
import useAuth from "@/src/hooks/useAuth";
import PlacesAutocomplete from "../components/PlacesAutocomplete";
// import useSWR from "swr"; // COMMENTED OUT: was used for counties fetch, no longer needed
import { fetcher } from "@/app/lib/data";
import useCart from "@/app/lib/hooks/useCart";

const PICKUP_LOCATIONS = [
    { id: 'industrial', name: 'Head Office / Factory (Industrial Area)', address: 'Industrial Area, Nairobi, Kenya', fee: 0 },
    { id: 'bazaar',     name: 'Bazaar Plaza Pick-up Station',            address: 'Moi Avenue, Nairobi, Kenya', fee: 0 },
];

export default function CheckoutInfoPage(){
    const { user } = useAuth();
    const { 
        orderDetails, setOrderDetails,
        pickup, setPickup,
        createAccount, setCreateAccount,
        coordinates, setCoordinates,
        addressComponents, setAddressComponents,
        shipping, setShipping,
        deliveryZone, setDeliveryZone
    } = useContext(CheckoutContext);

    const { cart } = useCart();
    const [showIndustrialPickup, setShowIndustrialPickup] = useState(false);

    // 'pickup' holds the selected location id string, or null for delivery
    const [deliveryMode, setDeliveryMode] = useState(pickup ? 'pickup' : 'delivery');
    let [isReturning, setIsReturning] = useState(false);
    const returningRef = useRef(null);
    const [errors, setErrors] = useState({});
    const router = useRouter();

    // Zone picker state
    /* COMMENTED OUT: County + urban center pickers — customer discovery (Kenya) showed
       customers prefer to be called to confirm delivery options rather than select from
       a predefined list. Keeping the code for potential future re-enablement.
    const [selectedCounty, setSelectedCounty] = useState(null);
    const [countySearch, setCountySearch] = useState('');
    const [showCountyList, setShowCountyList] = useState(false);
    const [selectedUrban, setSelectedUrban] = useState('');
    const [manualTown, setManualTown] = useState('');
    */
    const [deliveryFee, setDeliveryFee] = useState(null);
    // Single delivery town field (replaces county + urban center pickers)
    const [deliveryTown, setDeliveryTown] = useState('');

    /* COMMENTED OUT: Counties SWR fetch — no longer needed with free-text town input.
    const { data: countiesData } = useSWR(['/locations/counties', {}], fetcher, {
        revalidateOnFocus: false,
    });
    const counties = countiesData?.data || [];
    */

    useEffect(() => {
        if (!user) return;

        setOrderDetails((currentDetails) => ({
            ...currentDetails,
            full_name: currentDetails.full_name || user.name || user.full_name || '',
            email: currentDetails.email || user.email || '',
            phone: currentDetails.phone || user.phone || '',
        }));
    }, [user, setOrderDetails]);

    useEffect(()=>{},[pickup])

    useEffect(() => {
        const checkCartForIndustrialPickup = async () => {
            if (!cart || cart.length === 0) {
                setShowIndustrialPickup(false);
                return;
            }

            let allowed = false;
            await Promise.all(cart.map(async (item) => {
                try {
                    const res = await fetcher([`/products/${item.product}`, {}]);
                    const brandName = (res.brand?.name || '').toLowerCase();
                    const categoryName = (res.category?.name || '').toLowerCase();
                    const productSlug = (res.slug || '').toLowerCase();
                    
                    const isOatsOrNutmill = brandName.includes('oats') || brandName.includes('nutmill') ||
                                            categoryName.includes('oats') || categoryName.includes('nutmill') ||
                                            productSlug.includes('oats') || productSlug.includes('nutmill');
                    
                    if (isOatsOrNutmill) {
                        const variation = item.variation && item.variation.id
                            ? (res.product_variations || []).find(v => v.id === item.variation.id)
                            : null;
                        
                        const weight = variation ? parseFloat(variation.weight_kg) : parseFloat(res.weight_kg);
                        
                        if (weight === 20 || weight === 25) {
                            allowed = true;
                        }
                    }
                } catch (err) {
                    console.error("Error fetching product for pickup check:", err);
                }
            }));
            
            setShowIndustrialPickup(allowed);
            
            if (!allowed && pickup === 'industrial') {
                setPickup(null);
            }
            if (allowed && pickup === 'bazaar') {
                setPickup(null);
            }
            if (allowed) {
                setDeliveryMode('pickup');
            }
        };

        checkCartForIndustrialPickup();
    }, [cart, pickup, setPickup]);

    // Click-outside handler for returning customer dropdown
    useEffect(() => {
        if (!isReturning) return;
        const handleClickOutside = (e) => {
            if (returningRef.current && !returningRef.current.contains(e.target)) {
                setIsReturning(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isReturning]);

    const selectMode = (mode) => {
        setDeliveryMode(mode);
        if (mode === 'delivery') setPickup(null);
        if (mode === 'pickup') {
            // COMMENTED OUT: county/urban state resets
            // setSelectedCounty(null);
            // setSelectedUrban('');
            setDeliveryTown('');
            setDeliveryFee(null);
        }
    };

    /* COMMENTED OUT: County + urban center change handlers
       Keeping for potential future re-enablement.
    const handleCountyChange = (e) => {
        const val = e.target.value;
        const county = val ? counties.find(c => c.id === parseInt(val)) : null;
        
        setSelectedCounty(county || null);
        setCountySearch(county ? county.name : '');
        setShowCountyList(false);
        setSelectedUrban('');
        setManualTown('');
        
        const fee = county ? parseFloat(county.delivery_fee) : 0;
        setDeliveryFee(fee);
        setShipping(fee);
        setDeliveryZone(county?.name || null);

        setOrderDetails(prev => ({ ...prev, delivery_county: county?.name || '', delivery_zone: '' }));
    };

    const handleUrbanChange = (e) => {
        const val = e.target.value;
        setSelectedUrban(val);
        setManualTown('');
        if (val === 'other') {
            const fee = selectedCounty ? parseFloat(selectedCounty.delivery_fee) : 0;
            setDeliveryFee(fee);
            setShipping(fee);
            setDeliveryZone(selectedCounty?.name ? `${selectedCounty.name} (Other Town)` : null);
            setOrderDetails(prev => ({ ...prev, delivery_zone: '' }));
        } else if (val) {
            const urban = selectedCounty?.children?.find(c => c.id === parseInt(val));
            const fee = urban ? parseFloat(urban.delivery_fee) : (selectedCounty ? parseFloat(selectedCounty.delivery_fee) : 0);
            setDeliveryFee(fee);
            setShipping(fee);
            setDeliveryZone(urban?.name || selectedCounty?.name || null);
            setOrderDetails(prev => ({ ...prev, delivery_zone: urban?.name || '' }));
        } else {
            const fee = selectedCounty ? parseFloat(selectedCounty.delivery_fee) : 0;
            setDeliveryFee(fee);
            setShipping(fee);
            setDeliveryZone(selectedCounty?.name || null);
            setOrderDetails(prev => ({ ...prev, delivery_zone: '' }));
        }
    };
    */

    const handleDeliveryTownChange = (e) => {
        const town = e.target.value;
        setDeliveryTown(town);
        setDeliveryZone(town || null);
        setOrderDetails(prev => ({ ...prev, delivery_zone: town, delivery_county: '' }));
        if (errors.delivery_town) setErrors({ ...errors, delivery_town: null });
    };

    const selectPickupLocation = (locationId) => {
        setPickup(locationId);
    };

    const continueToPayment = (e) => {
        e.preventDefault();
        const newErrors = {};

        // Full Name and Email are now optional
        if (!orderDetails.phone || orderDetails.phone.trim() === '') {
            newErrors.phone = 'Phone number is required.';
        }
        // Email is now optional
        if (deliveryMode === 'pickup' && !pickup) {
            newErrors.pickup = 'Please select a pickup location.';
        }
        if (deliveryMode === 'delivery') {
            /* COMMENTED OUT: county-based validation
            if (!selectedCounty) {
                newErrors.county = 'Please select your delivery county.';
            }
            if (selectedUrban === 'other' && !manualTown.trim()) {
                newErrors.manual_town = 'Please enter your town name.';
            }
            */
            // New: require delivery town free-text field
            if (!deliveryTown || deliveryTown.trim() === '') {
                newErrors.delivery_town = 'Please enter your delivery town.';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            // Scroll to the first error
            const firstError = Object.keys(newErrors)[0];
            const element = document.getElementById(firstError);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (deliveryMode === 'delivery') {
            /* COMMENTED OUT: county/urban zone resolution
            const finalZone = selectedUrban === 'other' ? manualTown.trim() : (selectedUrban ? (selectedCounty?.children?.find(c => c.id === parseInt(selectedUrban))?.name) : selectedCounty?.name);
            const finalFee = deliveryFee ?? 0;
            setDeliveryZone(finalZone);
            setShipping(finalFee);
            setOrderDetails(prev => ({
                ...prev,
                delivery_zone: finalZone,
                delivery_county: selectedCounty?.name || '',
                shipping: finalFee,
            }));
            */
            // New: use free-text delivery town directly as delivery_zone
            const finalTown = deliveryTown.trim();
            setDeliveryZone(finalTown);
            setOrderDetails(prev => ({
                ...prev,
                delivery_zone: finalTown,
                delivery_county: '',
            }));
        }
        setErrors({});
        router.push('/checkout/payment');
    }

    return(
        <>
            <main className="md:max-w-[80vw] mx-auto md:my-10 p-2 pb-28 md:pb-10">
                <section className="flex flex-col md:flex-row md:justify-center">
                    <section className="md:w-2/3">
                        <h3 className="text-3xl mb-3">Checkout Details</h3>

                        {/* ── Progress Stepper ── */}
                        <div className="flex items-center gap-0 mb-8 mt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</div>
                                <span className="text-xs font-bold text-primary">Details</span>
                            </div>
                            <div className="flex-1 h-[2px] bg-gray-200 mx-2"><div className="h-full bg-gray-200 w-0" /></div>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 text-xs font-bold flex items-center justify-center">2</div>
                                <span className="text-xs font-bold text-gray-400">Payment</span>
                            </div>
                            <div className="flex-1 h-[2px] bg-gray-200 mx-2" />
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 text-xs font-bold flex items-center justify-center">3</div>
                                <span className="text-xs font-bold text-gray-400">Confirmation</span>
                            </div>
                        </div>

                        {/* Returning customer toggle */}
                        <section ref={returningRef} className="relative mb-7">
                            <div onClick={e=>setIsReturning(!isReturning)} className="flex justify-between items-center rounded-xl p-3 bg-gray-100 hover:bg-primary hover:text-white cursor-pointer">
                                <p>Returning customer?</p>
                                <span className={`w-7 h-7 ${isReturning?'icon-[humbleicons--chevron-up]':'icon-[humbleicons--chevron-down]'}`}/>
                            </div>
                            <div className={`mx-2 md:mx-10 shadow-lg rounded-md mt-3 p-5 bg-white z-10 border border-gray-100 ${isReturning?'block':'hidden'}`}>
                                <p className="text-sm mb-4">Enter phone number to retrieve shipping details</p>
                                <div className="flex border-2 border-gray-200 rounded-md mb-4">
                                    <input onChange={e=>setOrderDetails({...orderDetails, phone:e.target.value})} className="w-full px-4 py-2" placeholder="Enter phone number" type="tel" />
                                    <button className="bg-primary text-white py-2 px-4 rounded-r-md">Use</button>
                                </div>
                            </div>
                        </section>

                        <form id="checkout-form" onSubmit={continueToPayment}>
                            {/* Contact Details */}
                            <h5 className="my-5 py-2 uppercase text-sm font-semibold text-primary border-b-[1px]">Contact Details</h5>
                            <div className="grid md:grid-cols-2 gap-y-5 gap-x-5">
                                <div className="md:col-span-2">
                                    <label htmlFor="full_name">
                                        Full Name <span className="text-black/40 text-xs">(optional)</span>
                                    </label>
                                    <input 
                                        id="full_name"
                                        type="text" 
                                        className={`block w-full h-11 px-4 border-[1px] rounded-xl mt-1 focus:outline-none focus:ring-2 transition-all ${errors.full_name ? 'border-red-500 focus:ring-red-200' : 'border-primary focus:ring-primary/20'}`} 
                                        placeholder="Jane Doe" 
                                        value={orderDetails.full_name}
                                        onChange={e=>{
                                            setOrderDetails({...orderDetails, full_name:e.target.value});
                                            if(errors.full_name) setErrors({...errors, full_name:null});
                                        }}
                                    />
                                    {errors.full_name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.full_name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="email">
                                        Email <span className="text-black/40 text-xs">(optional)</span>
                                    </label>
                                    <input 
                                        id="email"
                                        type="email" 
                                        inputMode="email"
                                        className={`block w-full h-11 px-4 border-[1px] rounded-xl mt-1 focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-primary focus:ring-primary/20'}`} 
                                        placeholder="jane@example.com" 
                                        value={orderDetails.email}
                                        onChange={e=>{
                                            setOrderDetails({...orderDetails, email:e.target.value});
                                            if(errors.email) setErrors({...errors, email:null});
                                        }}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                                </div>
                                <div>
                                    <label htmlFor="phone">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        id="phone"
                                        type="tel" 
                                        inputMode="tel"
                                        required
                                        className={`block w-full h-11 px-4 border-[1px] rounded-xl mt-1 focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-primary focus:ring-primary/20'}`} 
                                        placeholder="0712345678" 
                                        value={orderDetails.phone}
                                        onChange={e=>{
                                            setOrderDetails({...orderDetails, phone:e.target.value});
                                            if(errors.phone) setErrors({...errors, phone:null});
                                        }}
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
                                </div>
                            </div>

                            {/* Pickup / Delivery Mode Selection */}
                            <h5 className="my-5 py-2 uppercase text-sm font-semibold text-primary border-b-[1px]">Delivery Method</h5>
                            <p className="text-sm text-black/60 mb-4">How would you like to receive your order?</p>

                            <div className={`grid gap-4 mb-6 ${deliveryMode === 'pickup' || showIndustrialPickup ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
                                {/* Pickup */}
                                <div 
                                    onClick={() => {
                                        if (showIndustrialPickup) return;
                                        deliveryMode === 'pickup' ? selectMode('delivery') : selectMode('pickup')
                                    }} 
                                    className={`gap-3 p-5 rounded-lg border-2 flex items-start ${showIndustrialPickup ? 'cursor-default border-primary bg-primary/5' : 'cursor-pointer ' + (deliveryMode === 'pickup' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-400')} transition-all`}
                                >
                                    {deliveryMode === 'pickup' || showIndustrialPickup
                                        ? <span className="icon-[grommet-icons--radial-selected] w-5 h-5 text-primary mt-1 shrink-0"/>
                                        : <span className="icon-[grommet-icons--radial] w-5 h-5 mt-1 shrink-0"/>
                                    }
                                    <div className="flex-1">
                                        <p className="font-semibold text-base">Pickup</p>
                                        <p className="text-black/60 text-sm">Pick up at our head office or a station near you</p>
                                        <span className="mt-1.5 inline-block text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full mr-2">FREE</span>
                                        {deliveryMode === 'pickup' && !showIndustrialPickup && <span className="text-xs text-primary underline mt-2 inline-block">Switch to Delivery</span>}
                                    </div>
                                </div>

                                {/* Delivery */}
                                {!showIndustrialPickup && deliveryMode !== 'pickup' && (
                                <div 
                                    onClick={() => selectMode('delivery')} 
                                    className={`gap-3 p-5 rounded-lg border-2 flex items-start cursor-pointer transition-all ${deliveryMode === 'delivery' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-400'}`}
                                >
                                    {deliveryMode === 'delivery'
                                        ? <span className="icon-[grommet-icons--radial-selected] w-5 h-5 text-primary mt-1 shrink-0"/>
                                        : <span className="icon-[grommet-icons--radial] w-5 h-5 mt-1 shrink-0"/>
                                    }
                                    <div className="flex-1">
                                        <p className="font-semibold text-base">Delivery</p>
                                        <p className="text-black/60 text-sm">Have your order delivered to your address — urban centres in Kenya</p>
                                        <span className="mt-1.5 inline-block text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                            {deliveryTown ? `📍 ${deliveryTown}` : 'Enter your town'}
                                        </span>
                                    </div>
                                </div>
                                )}
                            </div>

                            {/* Pickup: show location cards */}
                            {deliveryMode === 'pickup' && (
                                <div className="mb-6">
                                    <div className="flex flex-col gap-3" id="pickup">
                                        {PICKUP_LOCATIONS.filter(loc => {
                                            if (loc.id === 'industrial') return showIndustrialPickup;
                                            if (loc.id === 'bazaar') return !showIndustrialPickup;
                                            return true;
                                        }).map(loc => (
                                            <div 
                                                key={loc.id}
                                                onClick={() => {
                                                    selectPickupLocation(loc.id);
                                                    if(errors.pickup) setErrors({...errors, pickup:null});
                                                }}
                                                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${pickup === loc.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                {pickup === loc.id
                                                    ? <span className="icon-[grommet-icons--radial-selected] w-5 h-5 text-primary mt-0.5 shrink-0"/>
                                                    : <span className="icon-[grommet-icons--radial] w-5 h-5 mt-0.5 shrink-0"/>
                                                }
                                                <div className="flex-1">
                                                    <p className="font-semibold">{loc.name}</p>
                                                    <p className="text-black/60 text-sm">{loc.address}</p>
                                                </div>
                                                <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full shrink-0 self-center">FREE</span>
                                            </div>
                                        ))}
                                        {errors.pickup && <p className="text-red-500 text-xs font-medium">{errors.pickup}</p>}
                                    </div>
                                </div>
                            )}

                        {/* Delivery: town input + address input */}
                        {deliveryMode === 'delivery' && (
                            <div className="mb-6 space-y-4">
                                {/* Info bar */}
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <span className="icon-[fluent--vehicle-truck-24-regular] w-5 h-5 text-blue-600 shrink-0" />
                                    <p className="text-sm text-blue-800 font-medium">
                                        Enter your delivery town — our team will call to confirm delivery details and fees.
                                    </p>
                                </div>

                                {/* Delivery Town — free text input (replaces county + urban center pickers) */}
                                {/* COMMENTED OUT: County search + urban center dropdowns
                                    These were removed during Kenya customer discovery:
                                    customers prefer a call-back to confirm delivery options.
                                    The county/urban center components remain in the codebase below
                                    for potential future re-enablement.

                                <div className="relative">
                                    <label htmlFor="countySearch" className="block text-sm font-medium mb-1">
                                        County <span className="text-red-500">*</span>
                                    </label>
                                    ... county search input with dropdown list ...
                                    ... urban center select ...
                                    ... manual town input ...
                                </div>
                                */}

                                {/* New: single delivery town field */}
                                <div>
                                    <label htmlFor="delivery_town" className="block text-sm font-medium mb-1">
                                        Delivery Town <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="delivery_town"
                                        type="text"
                                        autoComplete="off"
                                        placeholder="e.g. Nairobi, Mombasa, Kisumu, Eldoret..."
                                        value={deliveryTown}
                                        onChange={handleDeliveryTownChange}
                                        className={`block w-full h-11 px-4 border-[1px] rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.delivery_town ? 'border-red-500 focus:ring-red-200' : 'border-primary focus:ring-primary/20'}`}
                                    />
                                    {errors.delivery_town && <p className="text-red-500 text-xs mt-1 font-medium">{errors.delivery_town}</p>}
                                    <p className="text-xs text-black/50 mt-1">Our team will contact you to confirm exact delivery location and fee.</p>
                                </div>

                                {/* Delivery Address */}
                                <div>
                                    <label htmlFor="address">
                                        Delivery Address <span className="text-black/40 text-xs">(optional)</span>
                                    </label>
                                    <PlacesAutocomplete
                                        id="address"
                                        onChange={(value) => {
                                            setOrderDetails({ ...orderDetails, address: value });
                                            setCoordinates(null);
                                            setAddressComponents(null);
                                        }}
                                        onSelect={(place) => {
                                            setOrderDetails({
                                                ...orderDetails,
                                                address: place.formatted_address || place.name || '',
                                            });
                                            setCoordinates({
                                                latitude: place.latitude,
                                                longitude: place.longitude,
                                            });
                                            setAddressComponents(place.address_components || []);
                                        }}
                                        value={orderDetails.address}
                                        className="block w-full h-11 px-4 border-[1px] border-primary rounded-xl mt-1 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                        placeholder="Building, Apartment, or Street, City" 
                                    />
                                </div>
                            </div>
                        )}

                            {/* Create account */}
                            {
                                !user &&
                                <div className="flex items-center gap-2 my-5">
                                    <input
                                        type="checkbox"
                                        name="createAccount"
                                        id="createAccount"
                                        checked={createAccount}
                                        onChange={e => setCreateAccount(e.target.checked)}
                                    />
                                    <p className="text-sm">Create account?</p>
                                </div>
                            }

                            {createAccount && (
                                <>
                                <div className="my-5 w-full">
                                    <label htmlFor="password" className="text-sm">Password <span className="text-red-500">*</span></label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        className="block w-full md:w-2/3 p-2 border-[1px] border-primary rounded-md mt-1"
                                        placeholder="Enter password"
                                    />
                                </div>
                                <div className="flex items-center gap-2 my-5">
                                    <input
                                        type="checkbox"
                                        name="createAccount"
                                        id="createAccount"
                                    />
                                    <p className="text-sm">Get notifications on offers</p>
                                </div>
                                </>
                            )}

                            {/* Order notes */}
                            <p className="mt-5">Order notes <span className="text-xs text-black/70">(optional)</span></p>
                            <textarea 
                                onChange={e=>setOrderDetails({...orderDetails, notes:e.target.value})} 
                                value={orderDetails.notes} 
                                className="mt-1 border-[1px] p-3 rounded-md min-h-32 w-full focus:outline-none focus:border-primary" 
                                placeholder="Any notes on your order, or an alternative phone number in case you're unavailable during delivery"
                            />

                            {Object.keys(errors).length > 0 && (
                                <p className="text-red-500 text-sm mt-3 font-semibold">Please correct the errors above to continue.</p>
                            )}

                            <div className="mt-8 flex flex-col md:flex-row md:justify-end">
                                <button type="submit" className="w-full md:w-auto bg-primary text-white py-4 px-10 rounded-xl hover:bg-opacity-90 transition-all font-semibold">
                                    Continue to Payment
                                </button>
                            </div>
                        </form>
                    </section>
                </section>
            </main>

            {/* ── Sticky mobile CTA ── */}
            <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] px-4 py-3 flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs text-gray-400 font-medium">Total</p>
                    <p className="text-base font-bold text-primary">Review in next step</p>
                </div>
                <button
                    form="checkout-form"
                    type="submit"
                    className="bg-primary text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all flex-1 max-w-[200px]"
                >
                    Continue to Payment
                </button>
            </div>
        </>
    )
}

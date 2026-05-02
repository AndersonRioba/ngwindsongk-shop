'use client'

import { useState, useContext, useEffect } from "react";
import { CheckoutContext } from "@/app/lib/providers/CheckoutProvider";
import { useRouter } from "next/navigation";
import useAuth from "@/src/hooks/useAuth";
import PlacesAutocomplete from "../components/PlacesAutocomplete";
import useSWR from "swr";
import { fetcher } from "@/app/lib/data";

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

    // 'pickup' holds the selected location id string, or null for delivery
    const [deliveryMode, setDeliveryMode] = useState(pickup ? 'pickup' : 'delivery');
    let [isReturning, setIsReturning] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Zone picker state
    const [selectedCounty, setSelectedCounty] = useState(null);
    const [selectedUrban, setSelectedUrban] = useState('');
    const [manualTown, setManualTown] = useState('');
    const [deliveryFee, setDeliveryFee] = useState(null);

    // Fetch all counties + urban centers in one call
    const { data: countiesData } = useSWR(['/locations/counties', {}], fetcher, {
        revalidateOnFocus: false,
    });
    const counties = countiesData?.data || [];

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

    const selectMode = (mode) => {
        setDeliveryMode(mode);
        if (mode === 'delivery') setPickup(null);
        if (mode === 'pickup') {
            setSelectedCounty(null);
            setSelectedUrban('');
            setDeliveryFee(null);
        }
    };

    const handleCountyChange = (e) => {
        const county = counties.find(c => c.id === parseInt(e.target.value));
        setSelectedCounty(county || null);
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

    const selectPickupLocation = (locationId) => {
        setPickup(locationId);
    };

    const continueToPayment = (e) => {
        e.preventDefault();
        if (!orderDetails.phone || orderDetails.phone.trim() === '') {
            setError('Phone number is required.');
            return;
        }
        if (!orderDetails.email || orderDetails.email.trim() === '') {
            setError('Email address is required for your invoice.');
            return;
        }
        if (deliveryMode === 'pickup' && !pickup) {
            setError('Please select a pickup location.');
            return;
        }
        if (deliveryMode === 'delivery') {
            if (!selectedCounty) {
                setError('Please select your delivery county.');
                return;
            }
            if (selectedUrban === 'other' && !manualTown.trim()) {
                setError('Please enter your town name.');
                return;
            }
            const finalZone = selectedUrban === 'other' ? manualTown.trim() : (selectedUrban ? (selectedCounty?.children?.find(c => c.id === parseInt(selectedUrban))?.name) : selectedCounty?.name);
            const finalFee = deliveryFee ?? 0;

            // Store final zone and fee into global context
            setDeliveryZone(finalZone);
            setShipping(finalFee);

            // Store into orderDetails before navigating
            setOrderDetails(prev => ({
                ...prev,
                delivery_zone: finalZone,
                delivery_county: selectedCounty?.name || '',
                shipping: finalFee,
            }));
        }
        setError('');
        router.push('/checkout/payment');
    }

    return(
        <>
            <main className="md:max-w-[80vw] mx-auto md:my-10 p-2">
                <section className="flex flex-col md:flex-row md:justify-center">
                    <section className="md:w-2/3">
                        <h3 className="text-3xl mb-3">Checkout Details</h3>

                        {/* Returning customer toggle */}
                        <section className="relative mb-7">
                            <div onClick={e=>setIsReturning(!isReturning)} className="flex justify-between items-center rounded-xl p-3 bg-gray-100 hover:bg-primary hover:text-white cursor-pointer">
                                <p>Returning customer?</p>
                                <span className={`w-7 h-7 ${isReturning?'icon-[humbleicons--chevron-up]':'icon-[humbleicons--chevron-down]'}`}/>
                            </div>
                            <div className={`mx-2 md:mx-10 shadow-lg rounded-md mt-3 p-5 absolute top-full left-0 w-[90%] md:w-2/3 bg-white z-10 ${isReturning?'block':'hidden'}`}>
                                <p className="text-sm mb-4">Enter phone number to retrieve shipping details</p>
                                <div className="flex border-2 border-gray-200 rounded-md mb-4">
                                    <input onChange={e=>setOrderDetails({...orderDetails, phone:e.target.value})} className="w-full px-4 py-2" placeholder="Enter phone number" type="tel" />
                                    <button className="bg-primary text-white py-2 px-4 rounded-r-md">Use</button>
                                </div>
                            </div>
                        </section>

                        <form onSubmit={continueToPayment}>
                            {/* Contact Details */}
                            <h5 className="my-5 py-2 uppercase text-sm font-semibold text-primary border-b-[1px]">Contact Details</h5>
                            <div className="grid md:grid-cols-2 gap-y-5 gap-x-5">
                                <div className="md:col-span-2">
                                    <label htmlFor="full_name">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        id="full_name"
                                        type="text" 
                                        required
                                        className="block w-full p-2 border-[1px] border-primary rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-primary" 
                                        placeholder="Jane Doe" 
                                        value={orderDetails.full_name}
                                        onChange={e=>setOrderDetails({...orderDetails, full_name:e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        id="email"
                                        type="email" 
                                        required
                                        className="block w-full p-2 border-[1px] border-primary rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-primary" 
                                        placeholder="jane@example.com" 
                                        value={orderDetails.email}
                                        onChange={e=>setOrderDetails({...orderDetails, email:e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        id="phone"
                                        type="tel" 
                                        required
                                        className="block w-full p-2 border-[1px] border-primary rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-primary" 
                                        placeholder="0712345678" 
                                        value={orderDetails.phone}
                                        onChange={e=>setOrderDetails({...orderDetails, phone:e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Pickup / Delivery Mode Selection */}
                            <h5 className="my-5 py-2 uppercase text-sm font-semibold text-primary border-b-[1px]">Delivery Method</h5>
                            <p className="text-sm text-black/60 mb-4">How would you like to receive your order?</p>

                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                {/* Pickup */}
                                <div 
                                    onClick={() => selectMode('pickup')} 
                                    className={`gap-3 p-5 rounded-lg border-2 flex items-start cursor-pointer transition-all ${deliveryMode === 'pickup' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-400'}`}
                                >
                                    {deliveryMode === 'pickup'
                                        ? <span className="icon-[grommet-icons--radial-selected] w-5 h-5 text-primary mt-1 shrink-0"/>
                                        : <span className="icon-[grommet-icons--radial] w-5 h-5 mt-1 shrink-0"/>
                                    }
                                    <div className="flex-1">
                                        <p className="font-semibold text-base">Pickup</p>
                                        <p className="text-black/60 text-sm">Pick up at our head office or a station near you</p>
                                        <span className="mt-1.5 inline-block text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">FREE</span>
                                    </div>
                                </div>

                                {/* Delivery */}
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
                                            {deliveryFee !== null ? `KES ${deliveryFee.toLocaleString()}` : 'Select zone'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Pickup: show location cards */}
                            {deliveryMode === 'pickup' && (
                                <div className="mb-6">
                                    <p className="text-sm font-semibold mb-3 text-black/70">Select a pickup location:</p>
                                    <div className="flex flex-col gap-3">
                                        {PICKUP_LOCATIONS.map(loc => (
                                            <div 
                                                key={loc.id}
                                                onClick={() => selectPickupLocation(loc.id)}
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
                                    </div>
                                </div>
                            )}

                        {/* Delivery: zone picker + address input */}
                        {deliveryMode === 'delivery' && (
                            <div className="mb-6 space-y-4">
                                {/* Info bar */}
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <span className="icon-[fluent--vehicle-truck-24-regular] w-5 h-5 text-blue-600 shrink-0" />
                                    <p className="text-sm text-blue-800 font-medium">
                                        Delivery fee is based on your selected county/zone.
                                        {deliveryFee !== null && <span className="font-bold ml-1">Current fee: KES {deliveryFee.toLocaleString()}</span>}
                                    </p>
                                </div>

                                {/* Step 1: County */}
                                <div>
                                    <label htmlFor="county" className="block text-sm font-medium mb-1">
                                        County <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="county"
                                        value={selectedCounty?.id || ''}
                                        onChange={handleCountyChange}
                                        className="block w-full p-2 border-[1px] border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">-- Select County --</option>
                                        {counties.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Step 2: Urban center (shown after county selected) */}
                                {selectedCounty && (
                                    <div>
                                        <label htmlFor="urban" className="block text-sm font-medium mb-1">
                                            Town / Urban Center <span className="text-black/40 text-xs">(optional — county fee applies if not listed)</span>
                                        </label>
                                        <select
                                            id="urban"
                                            value={selectedUrban}
                                            onChange={handleUrbanChange}
                                            className="block w-full p-2 border-[1px] border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">-- Select Town/Urban Center --</option>
                                            {(selectedCounty.children || []).map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.name}
                                                </option>
                                            ))}
                                            <option value="other">Other (enter town manually)</option>
                                        </select>
                                    </div>
                                )}

                                {/* Manual town input */}
                                {selectedUrban === 'other' && (
                                    <div>
                                        <label htmlFor="manual_town" className="block text-sm font-medium mb-1">
                                            Enter Your Town <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="manual_town"
                                            type="text"
                                            value={manualTown}
                                            onChange={e => setManualTown(e.target.value)}
                                            className="block w-full p-2 border-[1px] border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="e.g. Eldoret, Kisii, Thika..."
                                        />
                                        <p className="text-xs text-black/50 mt-1">County-level fee applies.</p>
                                    </div>
                                )}

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
                                        className="block w-full p-2 border-[1px] border-primary rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-primary" 
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
                                    <p className="text-sm">Get notifactions on offers</p>
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

                            {error && (
                                <p className="text-red-500 text-sm mt-3 font-semibold">{error}</p>
                            )}

                            <div className="mt-8 flex justify-end">
                                <button type="submit" className="bg-primary text-white py-4 px-10 rounded-xl hover:bg-opacity-90 transition-all font-semibold">
                                    Continue to Payment
                                </button>
                            </div>
                        </form>
                    </section>
                </section>
            </main>
        </>
    )
}

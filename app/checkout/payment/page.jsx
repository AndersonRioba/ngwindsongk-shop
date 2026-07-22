'use client'

import { useEffect, useState, useContext, useRef } from "react";
import Image from "next/image";
import { CheckoutContext } from "@/app/lib/providers/CheckoutProvider";
import { postData, fetcher, postFetcher } from "@/app/lib/data";
import { load } from "@/app/lib/storage";
import useCart from "@/app/lib/hooks/useCart";
import { useRouter } from "next/navigation";

const PICKUP_LOCATIONS = [
    { id: 'industrial', name: 'Head Office / Factory (Industrial Area)', address: 'Industrial Area, Nairobi, Kenya', fee: 0 },
    { id: 'bazaar',     name: 'Bazaar Plaza Pick-up Station',            address: 'Moi Avenue, Nairobi, Kenya', fee: 0 },
];

export default function CheckoutPaymentPage(){
    let [total, setTotal] = useState(0);
    const {
        products:items, setProducts:setItems,
        orderDetails, setOrderDetails,
        pickup, setPickup,
        shipping, setShipping,
        contact, setContact,
        coordinates, setCoordinates,
        addressComponents, setAddressComponents,
        deliveryZone, setDeliveryZone
    } = useContext(CheckoutContext);

    const [products, setProducts] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [shippingLoading, setShippingLoading] = useState(true);
    const [settings, setSettings] = useState({});
    const [idempotencyKey, setIdempotencyKey] = useState('');
    const [createdOrderId, setCreatedOrderId] = useState(null);
    const [isPolling, setIsPolling] = useState(false);
    const [pollingStatus, setPollingStatus] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [paymentTimeout, setPaymentTimeout] = useState(false);
    const [manualReceipt, setManualReceipt] = useState('');
    const [manualSubmitting, setManualSubmitting] = useState(false);
    const [paymentMode, setPaymentMode] = useState('stk');
    const pollingIntervalRef = useRef(null);

    const { cart } = useCart();
    const router = useRouter();

    useEffect(() => {
        if (cart && items.length === 0) setItems(Array.from(new Set(cart)));
    }, [cart, items.length, setItems])

    // Timer Effect
    useEffect(() => {
        let timer;
        if (isPolling && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (isPolling && timeLeft <= 0) {
            setIsPolling(false);
            setIsProcessing(false);
            setPaymentTimeout(true);
        }
        return () => clearInterval(timer);
    }, [isPolling, timeLeft]);

    // Clear polling if timeout
    useEffect(() => {
        if (paymentTimeout && pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
    }, [paymentTimeout]);

    useEffect(() => {
        // Generate Idempotency-Key once when the checkout component mounts
        setIdempotencyKey(crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36));
    }, []);

    // Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            const data = await fetcher(['/settings?group=delivery', {}]);
            const salesData = await fetcher(['/settings?group=sales', {}]);
            setSettings({
                ...data.data,
                ...salesData.data
            });
        };
        fetchSettings();
    }, []);

    // Dynamic Shipping Calculation (API-based)
    useEffect(() => {
        if (!settings || products.length === 0) return;

        // If shipping was already set by the zone picker on the previous page, don't overwrite it
        if (shipping !== 0 && !pickup) {
            setShippingLoading(false);
            return;
        }

        const calculateShipping = async () => {
            // Rule: Pickup Fees
            if (pickup) {
                const selectedLocation = PICKUP_LOCATIONS.find(l => l.id === pickup);
                setShipping(selectedLocation ? selectedLocation.fee : 0);
                setDeliveryZone(selectedLocation ? selectedLocation.name : null);
                setShippingLoading(false);
                return;
            }

            // Standard Free Delivery Check
            let hasBulk = false;
            let bulkTotalWeight = 0;
            let requiresPaidShipping = false;

            products.forEach(p => {
                if (p.is_bulk) {
                    hasBulk = true;
                    bulkTotalWeight += (p.weight_kg * p.quantity);
                    requiresPaidShipping = true;
                }
            });

            const freeBulkThreshold = Number(settings.free_delivery_threshold_bulk_kg || 250);
            const freeDeliveryThreshold = Number(settings.free_delivery_threshold_amount || 5000);

            if (hasBulk && bulkTotalWeight >= freeBulkThreshold) {
                requiresPaidShipping = false;
            }

            if (total >= freeDeliveryThreshold && !requiresPaidShipping) {
                setShipping(0);
                setDeliveryZone("Free Delivery Threshold");
                setShippingLoading(false);
                return;
            }

            // If coordinates/components available, fetch from API
            if (coordinates && coordinates.latitude && addressComponents && addressComponents.length > 0) {
                setShippingLoading(true);
                try {
                    const res = await postFetcher('/delivery-fee', {
                        latitude: coordinates.latitude,
                        longitude: coordinates.longitude,
                        address_components: addressComponents
                    });
                    if (res.delivery_fee !== null) {
                        setShipping(res.delivery_fee);
                        setDeliveryZone(res.matched_location);
                    } else {
                        // Keep current shipping if set, otherwise fallback
                        if (!shipping) setShipping(0); 
                    }
                } catch (err) {
                    console.error("Failed to fetch delivery fee:", err);
                    if (!shipping) setShipping(0);
                } finally {
                    setShippingLoading(false);
                }
            } else {
                // If shipping is already set from zone picker, keep it
                if (!shipping) setShipping(0);
                setShippingLoading(false);
            }
        };

        calculateShipping();

    }, [total, pickup, coordinates, addressComponents, settings, products, setShipping, setDeliveryZone, shipping]);

    useEffect(()=>{
        if (items.length > 0 && products.length === 0) {
            const fetchProducts = async () => {
                const fetchedProducts = await Promise.all(items.map(async (item) => {
                    const data = await fetcher([`/products/${item.product}`,{}]);
                    const variation = item.variation && item.variation.id
                        ? (data.product_variations || []).find(v => v.id === item.variation.id)
                        : null;
                    
                    const variationPrice = parseFloat(variation?.price || 0);
                    // Use nullish coalescing so a 0-discount on the variation is respected,
                    // and null/undefined falls through to the product-level discount
                    const variationDiscountRaw = variation?.discount ?? null;
                    const variationDiscount = variationDiscountRaw !== null ? parseFloat(variationDiscountRaw) : null;
                    
                    let basePrice = variationPrice > 0 ? variationPrice : parseFloat(data.price || 0);
                    let discountAmount = variationDiscount !== null
                        ? variationDiscount
                        : parseFloat(data.discount || 0);
                    
                    let itemPrice = Math.max(0, basePrice - discountAmount);
                    return {
                        id: data.id,
                        quantity: parseInt(item.quantity) || 1,
                        variation: variation?.id || null,
                        name: data.name,
                        brand: data.brand || null,
                        price: itemPrice || 0,
                        is_bulk: !!variation?.is_bulk,
                        weight_kg: parseFloat(variation?.weight_kg || 0),
                        min_order_quantity: parseInt(variation?.min_order_quantity || 0)
                    };
                }));
                setProducts(fetchedProducts);
            };
            fetchProducts();
        }
    }, [items, products.length]);

    useEffect(()=>{
        let t = products.reduce((acc, product) => {
            const tempPrice = parseFloat(product.price) || 0;
            const tempQty = parseInt(product.quantity) || 1;
            return acc + (tempPrice * tempQty);
        }, 0);
        setTotal(parseFloat(t) || 0);
        if (!contact && orderDetails.phone) {
            setContact(orderDetails.phone);
        }
    }, [products, contact, orderDetails.phone, setContact, setTotal]);


    const finalOrderTotal = total + Number(shipping);

    const submitOrder = () => {
        if (!contact || contact.trim() === '') {
            setErrorMsg("Please enter an M-Pesa phone number");
            return;
        }

        // Client-side Constraints Validation
        const brandTotals = {};
        for (const p of products) {
            if (p.is_bulk && p.quantity < p.min_order_quantity) {
                setErrorMsg(`Wholesale minimum order quantity for ${p.name} is ${p.min_order_quantity}.`);
                return;
            }
            if (p.brand && p.brand.id) {
                if (!brandTotals[p.brand.id]) {
                    brandTotals[p.brand.id] = { name: p.brand.name, max: parseFloat(p.brand.max_order_amount || 0), total: 0 };
                }
                brandTotals[p.brand.id].total += (p.price * p.quantity);
            }
        }
        
        for (const bId in brandTotals) {
            const b = brandTotals[bId];
            if (b.max > 0 && b.total > b.max) {
                setErrorMsg(`Maximum order limit exceeded for ${b.name}. Limit is KES ${b.max}. (Your total: KES ${b.total})`);
                return;
            }
        }

        setIsProcessing(true);
        setErrorMsg('');

        const finalTotal = finalOrderTotal;
        const deliveryMethod = pickup ? 'pickup' : 'delivery';
        const pickupStation = pickup ? (PICKUP_LOCATIONS.find(l => l.id === pickup)?.name) : null;

        if (createdOrderId) {
            postData(
                (mpesaResponse)=>{
                    if (mpesaResponse.success === false || mpesaResponse.ResponseCode !== "0") {
                        setIsProcessing(false);
                        setErrorMsg(mpesaResponse.message || mpesaResponse.error || mpesaResponse.errorMessage || mpesaResponse.ResponseDescription || "Failed to initiate M-Pesa prompt. Please try again.");
                    } else {
                        // Start Polling
                        startPolling(createdOrderId);
                    }
                },
                {
                    amount: finalTotal,
                    phone: contact,
                    order_id: createdOrderId
                },
                '/pay/mpesa',
                process.env.NEXT_PUBLIC_API_URL,
                load('token'),
                { 'Idempotency-Key': idempotencyKey },
                false
            );
            return;
        }

        postData(
            (response)=>{
                if(response.success){
                    const orderSlug = response.data.slug;
                    setCreatedOrderId(orderSlug);
                    postData(
                        (mpesaResponse)=>{
                            if (mpesaResponse.success === false || mpesaResponse.ResponseCode !== "0") {
                                setIsProcessing(false);
                                setErrorMsg(mpesaResponse.message || mpesaResponse.error || mpesaResponse.errorMessage || mpesaResponse.ResponseDescription || "Failed to initiate M-Pesa prompt. Please try again.");
                            } else {
                                // Start Polling
                                startPolling(orderSlug);
                            }
                        },
                        {
                            amount: finalTotal,
                            phone: contact,
                            order_id: orderSlug
                        },
                        '/pay/mpesa',
                        process.env.NEXT_PUBLIC_API_URL,
                        load('token'),
                        { 'Idempotency-Key': idempotencyKey },
                        false
                    );
                } else {
                    setIsProcessing(false);
                    setErrorMsg("Failed to place order. Please try again.");
                }
            },
            {
                total: finalTotal,
                payment_method: 'mpesa',
                shipping: Number(shipping),
                order_details: orderDetails,
                sales: products,
                pickup_station: pickupStation,
                delivery_method: deliveryMethod,
                delivery_zone: deliveryZone,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
            },
            '/orders',
            process.env.NEXT_PUBLIC_API_URL,
            load('token'),
            { 'Idempotency-Key': idempotencyKey },
            false
        )
    }

    const startPolling = (orderSlug) => {
        setIsPolling(true);
        setPaymentTimeout(false);
        setTimeLeft(60);
        setPollingStatus('Waiting for you to enter M-Pesa PIN...');
        
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pay/mpesa/status/${orderSlug}`, {
                    headers: { 'Authorization': `Bearer ${load('token')}` }
                });
                const data = await res.json();
                
                if (data.status === 'success') {
                    clearInterval(pollingIntervalRef.current);
                    setIsPolling(false);
                    setIsProcessing(false);
                    router.push('/checkout/success?type=auto');
                } else if (data.status === 'failed') {
                    clearInterval(pollingIntervalRef.current);
                    setIsPolling(false);
                    setIsProcessing(false);
                    setErrorMsg("M-Pesa payment failed or was cancelled. You can try again or pay manually.");
                    setPaymentTimeout(true);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 3000);
    }

    const submitManualPayment = async () => {
        if (!manualReceipt || manualReceipt.trim().length < 5) {
            setErrorMsg("Please enter a valid M-Pesa receipt number.");
            return;
        }
        setManualSubmitting(true);
        setErrorMsg('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pay/mpesa/manual-receipt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${load('token')}`
                },
                body: JSON.stringify({
                    order_id: createdOrderId,
                    receipt_number: manualReceipt
                })
            });
            const data = await res.json();
            
            if (data.success) {
                router.push('/checkout/success?type=manual');
            } else {
                setErrorMsg(data.message || "Failed to submit receipt.");
                setManualSubmitting(false);
            }
        } catch (err) {
            console.error("Manual receipt error:", err);
            setErrorMsg("Network error. Please try again.");
            setManualSubmitting(false);
        }
    }

    const submitDirectManualPayment = () => {
        if (!manualReceipt || manualReceipt.trim().length < 5) {
            setErrorMsg("Please enter a valid M-Pesa receipt number.");
            return;
        }

        // Client-side Constraints Validation
        const brandTotals = {};
        for (const p of products) {
            if (p.is_bulk && p.quantity < p.min_order_quantity) {
                setErrorMsg(`Wholesale minimum order quantity for ${p.name} is ${p.min_order_quantity}.`);
                return;
            }
            if (p.brand && p.brand.id) {
                if (!brandTotals[p.brand.id]) {
                    brandTotals[p.brand.id] = { name: p.brand.name, max: parseFloat(p.brand.max_order_amount || 0), total: 0 };
                }
                brandTotals[p.brand.id].total += (p.price * p.quantity);
            }
        }
        
        for (const bId in brandTotals) {
            const b = brandTotals[bId];
            if (b.max > 0 && b.total > b.max) {
                setErrorMsg(`Maximum order limit exceeded for ${b.name}. Limit is KES ${b.max}. (Your total: KES ${b.total})`);
                return;
            }
        }

        setIsProcessing(true);
        setErrorMsg('');

        const finalTotal = finalOrderTotal;
        const deliveryMethod = pickup ? 'pickup' : 'delivery';
        const pickupStation = pickup ? (PICKUP_LOCATIONS.find(l => l.id === pickup)?.name) : null;

        const processManualReceipt = async (orderId) => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pay/mpesa/manual-receipt`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${load('token')}`
                    },
                    body: JSON.stringify({
                        order_id: orderId,
                        receipt_number: manualReceipt
                    })
                });
                const data = await res.json();
                
                if (data.success) {
                    router.push('/checkout/success?type=manual');
                } else {
                    setErrorMsg(data.message || "Failed to submit receipt.");
                    setIsProcessing(false);
                }
            } catch (err) {
                console.error("Manual receipt error:", err);
                setErrorMsg("Network error. Please try again.");
                setIsProcessing(false);
            }
        };

        if (createdOrderId) {
            processManualReceipt(createdOrderId);
            return;
        }

        postData(
            (response)=>{
                if(response.success){
                    const orderSlug = response.data.slug;
                    setCreatedOrderId(orderSlug);
                    processManualReceipt(orderSlug);
                } else {
                    setIsProcessing(false);
                    setErrorMsg("Failed to place order. Please try again.");
                }
            },
            {
                total: finalTotal,
                payment_method: 'mpesa',
                shipping: Number(shipping),
                order_details: orderDetails,
                sales: products,
                pickup_station: pickupStation,
                delivery_method: deliveryMethod,
                delivery_zone: deliveryZone,
                latitude: coordinates?.latitude,
                longitude: coordinates?.longitude
            },
            '/orders',
            process.env.NEXT_PUBLIC_API_URL,
            load('token'),
            { 'Idempotency-Key': idempotencyKey },
            false
        )
    }

    return(
        <main className="md:max-w-[80vw] mx-auto md:my-10 p-2 pb-28 md:pb-10">
            <div className="mb-6 flex items-center justify-between">
                <button onClick={() => router.push('/checkout')} className="flex items-center text-sm font-semibold text-primary hover:underline">
                    <span className="icon-[humbleicons--chevron-left] w-5 h-5 mr-1" /> Back to Information
                </button>
            </div>

            {/* ── Progress Stepper ── */}
            <div className="flex items-center gap-0 mb-8 max-w-lg">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 text-xs font-bold flex items-center justify-center">✓</div>
                    <span className="text-xs font-bold text-gray-400">Details</span>
                </div>
                <div className="flex-1 h-[2px] bg-primary mx-2" />
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</div>
                    <span className="text-xs font-bold text-primary">Payment</span>
                </div>
                <div className="flex-1 h-[2px] bg-gray-200 mx-2" />
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 text-xs font-bold flex items-center justify-center">3</div>
                    <span className="text-xs font-bold text-gray-400">Confirmation</span>
                </div>
            </div>
            
            <section className="flex flex-col md:flex-row md:justify-center items-start">
                <section className="md:w-1/2 md:max-w-[500px] border-[1px] border-gray-200 rounded-xl p-6 shadow-sm">
                    <h6 className="font-semibold text-2xl mb-4">Payment & Order Summary</h6>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-black/80 space-y-2">
                        <p><span className="font-semibold">Deliver to:</span> {orderDetails.full_name}</p>
                        <p><span className="font-semibold">Phone:</span> {orderDetails.phone}</p>
                        {pickup ? (() => {
                            const loc = PICKUP_LOCATIONS.find(l => l.id === pickup);
                            return <p><span className="font-semibold">Pickup:</span> {loc ? `${loc.name} — ${loc.address}` : pickup}</p>;
                        })() : (
                            <>
                                <p><span className="font-semibold">Delivery Town:</span> {orderDetails.delivery_zone || 'Not specified'}</p>
                                <p><span className="font-semibold">Address:</span> {orderDetails.address || 'N/A'}</p>
                                {/* COMMENTED OUT: County + Zone rows — replaced by free-text Delivery Town field
                                <p><span className="font-semibold">County:</span> {orderDetails.delivery_county || 'Not selected'}</p>
                                <p><span className="font-semibold">Town:</span> {orderDetails.delivery_zone || 'Not selected'}</p>
                                */}
                            </>
                        )}
                        <p className="pt-2 border-t border-gray-200 mt-2">
                            <span className="font-semibold text-primary">Estimated Delivery:</span> {(() => {
                                const now = new Date();
                                const eatOffset = 3 * 60; // EAT is UTC+3
                                const localTime = new Date(now.getTime() + (now.getTimezoneOffset() + eatOffset) * 60000);
                                
                                const cutoffHour = parseInt(settings.shipping_cutoff_hour || 10);
                                const deliveryDate = new Date(localTime);
                                
                                if (localTime.getHours() >= cutoffHour) {
                                    deliveryDate.setDate(deliveryDate.getDate() + 1);
                                }
                                
                                return deliveryDate.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                            })()}
                        </p>
                    </div>

                    <div className="border-b-2 py-3">
                        <div className="flex my-3 justify-between text-base">
                            <p className="">Items</p>
                            <p>{total} <span className="text-sm uppercase">kes</span> </p>
                        </div>
                        {!pickup && !shippingLoading && shipping === 0 && (
                            <p className="text-xs mb-1 text-primary bg-primary/10 p-2 rounded-lg w-fit">Free delivery applied</p>
                        )}
                        <div className="flex mb-3 justify-between text-base">
                            <p className="">Shipping</p>
                            {shippingLoading
                                ? <p className="text-sm text-black/50 animate-pulse">Calculating...</p>
                                : <p>{Number(shipping)} <span className="text-sm uppercase">kes</span></p>
                            }
                        </div>

                        <div className="flex my-3 justify-between text-base font-semibold">
                            <p className="">Subtotal</p>
                            <p>{finalOrderTotal} <span className="text-sm uppercase">kes</span> </p>
                        </div>
                    </div>
                    <div className="flex my-4 justify-between text-xl font-bold">
                        <p className="">Total</p>
                        <p className="text-primary">{finalOrderTotal} <span className="text-sm uppercase">kes</span> </p>
                    </div>



                    <h6 className="font-semibold capitalize mt-8 mb-2">How would you like to place your order ?</h6>
                    {!isPolling && !paymentTimeout && (
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <label className={`flex items-center gap-2 cursor-pointer p-3 rounded-lg border-2 flex-1 transition-all ${paymentMode === 'stk' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="paymentMode" value="stk" checked={paymentMode === 'stk'} onChange={(e) => {setPaymentMode(e.target.value); setErrorMsg('');}} className="hidden" />
                                {paymentMode === 'stk' ? <span className="icon-[grommet-icons--radial-selected] w-5 h-5 text-primary shrink-0"/> : <span className="icon-[grommet-icons--radial] w-5 h-5 shrink-0 text-gray-400"/>}
                                <span className="font-semibold text-sm">M-Pesa Prompt (STK Push)</span>
                            </label>
                            <label className={`flex items-center gap-2 cursor-pointer p-3 rounded-lg border-2 flex-1 transition-all ${paymentMode === 'manual' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="paymentMode" value="manual" checked={paymentMode === 'manual'} onChange={(e) => {setPaymentMode(e.target.value); setErrorMsg('');}} className="hidden" />
                                {paymentMode === 'manual' ? <span className="icon-[grommet-icons--radial-selected] w-5 h-5 text-primary shrink-0"/> : <span className="icon-[grommet-icons--radial] w-5 h-5 shrink-0 text-gray-400"/>}
                                <span className="font-semibold text-sm">Pay Manually</span>
                            </label>
                        </div>
                    )}

                    {(!isPolling && !paymentTimeout && paymentMode === 'stk') && (
                        <div className="my-3 p-4 border-[1px] border-green-500 rounded-lg bg-green-50">
                            <div className="flex justify-center md:justify-start items-center mb-4">
                                <Image 
                                    src="/mpesa.svg" 
                                    alt="M-Pesa" 
                                    width={120}
                                    height={56}
                                    className="h-12 sm:h-14 w-auto object-contain drop-shadow-sm" 
                                />
                            </div>
                            <p className="text-sm text-green-700 mb-2">Enter the M-Pesa phone number that will receive the payment prompt.</p>
                            <input 
                              type="tel" name="mpesa_contact" placeholder="e.g. 0712345678" 
                              className="block w-full p-3 border-[1px] border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={contact}
                              onChange={e=>setContact(e.target.value)}
                            />
                        </div>
                    )}

                    {(!isPolling && !paymentTimeout && paymentMode === 'manual') && (
                        <div className="my-3 p-4 border-[1px] border-gray-200 rounded-lg bg-gray-50">
                            <div className="text-sm text-gray-700">
                                <p className="mb-1">1. Go to M-Pesa &gt; Lipa na M-Pesa &gt; <strong>Buy Goods</strong></p>
                                <p className="mb-1">2. Till Number: <strong>960393</strong></p>
                                <p className="mb-3">3. Amount: <strong>KES {finalOrderTotal}</strong></p>
                                
                                <label className="block text-sm font-semibold mb-1">Enter M-Pesa Receipt Number</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. SHX1234567" 
                                    value={manualReceipt}
                                    onChange={(e) => setManualReceipt(e.target.value.toUpperCase())}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary mb-3 uppercase"
                                />
                            </div>
                        </div>
                    )}
                    
                    {errorMsg && (
                        <p className="text-red-500 text-sm my-3 font-semibold text-center">{errorMsg}</p>
                    )}

                    {(!isPolling && !paymentTimeout) && (
                        <button 
                            disabled={isProcessing}
                            onClick={paymentMode === 'stk' ? submitOrder : submitDirectManualPayment} 
                            className={`mt-6 text-white block text-center w-full py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed`}
                        >
                            {isProcessing ? 'Processing...' : (paymentMode === 'stk' ? 'Pay & Place Order' : 'Submit Receipt')}
                        </button>
                    )}
                    
                    {isPolling && (
                        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
                            <div className="flex justify-center mb-3">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-sm font-semibold text-primary">{pollingStatus}</p>
                            
                            {/* Visual Progress Bar & Timer */}
                            <div className="mt-4 max-w-xs mx-auto">
                                <div className="flex justify-between text-xs mb-1 font-medium">
                                    <span className={timeLeft <= 15 ? 'text-red-500' : 'text-primary'}>Time remaining</span>
                                    <span className={timeLeft <= 15 ? 'text-red-500' : 'text-gray-600'}>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className={`h-1.5 rounded-full transition-all duration-1000 ease-linear ${timeLeft <= 15 ? 'bg-red-500' : 'bg-primary'}`} 
                                        style={{ width: `${(timeLeft / 60) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">Please keep this page open and wait for the prompt.</p>
                        </div>
                    )}

                    {paymentTimeout && (
                        <div className="mt-6 p-5 border-2 border-red-100 bg-red-50 rounded-xl">
                            <h4 className="font-bold text-red-700 mb-2">Payment Prompt Timeout</h4>
                            <p className="text-sm text-red-600 mb-4">
                                We didn't receive a confirmation. Your network might be slow, or the M-Pesa prompt was missed.
                            </p>
                            
                            <button 
                                onClick={() => submitOrder()} 
                                className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition mb-4"
                            >
                                Resend M-Pesa Prompt
                            </button>
                            
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR PAY MANUALLY</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>

                            <div className="mt-4 text-sm text-gray-700">
                                <p className="mb-1">1. Go to M-Pesa &gt; Lipa na M-Pesa &gt; <strong>Buy Goods</strong></p>
                                <p className="mb-1">2. Till Number: <strong>960393</strong></p>
                                <p className="mb-3">3. Amount: <strong>KES {finalOrderTotal}</strong></p>
                                
                                <label className="block text-sm font-semibold mb-1">Enter M-Pesa Receipt Number</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. SHX1234567" 
                                    value={manualReceipt}
                                    onChange={(e) => setManualReceipt(e.target.value.toUpperCase())}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary mb-3 uppercase"
                                />
                                <button 
                                    onClick={submitManualPayment}
                                    disabled={manualSubmitting}
                                    className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400"
                                >
                                    {manualSubmitting ? 'Verifying...' : 'Submit Receipt'}
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </section>

            {/* ── Sticky mobile pay CTA ── */}
            {!isPolling && !paymentTimeout && (
                <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Total</p>
                        <p className="text-base font-bold text-primary">{finalOrderTotal.toLocaleString()} KES</p>
                    </div>
                    <button
                        disabled={isProcessing}
                        onClick={paymentMode === 'stk' ? submitOrder : submitDirectManualPayment}
                        className="bg-primary text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex-1 max-w-[200px]"
                    >
                        {isProcessing ? 'Processing...' : (paymentMode === 'stk' ? 'Pay & Place Order' : 'Submit Receipt')}
                    </button>
                </div>
            )}
        </main>
    )
}

'use client'

import { useEffect, useState, useContext } from "react";
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
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherError, setVoucherError] = useState('');
    const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

    const { cart } = useCart();
    const router = useRouter();

    useEffect(() => {
        if (cart && items.length === 0) setItems(Array.from(new Set(cart)));
    }, [cart, items.length, setItems])

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
                        setShipping(350); // Fallback
                        setDeliveryZone(null);
                    }
                } catch (err) {
                    console.error("Failed to fetch delivery fee:", err);
                    setShipping(350); // Fallback
                    setDeliveryZone(null);
                } finally {
                    setShippingLoading(false);
                }
            } else {
                setShipping(350);
                setShippingLoading(false);
            }
        };

        calculateShipping();

    }, [total, pickup, coordinates, addressComponents, settings, products, setShipping, setDeliveryZone]);

    useEffect(()=>{
        if (items.length > 0 && products.length === 0) {
            const fetchProducts = async () => {
                const fetchedProducts = await Promise.all(items.map(async (item) => {
                    const data = await fetcher([`/products/${item.product}`,{}]);
                    const variation = item.variation && item.variation.id
                        ? (data.product_variations || []).find(v => v.id === item.variation.id)
                        : null;
                    
                    const variationPrice = parseFloat(variation?.price || 0);
                    const variationDiscount = parseFloat(variation?.discount || 0);
                    
                    let basePrice = variationPrice || parseFloat(data.price || 0);
                    let discountAmount = variationDiscount || parseFloat(data.discount || 0);
                    
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

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return;
        
        setIsValidatingVoucher(true);
        setVoucherError('');
        
        try {
            const response = await postFetcher('/vouchers/validate', {
                code: voucherCode,
                subtotal: total
            });
            
            if (response.success) {
                setAppliedVoucher(response.voucher);
                setVoucherCode('');
            } else {
                setVoucherError(response.message || 'Invalid voucher code.');
            }
        } catch (err) {
            setVoucherError('Unable to validate voucher. Please try again.');
        } finally {
            setIsValidatingVoucher(false);
        }
    };

    const removeVoucher = () => {
        setAppliedVoucher(null);
        setVoucherError('');
    };

    const calculateDiscount = () => {
        if (!appliedVoucher) return 0;
        if (appliedVoucher.discount_type === 'percentage') {
            return (total * (parseFloat(appliedVoucher.discount_amount) / 100));
        }
        return parseFloat(appliedVoucher.discount_amount);
    };

    const discountAmount = calculateDiscount();
    const finalOrderTotal = total + Number(shipping) - discountAmount;

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

        postData(
            (response)=>{
                if(response.success){
                    postData(
                        (mpesaResponse)=>{
                            setIsProcessing(false);
                            router.push('/checkout/success');
                        },
                        {
                            amount: finalTotal,
                            phone: contact,
                            order_id: response.data.slug
                        },
                        '/pay/mpesa',
                        process.env.NEXT_PUBLIC_API_URL,
                        load('token'),
                        { 'Idempotency-Key': idempotencyKey }
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
                voucher_id: appliedVoucher?.id || null,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
            },
            '/orders',
            process.env.NEXT_PUBLIC_API_URL,
            load('token'),
            { 'Idempotency-Key': idempotencyKey }
        )
    }

    return(
        <main className="md:max-w-[80vw] mx-auto md:my-10 p-2">
            <div className="mb-6">
                <button onClick={() => router.push('/checkout')} className="flex items-center text-sm font-semibold text-primary hover:underline">
                    <span className="icon-[humbleicons--chevron-left] w-5 h-5 mr-1" /> Back to Information
                </button>
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
                            <p><span className="font-semibold">Address:</span> {orderDetails.address}</p>
                        )}
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
                        {appliedVoucher && (
                            <div className="flex mb-3 justify-between text-base text-green-600 font-bold">
                                <div className="flex items-center gap-2">
                                    <p>Discount ({appliedVoucher.code})</p>
                                    <button onClick={removeVoucher} className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded hover:bg-red-200">Remove</button>
                                </div>
                                <p>- {discountAmount} <span className="text-sm uppercase">kes</span></p>
                            </div>
                        )}
                        <div className="flex my-3 justify-between text-base font-semibold">
                            <p className="">Subtotal</p>
                            <p>{finalOrderTotal} <span className="text-sm uppercase">kes</span> </p>
                        </div>
                    </div>
                    <div className="flex my-4 justify-between text-xl font-bold">
                        <p className="">Total</p>
                        <p className="text-primary">{finalOrderTotal} <span className="text-sm uppercase">kes</span> </p>
                    </div>

                    {/* Voucher Section */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <span className="icon-[solar--ticket-sale-bold-duotone] w-5 h-5 text-primary" />
                            Have a promo or referral code?
                        </p>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Enter code here"
                                className="flex-1 bg-gray-50 border-gray-200 border rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={voucherCode}
                                onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                                disabled={appliedVoucher || isValidatingVoucher}
                            />
                            <button 
                                onClick={handleApplyVoucher}
                                disabled={!voucherCode || appliedVoucher || isValidatingVoucher}
                                className="bg-gray-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all disabled:bg-gray-300"
                            >
                                {isValidatingVoucher ? '...' : 'Apply'}
                            </button>
                        </div>
                        {voucherError && <p className="text-red-500 text-[11px] mt-2 font-bold px-1">{voucherError}</p>}
                        {appliedVoucher && <p className="text-green-600 text-[11px] mt-2 font-bold px-1 flex items-center gap-1"><span className="icon-[solar--check-circle-bold-duotone] w-4 h-4"/> Code applied successfully!</p>}
                    </div>

                    <h6 className="font-semibold capitalize mt-8 mb-2">How would you like to place your order ?</h6>
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
                    
                    {errorMsg && (
                        <p className="text-red-500 text-sm my-3 font-semibold text-center">{errorMsg}</p>
                    )}

                    <button 
                        disabled={isProcessing}
                        onClick={submitOrder} 
                        className="mt-6 bg-primary text-white block text-center w-full py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                    >
                        {isProcessing ? 'Processing...' : 'Pay & Place Order'}
                    </button>
                </section>
            </section>
        </main>
    )
}

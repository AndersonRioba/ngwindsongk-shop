'use client'

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useContext } from "react";
import { CartContext } from "@/app/lib/providers/CartProvider";
import { CheckoutContext } from "@/app/lib/providers/CheckoutProvider";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { fetcher } from "@/app/lib/data";
import ProductListing, {ProductListingSkeleton} from "@/app/UI/ProductListing";
import useCart from "@/app/lib/hooks/useCart";
import { getImageUrl } from "@/app/lib/utils/image";

function Related({product, category='oats'}){
    let { data, error, isLoading } = useSWR([`/products`,{category, exclude: product}], fetcher,{
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateOnMount: true,
        errorRetryInterval: 300000
    });
    return(
        <>
        {
            (data?.data?.length > 0) &&
            <h6 className="text-xl font-semibold mb-5">Your may also like</h6>
        }
        <div className="grid grid-flow-col auto-cols-[80%] md:auto-cols-[20vw] grid-rows-1 gap-8 py-4 overflow-x-auto">
            {
                isLoading || error?
                [...new Array(4)].map((_,i)=>(<div key={i}><ProductListingSkeleton/></div>))
                :
                (data?.data || []).map((product,i)=>(<div className="" key={i}><ProductListing data={product}/></div>))
            }
        </div>
        </>
    )
}

function CartItem({product, setTotal}){

    let [quantity, setQuantity] = useState(0);
    let [amount, setAmount] = useState(0);
    const { removeFromCart, updateCartQuantity, updateBundleQuantity, removeBundleFromCart, swapBundleItem } = useCart();

    const isBundleItem = !!(product.override_price !== undefined && product.override_price !== null && product.override_price !== '') || !!product.bundle_title || !!product.is_bundle_item;
    const bundleIdentifier = product.bundle_title || product.bundle_id;

    const { data, error, isLoading } = useSWR([`/products/${product.product}`,{}], fetcher,{
        errorRetryInterval: 300000
    });

    // Fetch active combo offers to check for choice groups if this is a bundle item
    const { data: offersData } = useSWR(isBundleItem ? ['/offers/active', {}] : null, fetcher);
    const activeOffersList = offersData?.data || [];
    const matchingOffer = isBundleItem 
        ? activeOffersList.find(o => (product.bundle_id && String(o.id) === String(product.bundle_id)) || (product.bundle_title && o.title === product.bundle_title))
        : null;

    // Find if this specific product belongs to a choice group in the bundle
    const currentProdId = String(product.product?.id || product.product);
    const matchingOfferItem = matchingOffer?.items?.find(i => String(i.product_id) === currentProdId);
    
    // Switch pills MUST only show on choice group items (never on fixed required items with choice_group null/0 or is_required true)
    const availableGroupOptions = (matchingOfferItem && matchingOfferItem.choice_group && !matchingOfferItem.is_required)
        ? matchingOffer?.items?.filter(i => String(i.choice_group) === String(matchingOfferItem.choice_group) && !i.is_required)
        : [];

    useEffect(()=>{
        if(data && !isLoading && !error){
            let finalPrice;
            if (product.override_price !== undefined && product.override_price !== null && product.override_price !== '') {
                finalPrice = parseFloat(product.override_price);
            } else {
                const freshVariation = product.variation?.id
                    ? (data?.product_variations || []).find(v => v.id === product.variation.id)
                    : null;
                const activeVariation = freshVariation || product.variation;

                const variationPrice = parseFloat(activeVariation?.price || 0);
                const variationDiscountRaw = activeVariation?.discount ?? null;
                const variationDiscount = variationDiscountRaw !== null ? parseFloat(variationDiscountRaw) : null;

                const basePrice = variationPrice > 0 ? variationPrice : parseFloat(data?.price || 0);
                const discountAmount = variationDiscount !== null
                    ? variationDiscount
                    : parseFloat(data?.discount || 0);
                
                finalPrice = Math.max(0, basePrice - discountAmount);
            }

            const qty = parseInt(product?.quantity) || 1;

            setAmount(finalPrice);
            setQuantity(qty);
            setTotal(prev => (parseFloat(prev) || 0) + (finalPrice * qty));

            return () => {
                setTotal(prev => (parseFloat(prev) || 0) - (finalPrice * qty));
            };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[data, isLoading, error, product.quantity]);

    const modify = (positive) => {
        let newQty = quantity;
        if (positive) {
            newQty = quantity + 1;
        } else if (quantity > 1) {
            newQty = quantity - 1;
        }

        if (newQty !== quantity) {
            setQuantity(newQty);
            if (isBundleItem && bundleIdentifier) {
                updateBundleQuantity(bundleIdentifier, newQty);
            } else {
                updateCartQuantity(product.product, newQty, product.variation);
            }
        }
    }

    const handleCustomQtyChange = (val) => {
        const newQty = parseInt(val) || 1;
        if (data?.stock && newQty > data.stock) return;
        setQuantity(newQty);
        if (isBundleItem && bundleIdentifier) {
            updateBundleQuantity(bundleIdentifier, newQty);
        } else {
            updateCartQuantity(product.product, newQty, product.variation);
        }
    }

    const remove = () => {
        if (isBundleItem && bundleIdentifier) {
            removeBundleFromCart(bundleIdentifier);
        } else {
            removeFromCart(product.product, product.variation);
        }
        setTotal(total => (parseFloat(total) || 0) - (amount * quantity));
        setQuantity(0);
    }

    return(
        <div className="flex flex-col md:flex-row justify-start md:justify-between md:items-center my-7 border-b-2 border-gray-100 pb-4">
            <div className="flex gap-5 md:items-center">
                <div className="bg-slate-100 flex md:items-center md:justify-center">
                    <Image 
                        className="rounded-lg object-cover" 
                        src={getImageUrl((data?.product_images || []).filter(image=>image?.is_primary==1)[0]?.url)} 
                        alt={data?.name+' image'} 
                        width={128}
                        height={128}
                    />
                </div>
                <div className="space-y-1">
                    <p className="text-xl font-bold">{data?.name} {product.variation &&<span className="text-sm text-black/70">({product.variation.attribute_value})</span>}</p>
                    <p className="text-sm text-black/50">Quantity: {quantity}</p>
                    <p className="font-bold text-primary">KSH {amount}</p>
                    {isBundleItem && (
                        <div className="space-y-2 mt-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-sm shadow-primary/20">
                                <span className="icon-[heroicons--gift-solid] w-3 h-3 opacity-90" />
                                Combo Deal (Synchronized Qty: {quantity})
                            </span>

                            {/* Option Selector for Choice Group Items */}
                            {availableGroupOptions.length > 1 && (
                                <div className="mt-2.5 p-3 bg-purple-50/60 rounded-2xl border border-primary/20">
                                    <span className="text-[10px] font-black uppercase text-primary tracking-wider block mb-1.5 flex items-center gap-1">
                                        <span className="icon-[heroicons--adjustments-horizontal-solid] w-3.5 h-3.5 text-primary" />
                                        Switch Option Choice:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {availableGroupOptions.map(opt => {
                                            const isSelected = String(opt.product_id) === currentProdId;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (!isSelected) {
                                                            const newPrice = opt.override_price !== null && opt.override_price !== undefined 
                                                                ? opt.override_price 
                                                                : opt.product?.price;
                                                            swapBundleItem(
                                                                product.product?.id || product.product, 
                                                                { id: opt.product_id, price: newPrice }, 
                                                                bundleIdentifier
                                                            );
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                        isSelected
                                                            ? 'bg-primary text-white shadow-md shadow-primary/20 border border-primary'
                                                            : 'bg-white hover:bg-purple-50 text-gray-800 border border-purple-200'
                                                    }`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-300'}`} />
                                                    {opt.product?.name || 'Option Item'}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex md:flex-col justify-end gap-x-4">
                <div className="flex gap-5 mb-6 mt-2">
                    <button onClick={() => modify(false)} className="bg-primary text-white px-4 rounded-l-lg hover:bg-primary/90">-</button>
                    <input 
                        className="bg-gray-200 p-2 w-12 text-center font-bold text-sm" 
                        value={quantity} 
                        onChange={e => handleCustomQtyChange(e.target.value)} 
                        type="number" 
                        min={1} 
                        max={data?.stock}
                    />
                    <button onClick={() => modify(true)} className="bg-primary text-white px-4 rounded-r-lg hover:bg-primary/90">+</button>
                </div>
                <button onClick={remove} className="rounded-lg flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-700">
                    <span className="icon-[material-symbols-light--delete-outline] w-5 h-5 text-red-500"/>
                    {isBundleItem ? 'Remove Combo Deal' : 'Remove Item'}
                </button>
            </div>
        </div>
    )
}

export default function CartPage(){
    let [total, setTotal] = useState(0);
    const { cart } = useContext(CartContext);
    const { setProducts } = useContext(CheckoutContext);
    const { clearCart } = useCart();
    const router = useRouter();

    const checkout = () => {
        setProducts(cart);
        router.push('/checkout');
    }

    return(
        <main className="md:max-w-[80vw] mx-auto my-10 px-2 pb-28 md:pb-10">
            <section className="flex flex-col gap-y-7 md:flex-row md:justify-between">
                <section className="md:w-1/2">
                    <h3 className="text-3xl mb-3">Your Cart</h3>
                    <p className="text-sm lg:text-xs 2xl:text-sm text-black/70">Order before <span className="font-semibold text-primary">10am</span> and get it delivered <span className="font-semibold">same day</span>. Orders after 10am will be delivered the <span className="font-semibold">following day</span>.</p>
                    
                    <>
                    {
                        cart.length > 0 ?
                        <>
                        {
                            cart.map((item,i)=>(<CartItem setTotal={setTotal} key={i} product={item}/>))
                        }
                        <div className="flex justify-end">
                            <button onClick={e=>clearCart()} className="shadow-md px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-red-50 transition-colors">
                                <span className="icon-[material-symbols-light--delete-outline] w-6 h-6 text-red-500"/>
                                Clear Cart
                            </button>
                        </div>
                        </>
                        :
                        <div className="my-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-10 border border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <span className="icon-[solar--cart-large-broken] w-10 h-10 text-gray-400"/>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h4>
                            <p className="text-gray-500 text-center mb-8 max-w-[280px]">Looks like you haven't added anything to your cart yet.</p>
                            <Link 
                                href="/" 
                                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    }
                    </>
                </section>

                {cart.length > 0 && (
                    <section className="md:w-1/3">
                        
                        <h6 className="font-semibold text-lg">Payment summary</h6>
                        <div className="border-b-2 py-3">
                            <div className="flex my-3 justify-between text-sm lg:text-xs 2xl:text-sm">
                                <p className="">Items</p>
                                <p>{total} <span className="text-sm uppercase">kes</span> </p>
                            </div>
                            <div className="flex my-3 justify-between text-sm lg:text-xs 2xl:text-sm">
                                <p className="">Shipping</p>
                                <p>{'--'} <span className="text-sm uppercase">kes</span> </p>
                            </div>
                            <div className="flex my-3 justify-between text-sm lg:text-xs 2xl:text-sm font-semibold">
                                <p className="">Subtotal</p>
                                <p>{total} <span className="text-sm uppercase">kes</span> </p>
                            </div>
                            <div className="flex my-3 justify-between text-sm lg:text-xs 2xl:text-sm">
                                <p className="">Current Balance</p>
                                <p>{'0'} <span className="text-sm uppercase">kes</span> </p>
                            </div>
                        </div>
                        <div className="flex my-3 justify-between text-lg">
                            <p className="">Total</p>
                            <p className="text-primary font-bold">{total} <span className="text-sm uppercase">kes</span> </p>
                        </div>
                        <button onClick={e=>checkout()} className="bg-primary text-white block text-center w-full py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all">
                            Proceed to buy
                        </button>
                    </section>
                )}
            </section>

            <div className="mt-5">
                <Related product={1}/>
            </div>

            {/* ── Sticky mobile proceed CTA ── */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Order Total</p>
                        <p className="text-base font-bold text-primary">{total.toLocaleString()} KES</p>
                    </div>
                    <button
                        onClick={checkout}
                        className="bg-primary text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all flex-1 max-w-[220px]"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            )}
        </main>
    )
}
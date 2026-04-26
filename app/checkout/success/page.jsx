'use client'

import { useEffect, useContext } from "react";
import { CheckoutContext } from "@/app/lib/providers/CheckoutProvider";
import useCart from "@/app/lib/hooks/useCart";
import Link from "next/link";
import { gsap } from "gsap";

export default function CheckoutSuccessPage(){
    const { 
        setProducts, setOrderDetails, setContact 
    } = useContext(CheckoutContext);
    const { clearCart } = useCart();

    useEffect(() => {
        // Animate success checkmark
        gsap.fromTo('.success-check', 
            { scale: 0, opacity: 0, rotate: -180 }, 
            { scale: 1, opacity: 1, rotate: 0, duration: 0.8, ease: "back.out(1.7)", delay: 0.2 }
        );

        // Clear cart and checkout context on success
        clearCart();
        setProducts([]);
        setOrderDetails({ full_name: '', phone: '', address: '', notes: '' });
        setContact('');
    }, [clearCart, setProducts, setOrderDetails, setContact]);

    return(
        <main className="md:max-w-[80vw] mx-auto md:my-20 p-2 flex justify-center items-center min-h-[50vh]">
            <div className="text-center md:w-1/2 lg:w-1/3 space-y-6 bg-white p-8 rounded-2xl shadow-xl border-[1px] border-gray-100">
                <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center success-check">
                    <span className="icon-[mdi--check-bold] w-12 h-12 text-green-500" />
                </div>
                
                <h1 className="text-4xl font-bold text-gray-800">Order Placed!</h1>
                
                <p className="text-gray-600 text-lg">
                    We've sent an M-Pesa payment prompt to your phone. 
                    <br/><br/>
                    Please enter your PIN on your mobile device to complete the transaction.
                </p>

                <div className="pt-6">
                    <Link href="/" className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:bg-opacity-90 transition-all">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </main>
    )
}

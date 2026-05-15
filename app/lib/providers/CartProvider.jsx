'use client'
import { useState, useEffect, createContext, useMemo } from "react";
import { readRecord } from "@/app/lib/database";

export let CartContext = createContext();

export default function CartProvider({ children }) {
    let [cart, setCart] = useState([]);

    useEffect(()=>{
        readRecord('cart').then(data=>{
            setCart(data?data:[]);
        });
    },[])

    const value = useMemo(() => ({ cart, setCart }), [cart]);

    return(
        <CartContext.Provider value={value}>
        {children}
        </CartContext.Provider>
    )
}
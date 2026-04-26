'use client'
import { useState, useEffect, createContext } from "react";
import { readRecord } from "@/app/lib/database";

export let CartContext = createContext();

export default function CartProvider({ children }) {
    let [cart, setCart] = useState([]);

    useEffect(()=>{
        readRecord('cart').then(data=>{
            setCart(data?data:[]);
        });
    },[])

    return(
        <CartContext.Provider value={{
            cart, setCart
        }}>
        {children}
        </CartContext.Provider>
    )
}
import { useEffect, useContext } from "react";
import { CartContext } from "@/app/lib/providers/CartProvider";
import { postData } from "@/app/lib/data";
import {  save } from "@/app/lib/storage";
import { deleteRecord, readRecord, updateRecord, clearDatabase } from "@/app/lib/database";

export default function useCart () {
    const { cart, setCart } = useContext(CartContext);
    
    let addToCart = (quantity, product, variation = null) => {
        const cartItemId = variation ? `${product}_${variation.id}` : product;
        
        const existingItemIndex = cart.findIndex(item => {
            const itemVarId = item.variation ? `${item.product}_${item.variation.id}` : item.product;
            return itemVarId === cartItemId;
        });

        let newCart;
        if (existingItemIndex > -1) {
            newCart = [...cart];
            newCart[existingItemIndex].quantity += quantity;
        } else {
            newCart = [...cart, { product, quantity, variation }];
        }

        updateRecord('cart', newCart).then(() => {
            setCart(newCart);
        }).catch(error => {
            console.log(error);
        });
    }

    let removeFromCart = (product, variation = null) => {
        const cartItemId = variation ? `${product}_${variation.id}` : product;
        const newCart = cart.filter(item => {
            const itemVarId = item.variation ? `${item.product}_${item.variation.id}` : item.product;
            return itemVarId !== cartItemId;
        });

        updateRecord('cart', newCart).then(() => {
            setCart(newCart);
        }).catch(error => {
            console.log(error);
        });
    }

    let updateCartQuantity = (product, quantity, variation = null) => {
        const cartItemId = variation ? `${product}_${variation.id}` : product;
        const newCart = cart.map(item => {
            const itemVarId = item.variation ? `${item.product}_${item.variation.id}` : item.product;
            if (itemVarId === cartItemId) {
                return { ...item, quantity: quantity };
            }
            return item;
        });

        updateRecord('cart', newCart).then(() => {
            setCart(newCart);
        }).catch(error => {
            console.log(error);
        });
    }

    let clearCart = ()=>{
        clearDatabase().then(data=>{
            setCart([]);
        }).catch(error=>{
            console.log(error);
        });
    }

    return {
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cart
    }
}
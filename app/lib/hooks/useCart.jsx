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
            // handle error
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
            // handle error
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
            // handle error
        });
    }

    let updateBundleQuantity = (bundleIdentifier, quantity) => {
        const newCart = cart.map(item => {
            const isMatchingBundle = (item.bundle_title && item.bundle_title === bundleIdentifier) || 
                                     (item.bundle_id && item.bundle_id == bundleIdentifier);
            if (isMatchingBundle) {
                return { ...item, quantity: quantity };
            }
            return item;
        });

        updateRecord('cart', newCart).then(() => {
            setCart(newCart);
        }).catch(error => {
            console.error('Failed to update bundle quantity:', error);
        });
    }

    let swapBundleItem = (oldProductId, newProductData, bundleIdentifier) => {
        const newCart = cart.map(item => {
            const isMatchingBundle = (item.bundle_title && item.bundle_title === bundleIdentifier) || 
                                     (item.bundle_id && item.bundle_id == bundleIdentifier);
            const itemProdId = String(item.product?.id || item.product);
            const targetOldId = String(oldProductId);
            if (isMatchingBundle && itemProdId === targetOldId) {
                return {
                    ...item,
                    product: newProductData.id || newProductData.product_id,
                    variation: newProductData.variation || null,
                    override_price: newProductData.price !== undefined ? newProductData.price : item.override_price,
                };
            }
            return item;
        });

        updateRecord('cart', newCart).then(() => {
            setCart(newCart);
        }).catch(error => {
            console.error('Failed to swap bundle item:', error);
        });
    }

    let removeBundleFromCart = (bundleIdentifier) => {
        const newCart = cart.filter(item => {
            const isMatchingBundle = (item.bundle_title && item.bundle_title === bundleIdentifier) || 
                                     (item.bundle_id && item.bundle_id == bundleIdentifier);
            return !isMatchingBundle;
        });

        updateRecord('cart', newCart).then(() => {
            setCart(newCart);
        }).catch(error => {
            console.error('Failed to remove bundle from cart:', error);
        });
    }

    let clearCart = ()=>{
        clearDatabase().then(data=>{
            setCart([]);
        }).catch(error=>{
            // handle error
        });
    }

    return {
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateBundleQuantity,
        swapBundleItem,
        removeBundleFromCart,
        clearCart,
        cart
    }
}
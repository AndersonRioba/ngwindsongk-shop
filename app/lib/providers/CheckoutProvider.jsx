'use client'
import { useState } from "react";
import { createContext } from "react";

export let CheckoutContext = createContext();

export default function CheckoutProvider({ children }) {
    const [address, setAddress] = useState({});
    const [products, setProducts] = useState([]);
    
    // New Checkout Flow State
    const [orderDetails, setOrderDetails] = useState({ full_name: '', phone: '', address: '', notes: '' });
    const [pickup, setPickup] = useState(null);
    const [createAccount, setCreateAccount] = useState(false);
    const [shipping, setShipping] = useState(0);
    const [contact, setContact] = useState('');
    const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
    const [addressComponents, setAddressComponents] = useState([]);

    return(
        <CheckoutContext.Provider value={{
            address, setAddress,
            products, setProducts,
            orderDetails, setOrderDetails,
            pickup, setPickup,
            createAccount, setCreateAccount,
            shipping, setShipping,
            contact, setContact,
            coordinates, setCoordinates,
            addressComponents, setAddressComponents
        }}>
        {children}
        </CheckoutContext.Provider>
    )
}
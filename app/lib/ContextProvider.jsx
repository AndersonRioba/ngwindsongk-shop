'use client'
import { useState } from "react";
import { createContext } from "react";
import useSWR from "swr";
import Spinner from "@/app/UI/Spinner";
import CartProvider from "@/app/lib/providers/CartProvider";
import { SWRConfig } from "swr";
import { useCacheProvider } from "@piotr-cz/swr-idb-cache";
import { fetcher } from "@/app/lib/data";
import CheckoutProvider from "@/app/lib/providers/CheckoutProvider";

export let Context = createContext();

export default function ContextProvider({ children }) {
    let [isLogged, setIsLogged] = useState();
    const cacheProvider = useCacheProvider({
        dbName: 'ngwindsongk-data',
        storeName: 'swr-cache',
    });

    if(!cacheProvider) return <Spinner full={true}/>

    return(
        <Context.Provider value={{isLogged, setIsLogged}}>
            <SWRConfig value={{
                provider: cacheProvider,
                fetcher: fetcher,
            }}>
                <CheckoutProvider>
                    <CartProvider>
                        {children}
                    </CartProvider>
                </CheckoutProvider>
            </SWRConfig>
        </Context.Provider>
    )
}
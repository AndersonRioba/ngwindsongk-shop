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
        // Expire IDB cache entries after 5 minutes so stale prices don't persist
        maxAge: 5 * 60 * 1000,
    });

    if(!cacheProvider) return <Spinner full={true}/>

    return(
        <Context.Provider value={{isLogged, setIsLogged}}>
            <SWRConfig value={{
                provider: cacheProvider,
                fetcher: fetcher,
                // Always revalidate when the user returns to the tab
                revalidateOnFocus: true,
                // Revalidate any key that was served from cache (stale-while-revalidate)
                revalidateIfStale: true,
                // Allow reconnect revalidation
                revalidateOnReconnect: true,
                // Dedupe requests within a 30s window (avoids hammering the API)
                dedupingInterval: 30000,
                // If a fetch fails, wait 10s before retrying (not the default 5s chain)
                errorRetryInterval: 10000,
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
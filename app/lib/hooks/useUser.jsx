import { useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { Context } from "@/app/lib/ContextProvider";
import useSWR from "swr";
import { fetcher, postData } from "@/app/lib/data";
import { save, load, remove } from "@/app/lib/storage";

export default function useUser () {
    const router = useRouter();
    const context = useContext(Context);
    // Context only used to trigger header re-renders on login/logout
    const {setIsLogged = () => {}} = context || {};

    const token = load('token');

    const { data, error, isLoading, mutate } = useSWR(
        token ? ['/user', {}] : null,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            revalidateOnMount: false,
            shouldRetryOnError: false,
            onErrorRetry: false,
            errorRetryInterval: 100000,
        }
    )

    // Derived from SWR data — the single source of truth
    const user = data?.user || null;
    const isLoggedIn = !!user;

    // Keep context in sync (drives header re-render)
    useEffect(() => {
        if (!isLoading) {
            setIsLogged(isLoggedIn);
        }
        // Clear stale token on 401 Unauthorized
        if (error?.status === 401) {
            remove('token');
            setIsLogged(false);
        }
    }, [isLoggedIn, isLoading, error, setIsLogged])

    let logout = () => {
        remove('token');
        remove('user');
        setIsLogged(false);
        mutate(null);
        router.push('/');
        postData(() => {}, {}, '/logout');
    }

    let login = (phone, password, worker = (_) => {}) => {
        postData((response) => {
            if (response.success && response.token) {
                save('token', response.token);
                save('user', response.user);
                mutate({ user: response.user });
                setIsLogged(true);
            }
            worker(response);
        }, { phone, password }, '/login')
    }

    let signUp = (name, phone, password, confirmPassword, worker = (_) => {}) => {
        postData((response) => {
            if (response.success && response.token) {
                save('token', response.token);
                save('user', response.user);
                mutate({ user: response.user });
                setIsLogged(true);
            }
            worker(response);
        }, { name, phone, password, password_confirmation: confirmPassword }, '/signup')
    }

    let updateBalance = (amount) => {
        mutate({
            ...data,
            user: { ...data?.user, balance: (data?.user?.balance || 0) + amount }
        })
    }

    return {
        user,
        isLoggedIn,    // derived from SWR data
        isLoading,
        error,
        login,
        signUp,
        logout,
        updateBalance,
        mutate,
    }
}
'use client'
import { useState, useEffect } from "react";
import Link from "next/link"
import { usePathname} from "next/navigation";
import Logo from "@/app/UI/Logo";
import Spinner from "@/app/UI/Spinner";
import useSWR from "swr";
import { fetcher } from "@/app/lib/data";
import useAuth from "@/src/hooks/useAuth";
import useCart from "@/app/lib/hooks/useCart";
import GlobalSearch from "@/app/UI/GlobalSearch";

/** Maps a nav item's label or URL to a contextual Iconify icon class */
function getNavIcon(label = '', url = '') {
    const key = `${label} ${url}`.toLowerCase();
    if (/shop|store|product|catalog/.test(key))     return 'icon-[solar--shop-linear]';
    if (/recipe|cook|meal/.test(key))               return 'icon-[solar--chef-hat-linear]';
    if (/blog|news|article|post/.test(key))         return 'icon-[solar--document-text-linear]';
    if (/about|story|us/.test(key))                 return 'icon-[solar--info-circle-linear]';
    if (/contact|reach|support|help/.test(key))     return 'icon-[solar--phone-linear]';
    if (/sale|offer|deal|discount/.test(key))       return 'icon-[solar--tag-price-linear]';
    if (/brand/.test(key))                          return 'icon-[solar--star-linear]';
    if (/faq|question/.test(key))                   return 'icon-[solar--chat-round-dots-linear]';
    if (/home/.test(key))                           return 'icon-[solar--home-linear]';
    if (/gift|bundle/.test(key))                    return 'icon-[solar--gift-linear]';
    if (/partner|distribut|wholesale/.test(key))    return 'icon-[solar--hand-shake-linear]';
    return 'icon-[solar--square-arrow-right-linear]';
}

export function MobileTopMenu({ onOpen }){
    const { cart } = useCart();
    const cartCount = cart?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;

    return(
        <div className="block md:hidden">
            <div className="flex justify-between items-center px-4 py-5 mb-1 bg-white border-b border-gray-100 shadow-sm">
                <div className='w-24'><Logo/></div>
                <div className="flex items-center gap-3">
                    <Link href="/cart" className="relative flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm ui-pressable">
                        <span className="icon-[ri--shopping-cart-2-line] h-5 w-5"/>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    <button
                        type="button"
                        aria-label="Open menu"
                        onClick={onOpen}
                        className="ui-pressable inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm"
                    >
                        <span className="icon-[solar--hamburger-menu-outline] h-6 w-6"/>
                    </button>
                </div>
            </div>
            <div className="px-4 pb-4 bg-white border-b border-gray-100 shadow-sm">
                <GlobalSearch />
            </div>
        </div>
    )
}

export function MobileSideMenu({ isOpen, setIsOpen, fallbackNavData }){
    let pathname = usePathname();
    const { user, token, logout } = useAuth();
    const isLoggedIn = !!token;
    const { data: navData } = useSWR(['/nav-menus', {}], fetcher, {
        fallbackData: fallbackNavData,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: false,
    })

    useEffect(()=>{
        setIsOpen(false);
    },[pathname, setIsOpen])
    return(
        <>
        <div
            className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-[180ms] ease-[var(--ease-out)] md:hidden ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
        />
        <div
            id="mobile_side_menu"
            aria-hidden={!isOpen}
            className={`fixed right-0 top-0 z-50 block h-[100vh] w-[78vw] overflow-y-auto bg-gray-50 px-3 pt-4 shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-[transform,opacity] duration-[220ms] ease-[var(--ease-drawer)] md:hidden md:top-10 md:h-[80vh] md:w-[20vw] md:rounded-lg md:px-4 md:large-scroll ${isOpen ? 'pointer-events-auto translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'}`}
        >
            <button
                type="button"
                aria-label="Close menu"
                onClick={() => setIsOpen(false)}
                className="ui-pressable absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm"
            >
                <span className="icon-[material-symbols-light--close] h-6 w-6"/>
            </button>
            <div className="my-2 mb-4">
                <GlobalSearch />
            </div>
            {isLoggedIn && (
                <div className="flex items-center gap-3 px-3 mb-4 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex justify-center items-center text-primary font-bold shadow-sm text-sm">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <span className="icon-[solar--user-bold] w-5 h-5"/>}
                    </div>
                    <div>
                        <span className="font-semibold text-sm block">{user?.name?.split(' ')[0] || 'User'}</span>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{user?.role}</span>
                    </div>
                </div>
            )}
            <div className="space-y-1">
                {/* Dynamic Navigation Items */}
                {navData?.data?.map((item) => {
                    const href = item.url.startsWith('http') || item.url.startsWith('/') ? item.url : `/${item.url}`;
                    const icon = getNavIcon(item.label, item.url);
                    return (
                        <Link 
                            key={item.id}
                            href={href} 
                            className={`flex items-center py-3 rounded-xl transition-colors ${pathname === href ? 'text-primary bg-primary/5' : 'text-gray-600'}`}
                        >
                            <div className="mx-3">
                                <span className={`${icon} w-6 h-6`}/>
                            </div>
                            <span className="truncate text-xs font-bold">{item.label}</span>
                        </Link>
                    )
                })}

                {/* Conditional Orders Link */}
                {user && (
                    <Link href={'/orders'} className={`flex items-center py-3 rounded-xl transition-colors ${pathname==='/orders'?'text-primary bg-primary/5':'text-gray-600'} `}>
                        <div className="mx-3"><span className={`icon-[solar--bag-check-linear] w-6 h-6`}/></div>
                        <span className="truncate text-xs font-bold">Orders</span>
                    </Link>
                )}
            </div>
            {isLoggedIn ? (
                <div className="mt-10 flex flex-col gap-4 pb-8 items-center">
                    <button onClick={e=>logout()} className="ui-pressable inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-6 py-3 text-center font-semibold text-red-500 w-full">
                        <span className="icon-[material-symbols-light--logout] w-5 h-5"/>
                        Log Out
                    </button>
                </div>
            ) : (
                <div className="mt-10 space-y-6 pb-8">
                    <div className="flex justify-between gap-4">
                        <Link href='/login' className="ui-pressable inline-flex w-28 items-center justify-center rounded-xl bg-primary px-4 py-3 text-center font-semibold text-white shadow-sm 2xl:w-32" >Log In</Link>
                        <Link href='/register' className="ui-pressable inline-flex w-28 items-center justify-center rounded-xl border border-primary/15 bg-white px-4 py-3 text-center font-semibold text-primary 2xl:w-32">Join Us</Link>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">Partner with us</p>
                        <div className="grid grid-cols-1 gap-2">
                            <Link href="/register/distributor" className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                <span className="icon-[solar--shop-2-linear] w-5 h-5 text-primary"/>
                                <span className="text-xs font-bold text-gray-700">Become our distributor</span>
                            </Link>
                            <Link href="/register/influencer" className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                <span className="icon-[solar--stars-minimalistic-linear] w-5 h-5 text-primary"/>
                                <span className="text-xs font-bold text-gray-700">Become our influencer</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    )
}

import Search from "@/app/UI/Search";

export function TopMenu({ fallbackNavData, fallbackSettings }){
    let pathname = usePathname();
    const { user, token, logout } = useAuth();
    const isLoggedIn = !!token;
    const { data: navData } = useSWR(['/nav-menus', {}], fetcher, {
        fallbackData: fallbackNavData,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: false,
    })
    const { data: settingsData } = useSWR(['/settings', { group: 'footer' }], fetcher, {
        fallbackData: fallbackSettings,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: false,
    })
    const settings = settingsData?.data || {}
    
    return(
        <div className="hidden md:block bg-white border-b border-gray-100 z-30 sticky top-0 shadow-sm flex-col">
            <div className="py-4 2xl:py-6 px-4">
                <div className="flex justify-between items-center max-w-[1440px] mx-auto text-gray-900 h-16">
                <div className='w-32 2xl:w-40'><Logo/></div>
                
                <div className="flex gap-4 lg:gap-8 items-center">
                    {/* Dynamic Navigation Items */}
                    {navData?.data?.map((item) => {
                        const href = item.url.startsWith('http') || item.url.startsWith('/') ? item.url : `/${item.url}`;
                        return (
                            <Link 
                                key={item.id}
                                className={`${pathname === href ? 'text-primary' : 'text-gray-600'} font-bold text-sm hover:text-primary transition-colors`} 
                                href={href}
                            >
                                {item.label}
                            </Link>
                        )
                    })}

                    {/* Conditional Orders Link */}
                    {
                        user &&
                        <Link className={`${pathname==='/orders'?'text-primary':'text-gray-600'} font-bold text-sm hover:text-primary transition-colors`} href="/orders">Orders</Link>
                    }
                </div>



                <div className="flex items-center gap-6">
                    {/* Sales Contact */}
                    <div className="hidden lg:flex items-center gap-2 border-r border-gray-100 pr-6">
                        <span className="icon-[line-md--phone-call-loop] w-4 h-4 text-primary"/>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Sales & Support</span>
                            <span className="text-xs font-black text-gray-800 tracking-tight">{settings.footer_phone || '+254 718 156 421'}</span>
                        </div>
                    </div>

                    {/* Auth Status */}
                    {
                        isLoggedIn ?
                        <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
                            <div className="flex flex-col items-end gap-1 text-gray-900 cursor-pointer hover:text-primary transition-colors">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{user?.name?.split(' ')[0] || 'User'}</span>
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex justify-center items-center text-primary font-bold shadow-sm text-sm">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : <span className="icon-[solar--user-bold] w-4 h-4"/>}
                                    </div>
                                </div>
                            </div>
                            <button onClick={e=>logout()} className="ui-pressable text-red-400 hover:text-red-600 transition-colors" title="Logout">
                                <span className="icon-[material-symbols-light--logout] w-6 h-6"/>
                            </button>
                        </div>
                        :
                        <div className="flex items-center border-l border-gray-100 pl-4">
                            <Link href='/login' className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors group" title="Log In / Join Us">
                                <span className="icon-[solar--user-bold] w-6 h-6 text-gray-400 group-hover:text-primary transition-colors"/>
                                <span className="font-bold text-xs uppercase tracking-wide">Account</span>
                            </Link>
                        </div>
                    }
                </div>
                </div>
            </div>
            {/* Secondary Row for Global Search */}
            <div className="px-4 pb-4 bg-white border-t border-gray-50">
                <div className="max-w-4xl mx-auto pt-4">
                    <GlobalSearch />
                </div>
            </div>
        </div>
    )
}

export function SubMenu({ page, fallbackCategories }){
    const [expandedCategories, setExpandedCategories] = useState({});

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const { data:categories, error:categoriesError, isLoading:categoriesLoading } = useSWR(['/categories',{}], fetcher,{
        fallbackData: fallbackCategories,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: false,
        errorRetryInterval: 300000
    });

    if(categoriesLoading) return <Spinner full={true}/>
    if(categoriesError) return <div className="text-Error">Error loading categories</div>

    const subMenu = categories.reduce((acc, category) => {
        // The API returns category.brand (singular) with its products
        const brand = category.brand;
        if (brand) {
            acc[category.name] = {
                [brand.name]: {
                    slug: brand.slug || brand.name.toLowerCase().trim().replaceAll(' ', '-'),
                    products: (brand.products || []).map(product => ({
                        name: product.name,
                        slug: product.slug || product.name.toLowerCase().trim().replaceAll(' ', '-')
                    }))
                }
            };
        } else {
            acc[category.name] = {};
        }
        return acc;
    }, {});
    
    return(
        <div className="w-full md:w-64 lg:w-72 bg-white border-r border-gray-200 shadow-sm overflow-y-hidden">
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 hidden md:block">Categories</h3>
                <div className="space-y-2">
                    {
                        Object.keys(subMenu).map((category, i) => { // product categories
                            const isExpanded = expandedCategories[category];
                            return (
                                <div key={i} className='border-b border-gray-100 last:border-b-0'>
                                    <button 
                                        onClick={() => toggleCategory(category)}
                                        className="w-full flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <Link 
                                            href={`/products/${category.toLowerCase().trim().replaceAll(' ', '-')}`}
                                            className="text-sm font-medium text-gray-700 hover:text-primary flex-1 text-left"
                                        >
                                            {category}
                                        </Link>
                                        <span className={`icon-[solar--alt-arrow-down-linear] w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}/>
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="ml-4 space-y-1 pb-2">
                                            {Object.keys(subMenu[category]).map((brandName, j) => { // category brands
                                                const brandInfo = subMenu[category][brandName];
                                                const brandSlug = brandInfo.slug;
                                                return (
                                                    <div key={j} className=''>
                                                        <Link 
                                                            href={`/products/${brandSlug}`}
                                                            className="block py-2 px-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded"
                                                        >
                                                            {brandName}
                                                        </Link>
                                                        <ul className="pl-9 space-y-1 list-disc">
                                                            {brandInfo.products.map((item, k) => {
                                                                const productSlug = item.slug;
                                                                return (
                                                                    <li key={k} >
                                                                        <Link 
                                                                            href={`/products/${brandSlug}/${productSlug}`} 
                                                                            className={`block py-1 text-xs text-gray-500 hover:text-primary hover:bg-gray-50 rounded transition-colors`}
                                                                        >
                                                                            {item.name}
                                                                        </Link>
                                                                    </li>
                                                                )
                                                            })}
                                                        </ul>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default function Header({ fallbackNavData, fallbackSettings, fallbackCategories }){
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="">
            <TopMenu fallbackNavData={fallbackNavData} fallbackSettings={fallbackSettings}/>
            <MobileTopMenu onOpen={() => setIsMobileMenuOpen(true)}/>
            <MobileSideMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} fallbackNavData={fallbackNavData}/>
        </header>
    )
}

'use client'

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link";

export default function BreadCrump({ light = false }){
    let path = usePathname();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const pathList = path.replaceAll('%20', ' ').split('/').filter(Boolean);

    const getIconForPath = (name) => {
        const lower = name.toLowerCase();
        if (lower === 'products') return "icon-[solar--box-bold-duotone] text-purple-400";
        if (lower === 'checkout') return "icon-[solar--card-bold-duotone] text-amber-400";
        if (lower === 'recipes') return "icon-[solar--book-bold-duotone] text-rose-400";
        if (['nanacare', 'oats', 'grainmill', 'nutmill'].includes(lower)) return "icon-[solar--tag-bold-duotone] text-emerald-400";
        return "icon-[solar--document-bold-duotone] text-sky-400";
    }

    // Prevents hydration mismatches if router is used immediately
    if (!isMounted) return null;

    return(
        <div className={`inline-flex items-center gap-0.5 md:gap-1 px-2 py-1.5 bg-white/70 backdrop-blur-md border border-white/60 rounded-full text-gray-700 text-xs md:text-[13px] font-medium shadow-[0_4px_20px_rgba(0,0,0,0.06)] mb-5 2xl:mb-8 overflow-x-auto max-w-full no-scrollbar ${light ? 'drop-shadow-lg' : ''}`}>
            {/* Back / Forward Controls */}
            <div className="flex shrink-0 items-center gap-1.5 bg-black/5 px-2.5 py-1 rounded-full mr-1">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-black transition-colors" aria-label="Go Back">
                    <span className="icon-[heroicons--chevron-left] w-3.5 h-3.5 block" />
                </button>
                <button onClick={() => router.forward()} className="text-gray-400 hover:text-black transition-colors" aria-label="Go Forward">
                    <span className="icon-[heroicons--chevron-right] w-3.5 h-3.5 block" />
                </button>
            </div>

            {/* Home Item */}
            <span className="text-gray-300 mx-1 shrink-0 font-light">/</span>
            
            <Link href="/" className="flex shrink-0 items-center gap-2 border border-transparent px-2.5 py-1 rounded-full hover:bg-black/5 hover:border-black/5 transition-all">
                <span className="icon-[solar--home-smile-bold-duotone] w-4 h-4 text-emerald-500" />
            </Link>

            {/* Breadcrumb path */}
            {pathList.map((item, i) => {
                const href = `/${pathList.slice(0, i + 1).join('/')}`;
                const isLast = i === pathList.length - 1;
                
                return (
                    <React.Fragment key={i}>
                        <span className="text-gray-300 mx-1 shrink-0 font-light">/</span>
                        <Link 
                            href={href}
                            className={`group border border-transparent flex items-center shrink-0 gap-1.5 px-3 py-1 rounded-full hover:bg-black/5 hover:border-black/5 transition-all capitalize max-w-[120px] sm:max-w-[200px] ${isLast ? 'text-black font-semibold' : 'text-gray-600 font-normal'}`}
                        >
                            <span className={`${getIconForPath(item)} w-4 h-4 shrink-0 transition-transform group-hover:scale-110 duration-300`} />
                            <span className="truncate mt-[1px]">{item}</span>
                            {/* Mimic the dropdown chevron on active items like screenshot */}
                            {isLast && pathList.length > 1 && (
                                <span className="icon-[heroicons--chevron-down] w-3 h-3 text-gray-400 ml-0.5" />
                            )}
                        </Link>
                    </React.Fragment>
                );
            })}
            
            {/* Global styling for hiding scrollbar specifically on this element if tailwind plugin isn't installed */}
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
        </div>
    )
}
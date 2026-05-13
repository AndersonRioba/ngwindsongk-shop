'use client'
import { useState, useEffect } from "react"
import useSWR from "swr"
import { fetcher } from "@/app/lib/data"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Filter() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    
    const { data: categories, isLoading } = useSWR(['/categories', {}], fetcher, {
        revalidateOnFocus: false,
    });

    // Close drawer when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 hover:bg-gray-50 transition-all active:scale-95 group"
                aria-label="Open filters"
            >
                <span className="icon-[mage--filter] text-gray-900/70 group-hover:text-primary w-5 h-5"/>
                <span className="text-sm font-bold text-gray-700 group-hover:text-primary">Filters</span>
            </button>

            {/* Overlay */}
            <div 
                className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <div className={`fixed right-0 top-0 z-[70] h-full w-[85vw] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-xl font-black uppercase tracking-widest text-gray-900">Filters</h2>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <span className="icon-[material-symbols-light--close] w-6 h-6"/>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 large-scroll">
                        <div className="space-y-8">
                            {/* Categories Section */}
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Product Categories</h3>
                                <div className="grid gap-3">
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <div key={i} className="h-11 w-full bg-gray-50 animate-pulse rounded-xl" />
                                        ))
                                    ) : (
                                        categories?.map((cat) => (
                                            <Link 
                                                key={cat.id}
                                                href={`/products/${cat.name.toLowerCase().trim().replaceAll(' ', '-')}`}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${pathname.includes(cat.name.toLowerCase()) ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-gray-50 border-transparent text-gray-700 hover:border-gray-200'}`}
                                            >
                                                <span className="text-sm font-bold">{cat.name}</span>
                                                <span className="icon-[solar--alt-arrow-right-linear] w-4 h-4 opacity-50"/>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Brands Section */}
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Our Brands</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Grainmill', 'Nanacare', 'Nutmill'].map((brand) => (
                                        <Link 
                                            key={brand}
                                            href={`/products/${brand.toLowerCase()}`}
                                            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-primary/20 hover:bg-primary/[0.02] transition-all group"
                                        >
                                            <span className="text-xs font-bold text-gray-700 group-hover:text-primary">{brand}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                        >
                            Show Results
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
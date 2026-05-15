'use client'
import { useSearch } from "@/app/lib/providers/SearchProvider";

export default function Search() {
    const { search, setSearch } = useSearch();
    
    return (
        <div className="w-full h-11 relative group shadow-lg shadow-primary/10 rounded-2xl">
            <span className="icon-[heroicons--magnifying-glass] absolute left-4 top-1/2 -translate-y-1/2 text-primary h-5 w-5 group-focus-within:scale-110 transition-transform" />
            <input 
                type="search"
                placeholder="Find products..."
                name="search"
                id="search"
                aria-label="Search products"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-full pl-12 pr-4 py-2 bg-white border border-primary/30 rounded-2xl focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all text-sm outline-none placeholder:text-gray-400 text-gray-800"
            />
        </div>
    );
}

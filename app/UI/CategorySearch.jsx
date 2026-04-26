'use client'
import { useCategorySearch } from "@/app/lib/providers/CategorySearchProvider";

export default function CategorySearch() {
    const { categorySearch, setCategorySearch } = useCategorySearch();
    
    return (
        <div className="w-full h-full relative group shadow-sm rounded-xl">
            <span className="icon-[heroicons--magnifying-glass] absolute left-4 top-1/2 -translate-y-1/2 text-primary h-5 w-5 group-focus-within:scale-110 transition-transform" />
            <input 
                type="search"
                placeholder="Search this category..."
                name="search"
                id="search"
                value={categorySearch}
                onChange={e => setCategorySearch(e.target.value)}
                className="w-full h-full pl-12 pr-4 py-3 bg-white border border-primary rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none placeholder:text-gray-400"
            />
        </div>
    );
}

'use client'

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, Star, Search, Filter } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/app/lib/data";
import Pagination from "@/app/UI/Pagination";
import { useSearchParams, useRouter } from "next/navigation";
import { getImageUrl } from "@/app/lib/utils/image";

export default function Recipe() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const page = parseInt(searchParams.get('page')) || 1;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');

    // Build parameters for the API call
    const parameters = { page };
    if (searchTerm) parameters.search = searchTerm;
    if (selectedCategory) parameters.category = selectedCategory;
    if (selectedDifficulty) parameters.difficulty = selectedDifficulty;

    // Fetch recipes using SWR
    const { data: recipesData, error: recipesError, isLoading: recipesLoading } = useSWR(
        ['/recipes', parameters],
        fetcher,
        { revalidateOnFocus: false }
    );

    // Fetch categories using SWR
    const { data: categoriesData } = useSWR(
        ['/recipes/categories', {}],
        fetcher,
        { revalidateOnFocus: false }
    );

    const recipes = recipesData?.data?.data || recipesData?.data || [];
    const paginationMeta = recipesData?.data;
    const categories = categoriesData?.data || [];

    const formatCookingTime = (minutes) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`;
    };

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage);
        router.push(`/recipes?${params.toString()}`);
    };

    if (recipesLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (recipesError) {
        return (
            <div className="text-center py-24 luxe-reveal">
                <div className="text-primary mb-6">
                    <Search className="h-20 w-20 mx-auto opacity-20" />
                </div>
                <h3 className="text-2xl font-semibold text-black mb-2">Error loading recipes</h3>
                <p className="text-black/40">Please check your connection and try again later</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfb] text-black">
            <div className="relative">
                {/* Luxe Background Glow */}
                <div className="absolute inset-x-0 top-0 -z-10 h-[24rem] luxe-glow bg-[radial-gradient(circle_at_top_left,_rgba(109,49,237,0.08),_transparent_45%),radial-gradient(circle_at_top_right,_rgba(21,171,255,0.08),_transparent_45%),linear-gradient(to_bottom,_rgba(255,255,255,0.9),_rgba(252,252,251,1))]" />

                <main className="w-full px-4 pt-10 md:px-8 xl:max-w-[1400px] mx-auto pb-24">
                    <div className="mx-2 md:mx-6 space-y-10">
                        {/* Header Section */}
                        <div className="space-y-4 flex flex-col items-center text-center luxe-reveal luxe-delay-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-1">Culinary Collection</p>
                            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.2] text-black max-w-3xl">
                                Elevated Flavors for the <span className="italic">Modern Kitchen</span>
                            </h1>
                            <p className="text-black/40 text-sm md:text-base max-w-xl leading-relaxed font-medium">
                                Explore our curated collection of artisanal recipes.
                            </p>
                        </div>

                        {/* Filter Bar */}
                        <div className="luxe-reveal luxe-delay-2 luxe-card rounded-[2.5rem] border border-black/5 bg-white p-4 md:p-5 shadow-[0_24px_80px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row gap-4 items-center">
                            <div className="flex-1 w-full relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 h-4 w-4 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search recipes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-6 py-3.5 bg-[#f9f9f7] border-none rounded-2xl focus:ring-1 focus:ring-primary/20 transition-all text-sm outline-none placeholder:text-black/30 font-medium"
                                />
                            </div>

                            <div className="flex gap-3 w-full lg:w-auto">
                                <div className="flex-1 lg:w-48 relative">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-[#f9f9f7] border-none rounded-2xl text-xs font-medium focus:ring-1 focus:ring-primary/20 outline-none cursor-pointer hover:bg-[#f3f3f1] transition-all appearance-none text-black/70"
                                    >
                                        <option value="">All Collections</option>
                                        {categories.map((c) => (
                                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-black/30">
                                        <Filter size={12} />
                                    </div>
                                </div>

                                <div className="flex-1 lg:w-40 relative">
                                    <select
                                        value={selectedDifficulty}
                                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-[#f9f9f7] border-none rounded-2xl text-xs font-medium focus:ring-1 focus:ring-primary/20 outline-none cursor-pointer hover:bg-[#f3f3f1] transition-all appearance-none text-black/70"
                                    >
                                        <option value="">Complexity</option>
                                        <option value="easy">Beginner</option>
                                        <option value="medium">Intermediate</option>
                                        <option value="hard">Master</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-black/30">
                                        <Clock size={12} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recipe Grid */}
                        {recipes.length === 0 ? (
                            <div className="luxe-reveal luxe-delay-3 text-center py-32 space-y-6">
                                <div className="w-24 h-24 bg-black/5 rounded-full flex items-center justify-center mx-auto">
                                    <Search className="h-10 w-10 text-black/20" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-2xl font-semibold text-black">No recipes found</p>
                                    <p className="text-black/40">Try adjusting your search or filters to find what you're looking for.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                                {recipes.map((recipe, index) => (
                                    <div
                                        key={recipe.id}
                                        className={`luxe-reveal luxe-delay-${(index % 4) + 1} group`}
                                    >
                                        <div className="luxe-card bg-white rounded-[2rem] overflow-hidden border border-black/[0.03] shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_32px_80px_rgba(0,0,0,0.08)] flex flex-col h-full">
                                            {/* Image Header */}
                                            <Link href={`/recipes/${recipe.slug}`} className="relative h-64 overflow-hidden block">
                                                <Image
                                                    src={getImageUrl(recipe.image, '/recipe-placeholder.png')}
                                                    alt={recipe.title}
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                                <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                                                    <span className="bg-white/90 backdrop-blur-md text-black/80 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] shadow-sm w-fit">
                                                        {recipe.category}
                                                    </span>
                                                    {recipe.is_featured && (
                                                        <span className="bg-primary text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 shadow-lg shadow-primary/20 w-fit">
                                                            <Star size={9} fill="currentColor" />
                                                            Signature
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>

                                            {/* Content */}
                                            <div className="p-6 md:p-7 flex-1 flex flex-col">
                                                <div className="space-y-3 flex-1">
                                                    <Link href={`/recipes/${recipe.slug}`} className="block">
                                                        <h3 className="text-xl md:text-2xl font-semibold text-black group-hover:text-primary transition-colors leading-tight">
                                                            {recipe.title}
                                                        </h3>
                                                    </Link>
                                                </div>

                                                <div className="pt-6 flex items-center justify-between border-t border-black/5 mt-6">
                                                    <div className="flex gap-4">
                                                        <div className="flex items-center gap-1.5 text-black/30 text-[9px] font-bold uppercase tracking-widest">
                                                            <Clock size={11} className="text-primary/40" />
                                                            {formatCookingTime(recipe.cooking_time)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-black/30 text-[9px] font-bold uppercase tracking-widest">
                                                            <Users size={11} className="text-primary/40" />
                                                            {recipe.servings}
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/recipes/${recipe.slug}`}
                                                        className="px-5 py-2 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95"
                                                    >
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="luxe-reveal luxe-delay-4 pt-10">
                            <Pagination meta={paginationMeta} onPageChange={handlePageChange} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
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

    // Fetch banners using SWR
    const { data: bannerResponse } = useSWR(['/banners', { page: 'recipes' }], fetcher);
    const banners = bannerResponse?.data || [];
    const [activeBanner, setActiveBanner] = useState(0);

    // Fetch categories using SWR
    const { data: categoriesData } = useSWR(
        ['/recipes/categories', {}],
        fetcher,
        { revalidateOnFocus: false }
    );

    const recipes = recipesData?.data?.data || recipesData?.data || [];
    const paginationMeta = recipesData?.data;
    const categories = categoriesData?.data || [];

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

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
            <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading recipes</h3>
                <p className="text-gray-600">Please try again later</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Dynamic Banner / Header Section */}
                <div className="relative overflow-hidden w-full flex items-center group">
                    {banners.length > 0 ? (
                        <div className="relative w-full rounded-[2.5rem] bg-gray-900 overflow-hidden shadow-2xl min-h-[200px]">
                            {banners.map((banner, i) => (
                                <div
                                    key={i}
                                    className={`relative w-full transition-opacity duration-1000 ${i === activeBanner ? 'opacity-100' : 'opacity-0'} ${i === activeBanner ? '' : 'hidden'}`}
                                >
                                    <Image
                                        src={getImageUrl(banner.image, '/recipe-placeholder.png')}
                                        className="object-cover opacity-60"
                                        alt={banner.title || ''}
                                        fill
                                        priority={i === activeBanner}
                                    />
                                    <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                                        <div className="max-w-3xl animate-in slide-in-from-left duration-700">
                                            {banner.title && <h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter">{banner.title}</h2>}
                                            {banner.description && <p className="text-base md:text-lg text-gray-200 font-light max-w-2xl leading-relaxed">{banner.description}</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center space-y-3 px-4">
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-primary">
                                    CURATED RECIPES
                                </h1>
                                <div className="h-1 w-16 bg-primary mx-auto rounded-full"></div>
                                <p className="text-gray-500 text-base max-w-2xl mx-auto font-medium leading-relaxed">
                                    Elevate your culinary journey with our premium grains.
                                    Artisanal instructions for the modern kitchen.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter Section */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary h-5 w-5 group-focus-within:scale-110 transition-transform" />
                        <input
                            type="text"
                            placeholder="Search the collection..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm outline-none placeholder:text-gray-400"
                        />
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="flex-1 md:w-48 px-4 py-4 bg-white border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none cursor-pointer hover:border-gray-300"
                        >
                            <option value="">All Collections</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                            ))}
                        </select>

                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="flex-1 md:w-40 px-4 py-4 bg-white border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none cursor-pointer hover:border-gray-300"
                        >
                            <option value="">Complexity</option>
                            <option value="easy">Beginner</option>
                            <option value="medium">Intermediate</option>
                            <option value="hard">Master</option>
                        </select>
                    </div>
                </div>

                {/* Grid Section */}
                {recipes.length === 0 ? (
                    <div className="text-center py-32 space-y-4 opacity-50">
                        <span className="icon-[arcticons--reciper] w-20 h-20 mx-auto block text-gray-700" />
                        <p className="text-xl font-light italic">No culinary matches found...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {recipes.map((recipe, index) => (
                            <div
                                key={recipe.id}
                                className="group bg-white rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_80px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 flex flex-col"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Immersive Header */}
                                <Link href={`/recipes/${recipe.slug}`} className="relative h-64 overflow-hidden block">
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent z-10"></div>
                                    <Image
                                        src={getImageUrl(recipe.image, '/recipe-placeholder.png')}
                                        alt={recipe.title}
                                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                                        <span className="bg-white/90 backdrop-blur-md text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                            {recipe.category}
                                        </span>
                                        {recipe.is_featured && (
                                            <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-primary/20">
                                                <Star size={10} fill="currentColor" />
                                                Signature
                                            </span>
                                        )}
                                    </div>
                                </Link>

                                {/* Content Body */}
                                <div className="p-8 flex-1 flex flex-col space-y-6">
                                    <div className="space-y-3">
                                        <Link href={`/recipes/${recipe.slug}`} className="block w-fit">
                                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary hover:underline underline-offset-4 transition-all leading-tight lowercase capitalize">
                                                {recipe.title}
                                            </h3>
                                        </Link>
                                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 italic font-light cursor-default">
                                            &ldquo;{recipe.content}&rdquo;
                                        </p>
                                    </div>



                                    {/* Action Foot */}
                                    <div className="pt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                            <span className="icon-[solar--eye-bold] text-primary/40" />
                                            {recipe.views} Views
                                        </div>
                                        <Link
                                            href={`/recipes/${recipe.slug}`}
                                            className="px-6 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all duration-300 shadow-md active:scale-95"
                                        >
                                            View Recipe
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <Pagination meta={paginationMeta} onPageChange={handlePageChange} />
            </div>
        </div>
    );
}
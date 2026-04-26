'use client'

import { useState } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Clock, Users, Star, ArrowLeft, Share2, Bookmark, ChefHat } from "lucide-react"
import ProductListing from "@/app/UI/ProductListing"
import useSWR from "swr"
import { fetcher } from "@/app/lib/data"
import { getImageUrl } from "@/app/lib/utils/image";

export default function RecipeDetail() {
    const { recipe: slug } = useParams()
    const [activeTab, setActiveTab] = useState('ingredients')

    // Fetch recipe details using SWR
    const { data: recipeData, error, isLoading } = useSWR([`/recipes/${slug}`], fetcher, {
        revalidateOnFocus: false
    });

    const recipe = recipeData?.recipe;
    const relatedRecipes = recipeData?.related || [];

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'hard': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const formatCookingTime = (minutes) => {
        if (minutes < 60) return `${minutes} min`
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error || !recipe) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipe not found</h2>
                <p className="text-gray-600 mb-6">The recipe you're looking for doesn't exist.</p>
                <Link
                    href="/recipes"
                    className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to Recipes</span>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fcfcfb] text-black">
            {/* Hero Section */}
            <section className="w-full px-4 pt-10 md:px-8 xl:max-w-[1400px] mx-auto pb-4">
                <Link
                    href="/recipes"
                    className="group luxe-reveal luxe-delay-1 flex items-center gap-2 text-black/50 hover:text-primary text-xs font-semibold uppercase tracking-[0.25em] w-fit transition-colors mb-10"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Recipes Collection
                </Link>

                <div className="mx-2 md:mx-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6 flex flex-col luxe-reveal luxe-delay-2">
                        <div className="flex items-center gap-4">
                            <span className="bg-primary/10 text-primary px-3 py-2 rounded-full text-[10px] font-semibold uppercase tracking-[0.25em]">
                                {recipe.category}
                            </span>
                            <div className="hidden md:flex items-center gap-6 text-xs text-black/60 font-medium">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {formatCookingTime(recipe.cooking_time)}
                                </div>
                                <div className="flex items-center gap-2 px-6 border-l border-black/10">
                                    <Users className="h-4 w-4" />
                                    {recipe.servings} Servings
                                </div>
                                <div className="flex items-center gap-2 border-l border-black/10 pl-6">
                                    <Star className="h-4 w-4" />
                                    {recipe.views} Views
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-black capitalize">
                            {recipe.title}
                        </h1>
                        <p className="text-black/60 text-lg md:text-xl max-w-3xl leading-relaxed mt-4 italic">
                            {recipe.content}
                        </p>
                    </div>

                    <div className="luxe-reveal luxe-delay-3">
                        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.1)] border border-black/5 group">
                            <Image 
                                src={getImageUrl(recipe.image, '/recipe-placeholder.png')} 
                                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                                alt={recipe.title} 
                                fill
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="w-full px-4 pt-8 md:px-8 md:pt-14 xl:max-w-[1400px] mx-auto pb-24">
                <div className="mx-2 md:mx-10 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 md:gap-16">
                    {/* Left Column: Ingredients */}
                    <div className="space-y-8">
                        <div className="sticky top-32 space-y-8">
                            <div className="luxe-reveal luxe-delay-3 luxe-card rounded-[2rem] border border-black/5 bg-white p-6 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.05)]">
                                <p className="text-sm uppercase tracking-[0.3em] text-black/45 mb-6">Ingredients</p>
                                <ul className="space-y-4">
                                    {recipe.ingredients.map((ingredient, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0 opacity-40"></div>
                                            <span className="text-black/75 leading-relaxed text-base">
                                                {typeof ingredient === 'object' ? ingredient.text : ingredient}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Share/Actions */}
                            <div className="flex gap-4 luxe-reveal luxe-delay-4">
                                <button className="flex-1 bg-black hover:bg-black/90 text-white py-4 rounded-[1.75rem] font-semibold uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">
                                    <Share2 size={16} />
                                    Share Recipe
                                </button>
                                <button className="p-4 rounded-[1.75rem] border border-black/10 hover:bg-black/5 text-black transition-all">
                                    <Bookmark size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Execution & Video */}
                    <div className="space-y-12">
                        {recipe.video_url && (
                            <div className="luxe-reveal luxe-delay-3 aspect-video rounded-[2rem] overflow-hidden border border-black/5 shadow-[0_24px_80px_rgba(0,0,0,0.05)]">
                                <iframe
                                    className="w-full h-full"
                                    src={recipe.video_url.replace('watch?v=', 'embed/')}
                                    title="Recipe Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}

                        <div className="space-y-8 luxe-reveal luxe-delay-4">
                            <div className="border-b border-black/5 pb-6">
                                <p className="text-sm uppercase tracking-[0.32em] text-black/45">The Execution</p>
                                <p className="mt-2 text-3xl font-semibold uppercase tracking-tight text-black md:text-5xl">Step by step</p>
                            </div>
                            <div className="space-y-4">
                                {recipe.instructions.map((step, index) => (
                                    <div key={index} className="luxe-soft-shift rounded-[2rem] bg-[#f6f7fb] p-6 md:p-8 flex flex-col sm:flex-row gap-5 md:gap-6 border border-black/[0.02]">
                                        <div className="shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-semibold text-base text-black shadow-sm">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div className="flex-1 mt-1">
                                            <p className="text-base md:text-lg text-black/75 leading-relaxed">
                                                {typeof step === 'object' ? step.text : step}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Linked Products */}
                {recipe.products?.length > 0 && (
                    <div className="mt-24 mx-2 md:mx-10 pt-16 border-t border-black/5">
                        <div className="luxe-reveal flex items-end justify-between gap-6 pb-8">
                            <div>
                                <p className="text-sm uppercase tracking-[0.32em] text-black/45">Essentials for this recipe</p>
                            </div>
                            <Link href="/products" className="hidden sm:block text-black/60 hover:text-black font-semibold text-sm underline underline-offset-8 transition-colors">
                                Shop All Products
                            </Link>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {recipe.products.map((product, index) => (
                                <div key={product.id || index} className="h-full luxe-reveal" style={{ animationDelay: `${(index % 4) * 100}ms` }}>
                                    <ProductListing data={product} />
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 sm:hidden text-center">
                            <Link href="/products" className="text-black/60 hover:text-black font-semibold text-sm underline underline-offset-8 transition-colors">
                                Shop All Products
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
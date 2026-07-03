'use client'

import { useState } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Clock, Users, Star, ArrowLeft, Share2, Bookmark, ChefHat, Facebook, Twitter, Check, X, Link as LinkIcon } from "lucide-react"
import ProductListing from "@/app/UI/ProductListing"
import useSWR from "swr"
import { fetcher } from "@/app/lib/data"
import { getImageUrl } from "@/app/lib/utils/image";

export default function RecipeDetail() {
    const { recipe: slug } = useParams()
    const [activeTab, setActiveTab] = useState('ingredients')
    const [showShareModal, setShowShareModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    // Fetch recipe details using SWR
    const { data: recipeData, error, isLoading } = useSWR([`/recipes/${slug}`], fetcher, {
        revalidateOnFocus: false
    });

    const recipe = recipeData?.recipe;
    const relatedRecipes = recipeData?.related || [];

    const handleShare = async () => {
        setShowShareModal(true);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const handleNativeShare = async () => {
        const shareData = {
            title: recipe.title,
            text: `Check out this amazing recipe: ${recipe.title}`,
            url: window.location.href,
        };

        try {
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                handleCopyLink();
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    const [checkedIngredients, setCheckedIngredients] = useState({});
    const [completedSteps, setCompletedSteps] = useState({});

    const toggleIngredient = (index) => {
        setCheckedIngredients(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const toggleStep = (index) => {
        setCompletedSteps(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
            case 'medium': return 'bg-amber-50 text-amber-700 border-amber-100'
            case 'hard': return 'bg-rose-50 text-rose-700 border-rose-100'
            default: return 'bg-gray-50 text-gray-700 border-gray-100'
        }
    }

    const formatCookingTime = (minutes) => {
        if (minutes < 60) return `${minutes} min`
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`
    }

    const getEmbedUrl = (url) => {
        if (!url) return null;
        let videoId = '';
        if (url.includes('youtube.com/shorts/')) {
            videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('watch?v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            return url;
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
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
            <div className="text-center py-12 px-4">
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
        <div className="min-h-screen bg-[#fafaf9] text-black">
            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm luxe-reveal"
                        onClick={() => setShowShareModal(false)}
                    ></div>
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.15)] luxe-reveal luxe-delay-1">
                        <button 
                            onClick={() => setShowShareModal(false)}
                            className="absolute top-8 right-8 p-2 rounded-full hover:bg-black/5 transition-colors"
                        >
                            <X size={20} className="text-black/40" />
                        </button>
                        
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Share Recipe</p>
                                <h2 className="text-3xl font-semibold tracking-tight text-black capitalize">
                                    Spread the flavor
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em]">Share via link</p>
                                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-[#f9f9f7] rounded-2xl border border-black/5">
                                    <a 
                                        href={typeof window !== 'undefined' ? window.location.href : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 px-4 py-2 text-xs text-primary hover:underline font-medium truncate"
                                    >
                                        {typeof window !== 'undefined' ? window.location.href : ''}
                                    </a>
                                    <button 
                                        onClick={handleCopyLink}
                                        className={`px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                                            copySuccess ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
                                        }`}
                                    >
                                        {copySuccess ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Check size={12} />
                                                Copied
                                            </span>
                                        ) : (
                                            'Copy Link'
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4 border-t border-black/5">
                                <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em]">Social Networks</p>
                                <div className="grid grid-cols-3 gap-4">
                                    <a 
                                        href={`https://api.whatsapp.com/send?text=Check out this amazing recipe: ${recipe.title} - ${typeof window !== 'undefined' ? window.location.href : ''}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-3 group"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-all duration-300">
                                            <span className="icon-[tabler--brand-whatsapp] w-6 h-6" />
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">WhatsApp</span>
                                    </a>
                                    <a 
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? window.location.href : ''}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-3 group"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-all duration-300">
                                            <Facebook size={24} />
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">Facebook</span>
                                    </a>
                                    <a 
                                        href={`https://twitter.com/intent/tweet?text=Check out this amazing recipe: ${recipe.title}&url=${typeof window !== 'undefined' ? window.location.href : ''}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-3 group"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-black/5 text-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                                            <Twitter size={24} />
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">Twitter</span>
                                    </a>
                                </div>
                            </div>

                            {navigator.share && (
                                <button 
                                    onClick={handleNativeShare}
                                    className="w-full py-4 rounded-2xl bg-[#f9f9f7] hover:bg-black/5 text-black/60 font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <Share2 size={14} />
                                    More sharing options
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="w-full px-4 pt-8 md:px-8 xl:max-w-[1400px] mx-auto pb-4">
                <Link
                    href="/recipes"
                    className="group luxe-reveal luxe-delay-1 flex items-center gap-2 text-black/50 hover:text-primary text-[10px] font-bold uppercase tracking-[0.3em] w-fit transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Recipes
                </Link>

                <div className="mx-2 lg:mx-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-7 space-y-6 flex flex-col luxe-reveal luxe-delay-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.25em]">
                                {recipe.category}
                            </span>
                            {recipe.difficulty && (
                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.25em] border ${getDifficultyColor(recipe.difficulty)}`}>
                                    {recipe.difficulty}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.15] text-black capitalize">
                            {recipe.title}
                        </h1>
                        <p className="text-black/60 text-base md:text-lg max-w-3xl leading-relaxed mt-2 italic">
                            {recipe.content}
                        </p>

                        {/* Mobile and Desktop Meta-Stats */}
                        <div className="grid grid-cols-3 gap-3 pt-4 max-w-lg">
                            <div className="bg-white border border-black/5 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                                <Clock className="h-5 w-5 text-primary mb-1 shrink-0" />
                                <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Time</span>
                                <span className="text-xs font-semibold mt-0.5 text-black">{formatCookingTime(recipe.cooking_time)}</span>
                            </div>
                            <div className="bg-white border border-black/5 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                                <Users className="h-5 w-5 text-primary mb-1 shrink-0" />
                                <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Servings</span>
                                <span className="text-xs font-semibold mt-0.5 text-black">{recipe.servings} Servings</span>
                            </div>
                            <div className="bg-white border border-black/5 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                                <Star className="h-5 w-5 text-primary mb-1 shrink-0" />
                                <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Views</span>
                                <span className="text-xs font-semibold mt-0.5 text-black">{recipe.views} Views</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 luxe-reveal luxe-delay-3">
                        <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.08)] border border-black/5 group">
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

            <main className="w-full px-4 pt-6 md:px-8 md:pt-10 xl:max-w-[1400px] mx-auto pb-24">
                <div className="mx-2 lg:mx-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                    {/* Left Column: Ingredients */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="lg:sticky lg:top-28 space-y-6">
                            <div className="luxe-reveal luxe-delay-3 luxe-card rounded-[2rem] border border-black/5 bg-white p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5">
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/45">Ingredients</p>
                                    <span className="text-[10px] bg-black/5 text-black/60 px-2.5 py-1 rounded-full font-semibold">
                                        {recipe.ingredients.length} items
                                    </span>
                                </div>
                                <ul className="space-y-3.5">
                                    {recipe.ingredients.map((ingredient, index) => {
                                        const text = typeof ingredient === 'object' ? ingredient.text : ingredient;
                                        const isChecked = !!checkedIngredients[index];
                                        return (
                                            <li 
                                                key={index} 
                                                onClick={() => toggleIngredient(index)}
                                                className="flex items-start gap-3 cursor-pointer group select-none"
                                            >
                                                <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                                                    isChecked ? 'bg-primary border-primary text-white' : 'bg-white border-black/15 group-hover:border-primary/50'
                                                }`}>
                                                    {isChecked && <Check size={12} className="stroke-[3]" />}
                                                </div>
                                                <span className={`text-sm leading-relaxed transition-all ${
                                                    isChecked ? 'text-black/35 line-through decoration-black/25' : 'text-black/75 group-hover:text-black'
                                                }`}>
                                                    {text}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            {/* Share/Actions */}
                            <div className="flex gap-3 luxe-reveal luxe-delay-4">
                                <button 
                                    onClick={handleShare}
                                    className="flex-1 bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-semibold uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-[0_12px_30px_rgba(109,49,237,0.15)] hover:-translate-y-0.5"
                                >
                                    <Share2 size={14} />
                                    Share Recipe
                                </button>
                                <button className="p-4 rounded-2xl border border-black/10 hover:bg-black/5 text-black transition-all">
                                    <Bookmark size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Execution & Video */}
                    <div className="lg:col-span-8 space-y-10">
                        {recipe.video_url && (
                            <div className="luxe-reveal luxe-delay-3 aspect-video rounded-[2rem] overflow-hidden border border-black/5 shadow-[0_24px_50px_rgba(0,0,0,0.04)] bg-black">
                                <iframe
                                    className="w-full h-full"
                                    src={getEmbedUrl(recipe.video_url)}
                                    title="Recipe Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}

                        <div className="space-y-8 luxe-reveal luxe-delay-4">
                            <div className="border-b border-black/5 pb-5">
                                <p className="text-xs font-bold uppercase tracking-[0.32em] text-black/45">The Execution</p>
                                <h2 className="mt-1 text-2xl font-semibold uppercase tracking-tight text-black md:text-3xl">Step by step</h2>
                            </div>
                            <div className="space-y-4">
                                {recipe.instructions.map((step, index) => {
                                    const text = typeof step === 'object' ? step.text : step;
                                    const isCompleted = !!completedSteps[index];
                                    return (
                                        <div 
                                            key={index} 
                                            onClick={() => toggleStep(index)}
                                            className={`luxe-soft-shift rounded-[1.75rem] p-5 md:p-6 flex gap-4 border transition-all cursor-pointer select-none ${
                                                isCompleted 
                                                    ? 'bg-black/[0.01] border-black/5 opacity-55' 
                                                    : 'bg-white border-black/5 hover:border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.01)]'
                                            }`}
                                        >
                                            <div className="shrink-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                                                    isCompleted 
                                                        ? 'bg-green-500 text-white' 
                                                        : 'bg-gray-50 text-black border border-black/5'
                                                }`}>
                                                    {isCompleted ? <Check size={12} className="stroke-[3]" /> : index + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1 mt-0.5">
                                                <p className={`text-sm md:text-base leading-relaxed transition-all ${
                                                    isCompleted ? 'text-black/45 line-through decoration-black/25' : 'text-black/75'
                                                }`}>
                                                    {text}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Linked Products */}
                {recipe.products?.length > 0 && (
                    <div className="mt-20 mx-2 lg:mx-6 pt-12 border-t border-black/5">
                        <div className="luxe-reveal flex items-end justify-between gap-6 pb-6">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.32em] text-black/45">Essentials for this recipe</p>
                            </div>
                            <Link href="/products" className="hidden sm:block text-black/60 hover:text-black font-semibold text-xs underline underline-offset-6 transition-colors">
                                Shop All Products
                            </Link>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {recipe.products.map((product, index) => (
                                <div key={product.id || index} className="h-full luxe-reveal" style={{ animationDelay: `${(index % 4) * 100}ms` }}>
                                    <ProductListing data={product} />
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 sm:hidden text-center">
                            <Link href="/products" className="text-black/60 hover:text-black font-semibold text-xs underline underline-offset-6 transition-colors">
                                Shop All Products
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
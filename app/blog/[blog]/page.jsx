'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { getData, postData } from "@/app/lib/data"
import Link from "next/link"
import { getImageUrl } from "@/app/lib/utils/image";
import useUser from "@/app/lib/hooks/useUser"

export default function BlogDetail() {
    const { blog: slug } = useParams();
    const { user, isLoggedIn } = useUser();
    const [blogData, setBlogData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (slug) {
            getData((data) => {
                setBlogData(data);
                setIsLoading(false);
            }, `/blogs/${slug}`, {});
        }
    }, [slug]);

    const blog = blogData?.blog || null;

    const extractYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        if (!isLoggedIn && !name.trim()) return;

        setIsSubmitting(true);
        postData((result) => {
            if (result.success) {
                setComment("");
                setName("");
                setSuccessMessage("Thank you! Your comment has been submitted and is awaiting approval.");
                setTimeout(() => setSuccessMessage(""), 8000);
                
                // Refresh blog data just in case, though comments are pending
                getData((data) => setBlogData(data), `/blogs/${slug}`, {});
            }
            setIsSubmitting(false);
        }, { 
            comment, 
            name: isLoggedIn ? user.name : name 
        }, `/blogs/${blog.id}/comments`);
    };

    if (isLoading) {
        return (
            <main className='mx-2 md:mx-auto md:w-8/12 md:mt-10 flex items-center justify-center min-h-[400px]'>
                <span className="icon-[tabler--loader-2] animate-spin w-10 h-10 text-primary" />
            </main>
        );
    }

    if (!blog) {
        return (
            <main className='mx-2 md:mx-auto md:w-8/12 md:mt-20 text-center py-20'>
                <span className="icon-[material-symbols--error-outline] w-20 h-20 text-red-100 mb-4 block mx-auto" />
                <h2 className="text-2xl font-bold text-gray-800">Blog post not found.</h2>
                <Link href="/blog" className="text-primary hover:underline mt-4 inline-block font-bold">Back to blog listing</Link>
            </main>
        );
    }

    const videoId = extractYoutubeId(blog.youtube_url);

    return (
        <main className='mx-2 md:mx-auto md:w-9/12 lg:w-7/12 md:mt-10 pb-20'>
            {/* Header */}
            <header className="mb-10 animate-in slide-in-from-top duration-700">
                <Link href="/blog" className="text-sm text-gray-400 hover:text-primary transition-colors flex items-center gap-1 mb-6 font-bold">
                    <span className="icon-[ep--left] w-4 h-4"/>
                    Back to Blog
                </Link>
                <h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6'>{blog.title}</h1>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20">
                            <span className="icon-[solar--user-bold] w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">Administrator</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(blog.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="h-8 w-[1px] bg-gray-100"></div>
                    <div className="flex gap-2">
                        <span className='text-[10px] font-bold border-[1px] py-1 px-3 rounded-full bg-gray-50 text-gray-500 border-gray-100 uppercase tracking-widest'>{blog.comments?.length || 0} Comments</span>
                        <span className='text-[10px] font-bold border-[1px] py-1 px-3 rounded-full bg-primary/5 text-primary border-primary/20 uppercase tracking-widest'>Article</span>
                    </div>
                </div>
            </header>

            {/* Featured Image */}
            <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-700">
                <div className="relative w-full h-[300px] md:h-[500px]">
                    <Image 
                        className='object-cover' 
                        src={getImageUrl(blog.featured_image, '/recipe-placeholder.png')} 
                        alt={blog.title} 
                        fill
                        priority
                    />
                </div>
            </div>

            {/* Content Container */}
            <div className="flex flex-col gap-12">
                {/* Main Article Body */}
                <article className="prose prose-lg max-w-none prose-p:text-gray-600 prose-headings:text-gray-900 prose-p:leading-relaxed prose-a:text-primary">
                    <div 
                        className="blog-content" 
                        dangerouslySetInnerHTML={{ __html: blog.content }} 
                    />
                </article>

                {/* Video Integration */}
                {videoId && (
                    <section className="bg-gray-900 p-4 md:p-8 rounded-3xl shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="icon-[mdi--youtube] text-red-500 w-8 h-8" />
                            Watch Video Tutorial
                        </h3>
                        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-gray-800">
                            <iframe 
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </section>
                )}

                {/* Related Brands & Products (Interlinking) */}
                {(blog.brands?.length > 0 || blog.products?.length > 0) && (
                    <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20">
                        <h3 className="text-2xl font-black text-gray-800 mb-8 border-b-2 border-gray-50 pb-4 tracking-tight flex items-center gap-3">
                            <span className="icon-[solar--tag-bold-duotone] text-primary w-8 h-8" />
                            Mentioned in this Article
                        </h3>
                        
                        <div className="space-y-8">
                            {blog.brands?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Official Brands</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {blog.brands.map(brand => (
                                            <Link 
                                                key={brand.id} 
                                                href={`/blog?brand_id=${brand.id}`} 
                                                className="px-6 py-2 bg-gray-50 text-gray-700 font-bold rounded-full text-sm hover:bg-primary hover:text-white transition-all border border-gray-100"
                                            >
                                                {brand.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {blog.products?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Featured Products</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {blog.products.map(product => (
                                            <Link 
                                                key={product.id} 
                                                href={`/product/${product.slug || product.id}`} 
                                                className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:border-secondary hover:shadow-lg transition-all group"
                                            >
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-secondary/30">
                                                    {product.name[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800 group-hover:text-secondary transition-colors line-clamp-1">{product.name}</span>
                                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Shop &rarr;</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Related Recipes */}
                {blog.recipes?.length > 0 && (
                    <section className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10">
                        <h3 className="text-2xl font-black text-gray-800 mb-8 border-b-2 border-primary/20 pb-4 tracking-tight flex items-center gap-3">
                            <span className="icon-[arcticons--reciper] text-primary w-8 h-8" />
                            Cook These Recipes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blog.recipes.map(recipe => (
                                <Link href={`/recipe/${recipe.slug}`} key={recipe.id} className="flex gap-4 p-4 bg-white rounded-[2rem] border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all group">
                                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner">
                                        <Image 
                                            src={getImageUrl(recipe.image, '/recipe-placeholder.png')} 
                                            className="object-cover group-hover:scale-110 transition-transform duration-500" 
                                            alt={recipe.title}
                                            fill
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h4 className="font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 leading-tight">{recipe.title}</h4>
                                        <p className="text-[10px] font-black text-primary mt-3 uppercase tracking-widest flex items-center gap-2 bg-primary/5 w-fit px-3 py-1 rounded-full">
                                            View Recipe <span className="icon-[solar--arrow-right-bold] w-3 h-3"/>
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Comments Section */}
                <section id="comments" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-2xl font-bold text-gray-800 mb-10 border-b border-gray-50 pb-4">
                        Conversations ({blog.comments?.length || 0})
                    </h3>

                    {/* Comment Form */}
                    {blog.allow_comments ? (
                        <div className="mb-12 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-widest">Share your thoughts</h4>
                            
                            {successMessage && (
                                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 text-sm font-medium animate-in fade-in zoom-in duration-300">
                                    {successMessage}
                                </div>
                            )}

                            <form onSubmit={handleCommentSubmit} className="space-y-4">
                                {!isLoggedIn && (
                                    <div>
                                        <input 
                                            type="text"
                                            className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            placeholder="Your Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required={!isLoggedIn}
                                        />
                                    </div>
                                )}
                                <textarea 
                                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[120px]"
                                    placeholder="Write a respectful comment..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                />
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <button 
                                        disabled={isSubmitting}
                                        className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <span className="icon-[tabler--loader-2] animate-spin w-5 h-5" />
                                        ) : (
                                            <span className="icon-[solar--paper-plane-bold] w-5 h-5" />
                                        )}
                                        Post Comment
                                    </button>
                                    <p className="text-[10px] text-gray-400 font-bold italic">
                                        Note: All comments are held for moderation by our team before being published.
                                    </p>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="mb-12 text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-sm text-gray-400 font-bold italic">Comments are disabled for this article.</p>
                        </div>
                    )}

                    {/* Comment List */}
                    <div className="space-y-8">
                        {blog.comments && blog.comments.length > 0 ? (
                            blog.comments.map(c => (
                                <div key={c.id} className="flex gap-4 group animate-in fade-in slide-in-from-left duration-500">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20 transition-all shadow-sm">
                                        <span className="icon-[solar--user-linear] w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-bold text-gray-800">{c.user?.name || c.guest_name || "Guest"}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="text-[10px] text-gray-400 font-bold">{new Date(c.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-50 group-hover:border-gray-100 transition-all">
                                            {c.comment}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-40">
                                <span className="icon-[mdi--comment-multiple-outline] w-12 h-12 mb-2 block mx-auto" />
                                <p className="text-xs font-bold uppercase tracking-widest">No comments yet. Be the first to start the conversation!</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}
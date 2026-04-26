'use client'

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { getData } from "@/app/lib/data"
import { useSearchParams, useRouter } from "next/navigation"
import Pagination from "@/app/UI/Pagination"
import { getImageUrl } from "@/app/lib/utils/image"

export default function Blogs() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [blogsData, setBlogsData] = useState(null);
    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const currentBrand = searchParams.get('brand_id');
    const currentProduct = searchParams.get('product_id');
    const page = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        // Fetch Brands and Products for filtering
        getData((data) => {
            setBrands(Array.isArray(data) ? data : data?.data || []);
        }, '/brands', {});
        
        getData((data) => {
            // Product index is paginated, so items are in data.data
            setProducts(data?.data || data || []);
        }, '/products', {});
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const params = { page };
        if (currentBrand) params.brand_id = currentBrand;
        if (currentProduct) params.product_id = currentProduct;

        getData((data) => {
            setBlogsData(data);
            setIsLoading(false);
        }, '/blogs', params);

        // Safety timeout to prevent infinite loading if API fails to respond
        const timer = setTimeout(() => setIsLoading(false), 5000);
        return () => clearTimeout(timer);
    }, [currentBrand, currentProduct, page]);

    const blogs = blogsData?.data?.data || blogsData?.data || [];
    const paginationMeta = blogsData?.data;
    const featuredBlog = blogs[0];
    const otherBlogs = blogs.slice(1);

    const toggleFilter = (type, id) => {
        const params = new URLSearchParams(searchParams.toString());
        if (params.get(type) === String(id)) {
            params.delete(type);
        } else {
            params.set(type, id);
        }
        params.delete('page'); // Reset to first page on filter change
        router.push(`/blog?${params.toString()}`);
    };

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage);
        router.push(`/blog?${params.toString()}`);
    };

    return (
        <main className='mx-2 md:mx-auto md:w-10/12 md:mt-12 mb-20'>
            {/* Header / Intro */}
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 tracking-tight">Grainmill & Nanacare Blog</h1>
                <p className="text-lg text-gray-500 max-w-2xl font-medium">Stories of healthy living, parenting tips, and nourishing recipes from our community.</p>
            </div>

            {/* Filters */}
            <div className="mb-12 space-y-6">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Filter by Brand</h3>
                    <div className="flex flex-wrap gap-3">
                        {brands.map(brand => (
                            <button 
                                key={brand.id}
                                onClick={() => toggleFilter('brand_id', brand.id)}
                                className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                                    currentBrand === String(brand.id) 
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-primary/30 hover:text-primary'
                                }`}
                            >
                                {brand.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Focus on Product</h3>
                    <div className="flex flex-wrap gap-3">
                        {products.map(product => (
                            <button 
                                key={product.id}
                                onClick={() => toggleFilter('product_id', product.id)}
                                className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                                    currentProduct === String(product.id) 
                                    ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20' 
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-secondary/30 hover:text-secondary'
                                }`}
                            >
                                {product.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <span className="icon-[tabler--loader-2] animate-spin w-10 h-10 text-primary" />
                </div>
            ) : (
                <>
                    {featuredBlog ? (
                        <section className='flex flex-col-reverse md:flex-row justify-between md:mb-16 gap-8'>
                            <div className='md:w-1/2 flex flex-col justify-center'>
                                <div className="flex mb-6 gap-3">
                                    <span className='text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full bg-primary/10 text-primary'>Featured Article</span>
                                    <span className='text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full bg-gray-100 text-gray-500'>{new Date(featuredBlog.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <h2 className='text-3xl md:text-5xl font-black text-gray-800 mb-6 leading-[1.1]'>{featuredBlog.title}</h2>
                                <p className='text-gray-500 mb-10 text-lg leading-relaxed font-medium line-clamp-3'>{featuredBlog.excerpt || (featuredBlog.content ? featuredBlog.content.substring(0, 200).replace(/<[^>]*>?/gm, '') + '...' : '')}</p>
                                <Link
                                    href={`/blog/${featuredBlog.slug}`}
                                    className='flex items-center justify-center text-primary border-2 border-primary py-4 rounded-2xl gap-2 w-56 hover:bg-primary hover:text-white transition-all font-bold shadow-lg shadow-primary/10'
                                >
                                    Read Full Story
                                    <span className='icon-[solar--arrow-right-line-duotone] w-6 h-6'/>
                                </Link>
                            </div>
                            <div className="md:w-1/2 relative aspect-[4/3] md:aspect-square">
                                <Image 
                                    className='object-cover rounded-[2.5rem] shadow-2xl relative z-10' 
                                    src={getImageUrl(featuredBlog.featured_image)} 
                                    alt={featuredBlog.title} 
                                    fill
                                    priority
                                />
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
                                <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                            </div>
                        </section>
                    ) : (
                        <section className="text-center py-32 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                            <span className="icon-[solar--document-add-bold-duotone] w-24 h-24 text-gray-200 mb-6 block mx-auto" />
                            <h2 className="text-2xl font-bold text-gray-400">No matching articles found.</h2>
                            <button onClick={() => router.push('/blog')} className="mt-4 text-primary font-bold hover:underline">Clear all filters</button>
                        </section>
                    )}

                    {otherBlogs.length > 0 && (
                        <section className='mt-20'>
                            <div className="flex justify-between items-center mb-12">
                                <h2 className='text-3xl font-black text-gray-800 tracking-tight'>Latest Articles</h2>
                                <div className="h-0.5 flex-1 bg-gray-100 ml-8" />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
                                {otherBlogs.map((blog) => (
                                    <Link href={`/blog/${blog.slug}`} key={blog.id} className='flex flex-col group'>
                                        <div className="overflow-hidden rounded-3xl aspect-[16/10] mb-6 shadow-xl relative">
                                            <Image 
                                                className='object-cover group-hover:scale-110 transition-transform duration-700' 
                                                src={getImageUrl(blog.featured_image)} 
                                                alt={blog.title} 
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                            {blog.brands?.length > 0 && (
                                                <div className="absolute top-4 left-4 flex gap-1">
                                                    {blog.brands.map(b => (
                                                        <span key={b.id} className="bg-white/90 backdrop-blur-sm text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full text-gray-800">{b.name}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{blog.comments_count || 0} Comments</span>
                                        </div>
                                        <h4 className='text-xl font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-4'>{blog.title}</h4>
                                        <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">{blog.excerpt}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Pagination */}
                    <Pagination meta={paginationMeta} onPageChange={handlePageChange} />
                </>
            )}
        </main>
    )
}
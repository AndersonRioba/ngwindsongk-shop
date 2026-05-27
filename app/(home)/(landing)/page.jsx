import Link from "next/link"
import Image from "next/image"
import BreadCrump from "@/app/UI/BreadCrump"
import ProductListing, { ProductListingSkeleton } from "@/app/UI/ProductListing"
import Overlay from "@/app/UI/Overlay";
import Carousel from "@/app/UI/Hero"
import RunningBanner from "@/app/UI/RunningBanner";

import dynamic from "next/dynamic";
import { getImageUrl } from "@/app/lib/utils/image";

import BrandCarouselSection from "@/app/UI/BrandCarouselSection";
import TestimonialsSection from "@/app/UI/TestimonialsSection";
import OffersSection from "@/app/UI/OffersSection";

function getFeaturedProducts(products) {
    return products
        .filter((product) => {
            const stock = product?.stock ?? product?.product_variations?.[0]?.stock ?? 0;
            return Boolean(product?.name && stock > 0);
        })
        .sort((a, b) => {
            const aPriority = Number(Boolean(a?.message || a?.previous));
            const bPriority = Number(Boolean(b?.message || b?.previous));
            return bPriority - aPriority;
        })
        .slice(0, 5);
}

function getProductImage(product) {
    return product?.product_images?.find((image) => image?.is_primary)?.url
        || product?.product_images?.[0]?.url
        || "";
}

function getProductHref(product) {
    const catSlug = product?.brand?.slug || product?.category?.slug || (product?.brand?.name || product?.category?.name || "Products").toLowerCase().trim().replaceAll(' ', '-');
    const prodSlug = product?.slug || (product?.name || "").toLowerCase().trim().replaceAll(' ', '-');
    return `/products/${catSlug}/${prodSlug}`;
}

function getProductPrice(product) {
    const variationPrice = product?.product_variations?.[0]?.price;
    return variationPrice ?? product?.price ?? 0;
}

async function getLandingData() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    try {
        const [productsRes, offersRes, brandsRes] = await Promise.all([
            fetch(`${baseURL}/products?per_page=24`, { next: { revalidate: 60 } }),
            fetch(`${baseURL}/products?offers=true&per_page=20`, { next: { revalidate: 60 } }),
            fetch(`${baseURL}/brands`, { next: { revalidate: 60 } })
        ]);

        const productsData = productsRes.ok ? await productsRes.json() : null;
        const offersData = offersRes.ok ? await offersRes.json() : null;
        const brandsData = brandsRes.ok ? await brandsRes.json() : null;

        return {
            products: productsData,
            offers: offersData,
            brands: brandsData
        };
    } catch (error) {
        console.error("Failed to fetch landing data:", error);
        return { products: null, offers: null, brands: null };
    }
}

export default async function Home() {
    const { products, offers: offersData, brands: brandsData } = await getLandingData();

    const productsList = Array.isArray(products) ? products : (products?.data || []);
    const offerProductsList = Array.isArray(offersData) ? offersData : (offersData?.data || []);
    const brandsList = (Array.isArray(brandsData) ? brandsData : brandsData?.data || [])
        .filter(b => b.is_active)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const getBrandDisplayName = (name) => {
        const mapping = {
            'grainmill': 'OATS',
            'nanacare': 'BABY CARE',
            'nutmill': 'NUTMILL',
            'oats': 'OATS',
            'baby care': 'BABY CARE'
        };
        return mapping[name.toLowerCase().trim()] || name;
    };

    const getBrandSlug = (brand) => {
        if (brand.slug) return brand.slug;
        const n = brand.name.toLowerCase().trim();
        if (n === 'baby care' || n === 'nanacare') return 'nanacare';
        if (n === 'oats' || n === 'grainmill') return 'grainmill';
        return n.replaceAll(' ', '-');
    };

    const featuredProducts = getFeaturedProducts(productsList);
    const heroProduct = featuredProducts[0];
    const spotlightProducts = featuredProducts.slice(1, 5);
    
    // API now handles search filtering directly
    const filteredProducts = productsList;
    const masonryBreakpoints = {
        default: 4,
        768: 3,
        640: 1
    };

    // Structured data for products
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "ngwindsongk Products",
        "description": "Premium healthy oats and Nanacare products",
        "url": "https://ngwindsongk.com",
        "numberOfItems": filteredProducts.length || 0,
        "itemListElement": filteredProducts.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Product",
                "name": product.name,
                "description": product.description,
                "image": product.image,
                "url": `https://ngwindsongk.com/products/${product.slug}`,
                "brand": {
                    "@type": "Brand",
                    "name": "ngwindsongk"
                },
                "category": product.category,
                "offers": {
                    "@type": "Offer",
                    "price": product.price,
                    "priceCurrency": "KES",
                    "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                }
            }
        }))
    };

    return (
        <>
            <div className="w-full">
                {/* Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData)
                    }}
                />

                <RunningBanner />

                <section className="pt-6">
                        <div className="flex flex-row justify-evenly md:justify-center md:gap-16 w-full max-w-4xl mx-auto px-2 py-4">
                            {brandsList.map((brand) => (
                                <Link
                                    key={brand.id}
                                    href={`/products/${getBrandSlug(brand)}`}
                                    className="flex-none flex flex-col items-center gap-1 group"
                                >
                                    <div 
                                        className="w-20 h-20 md:w-32 md:h-32 rounded-full border-[2px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 group-hover:scale-105 flex items-center justify-center overflow-hidden"
                                        style={{ 
                                            borderColor: brand.color_hex || '#e5e7eb',
                                            boxShadow: `0 4px 20px rgba(0,0,0,0.05)`
                                        }}
                                    >
                                        <div className="w-full h-full p-1 flex items-center justify-center relative">
                                            <Image
                                                src={getImageUrl(brand.logo)}
                                                alt={brand.name}
                                                fill
                                                sizes="(max-width: 768px) 80px, 128px"
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs md:text-xs font-bold text-black/80 tracking-wide group-hover:text-black transition-colors uppercase">
                                        {getBrandDisplayName(brand.name)}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>

                <div className="mt-4 md:mt-6">
                    <Carousel />
                </div>

                <section className="relative">
                    <div className="absolute inset-x-0 top-0 -z-10 h-[30rem] luxe-glow bg-[radial-gradient(circle_at_top_left,_rgba(24,119,242,0.14),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.14),_transparent_32%),linear-gradient(to_bottom,_rgba(255,255,255,0.9),_rgba(252,252,251,1))]" />

                    {/* Offers Band hidden as requested */}
                    {/* {!hasActiveSearch && <OffersSection products={offerProductsList} />} */}

                    {/* ── Brand Carousel Sections ── */}
                    <div className="flex flex-col gap-0">
                            {brandsList.map((brand) => {
                                const slug = getBrandSlug(brand);
                                // Pre-filter the server-fetched products for this brand so no client fetch is needed
                                const brandProducts = productsList.filter(p =>
                                    p?.brand?.slug === slug ||
                                    p?.brand?.name?.toLowerCase() === brand.name.toLowerCase()
                                ).slice(0, 15);

                                return (
                                    <BrandCarouselSection
                                        key={brand.id}
                                        title={getBrandDisplayName(brand.name)}
                                        subtitle={brand.description || `Explore the ${brand.name} collection`}
                                        barColor={""}
                                        customStyle={{ backgroundColor: brand.color_hex }}
                                        seeAllHref={`/products/${slug}`}
                                        fetchSlug={slug}
                                        categories={[brand.name.toLowerCase()].concat(brand.categories?.map(c => c.name.toLowerCase()) || [])}
                                        logoSrc={brand.logo}
                                        fallbackData={brandProducts.length > 0 ? brandProducts : null}
                                    />
                                );
                            })}
                        </div>

                        <>
                            <div className="mt-16 md:mt-24" />
                            <TestimonialsSection />

                            {/* Featured products — hidden for now */}
                            {false && heroProduct &&
                                <section className="px-4 pt-8 md:px-8 md:pt-12">
                                    <div className="mx-2 md:mx-10">
                                        <div className="luxe-reveal luxe-delay-2 flex items-end justify-between gap-6 border-b border-black/10 pb-6">
                                            <div>
                                                <p className="text-sm uppercase tracking-[0.32em] text-black/45">Featured products</p>
                                                <p className="mt-3 text-3xl font-semibold uppercase tracking-tight text-black md:text-5xl">Start with what shoppers love</p>
                                                <p className="mt-4 max-w-2xl text-base leading-7 text-black/65">
                                                    A handpicked mix from our pantry and baby-care collections, designed to help first-time visitors discover the best of the store fast.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-10 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                                            <Link
                                                href={getProductHref(heroProduct)}
                                                className="group luxe-reveal luxe-delay-3 luxe-card relative min-h-[32rem] overflow-hidden rounded-[2rem] bg-black"
                                            >
                                                <Image
                                                    className="object-cover transition duration-700 group-hover:scale-105"
                                                    src={getImageUrl(getProductImage(heroProduct), "/product-placeholder.png")}
                                                    alt={heroProduct.name}
                                                    fill
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
                                                <div className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-black backdrop-blur">
                                                    {heroProduct?.category?.name || "Featured"}
                                                </div>
                                                <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                                                    <p className="max-w-xl text-3xl font-semibold leading-tight md:text-4xl">{heroProduct.name}</p>
                                                    <p className="mt-4 max-w-xl text-sm leading-6 text-white/75">
                                                        {heroProduct.about || "A standout pick from the collection, selected for quality, usefulness, and everyday appeal."}
                                                    </p>
                                                    <div className="mt-6 flex items-center justify-between gap-4">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-[0.28em] text-white/55">From</p>
                                                            <p className="mt-2 text-2xl font-semibold">Ksh {getProductPrice(heroProduct)}</p>
                                                        </div>
                                                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition group-hover:translate-x-1">
                                                            Explore product
                                                            <span className="icon-[ant-design--right-outlined] h-4 w-4" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>

                                            <div className="grid gap-6 sm:grid-cols-2">
                                                {
                                                    spotlightProducts.map((product) => (
                                                        <Link
                                                            key={product.id ?? product.name}
                                                            href={getProductHref(product)}
                                                            className="group luxe-reveal luxe-delay-4 luxe-card overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.05)] transition duration-300 hover:shadow-[0_24px_80px_rgba(0,0,0,0.08)]"
                                                        >
                                                            <div className="relative aspect-[1/1] overflow-hidden bg-[#f5f5f3]">
                                                                <Image
                                                                    className="object-cover transition duration-700 group-hover:scale-105"
                                                                    src={getImageUrl(getProductImage(product), "/product-placeholder.png")}
                                                                    alt={product.name}
                                                                    fill
                                                                />
                                                                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-black shadow-sm">
                                                                    {product?.category?.name || "Product"}
                                                                </div>
                                                            </div>
                                                            <div className="p-5">
                                                                <p className="line-clamp-2 text-xl font-semibold leading-snug text-black">{product.name}</p>
                                                                <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/60">
                                                                    {product.about || "Quality essentials for everyday routines."}
                                                                </p>
                                                                <div className="mt-5 flex items-end justify-between gap-3">
                                                                    <div>
                                                                        <p className="text-xs uppercase tracking-[0.24em] text-black/45">Price</p>
                                                                        <p className="mt-2 text-lg font-semibold text-black">Ksh {getProductPrice(product)}</p>
                                                                    </div>
                                                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-black/75 transition group-hover:text-black">
                                                                        View
                                                                        <span className="icon-[ant-design--right-outlined] h-4 w-4" />
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            }
                        </>

                </section>
            </div>
        </>
    )
}

'use client'
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BreadCrump from "@/app/UI/BreadCrump";
import useSWR from 'swr'
import { fetcher } from "@/app/lib/data"
import { getImageUrl } from "@/app/lib/utils/image";

/* ─── Brand hero config ─────────────────────────────────── */
const categoryThemes = {
    oats: {
        brand: "Grainmill",
        tagline: "Hearty oats & nourishing grain essentials for everyday meals.",
        logo: "/brand-logos/grainmill_logo.png",
        banner: "/carousel/OatsPoster.webp",
        accentBg: "bg-oats",
        accentHex: "#f97316",
        gradientClass: "from-oats/20 to-white",
    },
    nanacare: {
        brand: "Nanacare",
        tagline: "Comfort-first baby care for feeding, storage, and daily ease.",
        logo: "/brand-logos/nanacare_logo.png",
        banner: "/carousel/nanacare.jpeg",
        accentBg: "bg-nanacare",
        accentHex: "#1877F2",
        gradientClass: "from-nanacare/20 to-white",
    },
    nutmill: {
        brand: "Nutmill",
        tagline: "Bold nuts, seeds & snackable pantry picks roasted to perfection.",
        logo: "/brand-logos/nutmill_logo.png",
        banner: "/carousel/nutmill.jpeg",
        accentBg: "bg-[#111111]",
        accentHex: "#111111",
        gradientClass: "from-gray-200 to-white",
    },
    grainmill: {
        brand: "Grainmill",
        tagline: "The gold standard of hearty oats and wholesome grain staples.",
        logo: "/brand-logos/grainmill_logo.png",
        banner: "/carousel/OatsPoster.webp",
        accentBg: "bg-oats",
        accentHex: "#f97316",
        gradientClass: "from-oats/20 to-white",
    },
};

function resolveTheme(categoryParam) {
    const key = decodeURIComponent(categoryParam || "")
        .replaceAll("-", " ")
        .trim()
        .toLowerCase();
    const slugKey = categoryParam?.toLowerCase() || "";
    return categoryThemes[slugKey] || categoryThemes[key] || {
        brand: key.charAt(0).toUpperCase() + key.slice(1) || "Collection",
        tagline: "Discover products chosen for better everyday shopping.",
        logo: "",
        banner: null,
        accentBg: "bg-primary",
        accentHex: "#6D31ED",
        gradientClass: "from-primary/10 to-white",
    };
}

export default function CategoryLayout({ children, params }) {
    const category = params?.category || "";
    const theme = resolveTheme(category);
    const path = usePathname();

    const { data: response } = useSWR(['/banners', { page: category.toLowerCase() }], fetcher)
    const dynamicBanners = response?.data || []
    
    const bannerSrc = dynamicBanners.length > 0
        ? getImageUrl(dynamicBanners[0].image)
        : getImageUrl(theme.banner);

    // Individual product page — no banner, just breadcrumb + content
    if (path.split("/").length === 4) return (
        <>
            <section className="px-4 pt-8 md:px-8">
                <div className="mx-2 md:mx-10 luxe-reveal flex flex-col gap-6">
                    <BreadCrump />
                </div>
            </section>
            <div className="w-full px-4 pb-16 pt-2 md:px-8">
                <div className="mx-2 md:mx-10">
                    {children}
                </div>
            </div>
        </>
    );

    return (
        <section className="relative">

            {/* ── Full-width banner ── */}
            <div className="w-full relative bg-[#f5f5f3]">
                {bannerSrc ? (
                    <Image
                        src={bannerSrc}
                        alt={theme.brand}
                        width={1920}
                        height={400}
                        className="w-full h-auto block shadow-sm"
                        priority
                    />
                ) : (
                    <div className={`w-full h-48 md:h-64 ${theme.accentBg}`} />
                )}

                {/* Breadcrumb overlaid top-left */}
                <div className="absolute top-4 left-4 md:top-6 md:left-12 z-10">
                    <BreadCrump light />
                </div>
                
            </div>

            {/* ── Mobile brand switcher pill bar ── */}
            <BrandSwitcher currentCategory={category} />

            {/* ── Products grid ── */}
            <div className="w-full px-4 pb-16 pt-10 md:px-8">
                <div className="mx-2 md:mx-10 luxe-reveal luxe-delay-4">
                    {children}
                </div>
            </div>

        </section>
    );
}

function BrandSwitcher({ currentCategory }) {
    const { data: brandsData } = useSWR(['/brands', {}], fetcher, { revalidateOnFocus: false });
    const brands = (Array.isArray(brandsData) ? brandsData : brandsData?.data || [])
        .filter(b => b.is_active)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    if (brands.length < 2) return null;

    const getSlug = (brand) => {
        if (brand.slug) return brand.slug;
        return brand.name.toLowerCase().trim().replaceAll(' ', '-');
    };

    return (
        <div className="w-full border-b border-gray-100 bg-white drop-shadow-md">
            <div className="flex justify-center gap-0 overflow-x-auto scrollbar-hide px-4 md:px-8 py-3 scroll-px-4">
                {brands.map((brand) => {
                    const slug = getSlug(brand);
                    const isActive = currentCategory?.toLowerCase() === slug.toLowerCase() ||
                        currentCategory?.toLowerCase() === brand.name.toLowerCase();
                    return (
                        <Link
                            key={brand.id}
                            href={`/products/${slug}`}
                            className={`flex-none flex items-center gap-2 mx-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border shadow drop-shadow-sm ${
                                isActive
                                    ? 'bg-primary text-white border-primary shadow-md'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary hover:shadow-md'
                            }`}
                        >
                            {brand.logo && (
                                <div className="w-7 h-7 rounded overflow-hidden bg-white flex-shrink-0 shadow-sm">
                                    <Image src={getImageUrl(brand.logo)} alt={brand.name} width={28} height={28} className="w-full h-full object-contain" />
                                </div>
                            )}
                            {brand.name.toUpperCase()}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

'use client'
import { usePathname } from "next/navigation";
import Image from "next/image";
import CategorySearch from "@/app/UI/CategorySearch";
import BreadCrump from "@/app/UI/BreadCrump";
import { CategorySearchProvider } from "@/app/lib/providers/CategorySearchProvider";
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
        .replaceAll("-", " ") // Handle hyphenated slugs
        .trim()
        .toLowerCase();
        
    // Also try matching the slug version directly
    const slugKey = categoryParam?.toLowerCase() || "";
    
    const theme = categoryThemes[slugKey] || categoryThemes[key] || {
        brand: key.charAt(0).toUpperCase() + key.slice(1) || "Collection",
        tagline: "Discover products chosen for better everyday shopping.",
        logo: "",
        banner: null,
        accentBg: "bg-primary",
        accentHex: "#6D31ED",
        gradientClass: "from-primary/10 to-white",
    };
    
    return theme;
}

export default function CategoryLayout({ children, params }) {
    const category = params?.category || "";
    const theme = resolveTheme(category);
    const path = usePathname();

    const { data: response } = useSWR(['/banners', { page: category.toLowerCase() }], fetcher)
    const dynamicBanners = response?.data || []
    
    // Use first dynamic banner if available, else fallback to theme.banner
    const bannerSrc = dynamicBanners.length > 0 
        ? getImageUrl(dynamicBanners[0].image)
        : getImageUrl(theme.banner);

    // Individual product page — just show breadcrumb + content
    if (path.split("/").length === 4) return (
        <CategorySearchProvider>
            <section className="px-4 pt-8 md:px-8">
                <div className="mx-2 md:mx-10 luxe-reveal">
                    <BreadCrump />
                </div>
            </section>
            {children}
        </CategorySearchProvider>
    );

    return (
        <CategorySearchProvider>
            <section className="relative">

            {/* ── Full-width pure image banner ── */}
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
                
                {/* Breadcrumb on top left of image for easy navigation */}
                <div className="absolute top-6 left-6 md:left-12">
                    <BreadCrump light />
                </div>
            </div>

            {/* ── Search bar centered below banner ── */}
            <div className="w-full flex justify-center pt-10 pb-4 px-4 luxe-reveal luxe-delay-1">
                <div className="w-full max-w-2xl">
                    <CategorySearch />
                </div>
            </div>

            {/* ── Products grid ── */}
            <div className="w-full px-4 pb-16 pt-2 md:px-8">
                <div className="mx-2 md:mx-10 luxe-reveal luxe-delay-4">
                    {children}
                </div>
            </div>

        </section>
        </CategorySearchProvider>
    );
}

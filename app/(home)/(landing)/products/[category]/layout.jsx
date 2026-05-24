'use client'
import { usePathname } from "next/navigation";
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
                
                {/* Tagline */}
                {theme.tagline && (
                    <div className="absolute bottom-4 left-0 right-0 z-10">
                        <p className="text-center text-white/90 text-sm md:text-base drop-shadow-md font-semibold tracking-wide px-4">
                            {theme.tagline}
                        </p>
                    </div>
                )}
            </div>

            {/* ── Products grid ── */}
            <div className="w-full px-4 pb-16 pt-10 md:px-8">
                <div className="mx-2 md:mx-10 luxe-reveal luxe-delay-4">
                    {children}
                </div>
            </div>

        </section>
    );
}

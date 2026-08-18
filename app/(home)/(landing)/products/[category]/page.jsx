import CategoryClient from "./CategoryClient";

/**
 * Fetch products with SSR.
 * - For "all" category: no brand/category filter → returns all products.
 * - Passes search term to the API when present.
 */
async function getCategoryProducts(category, page = 1, search = "") {
    const rawSlug = (category || "").toLowerCase().trim();
    const isAll = rawSlug === "all";

    const queryParams = {
        page: page.toString(),
        per_page: "12",
        sort_by: "newest",
    };

    // Only add brand/category filter when not on "all"
    if (!isAll) {
        queryParams.brand = rawSlug;
        queryParams.category = rawSlug;
    }

    // Forward the search term to the API
    if (search && search.trim()) {
        queryParams.search = search.trim();
    }

    const params = new URLSearchParams(queryParams);

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`,
            { next: { tags: ['products'], revalidate: 60 } }
        );
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Failed to fetch category products:", error);
        return null;
    }
}

const categoryBrandCopy = {
    all: {
        title: "All Healthy Products & Essentials",
        description: "Browse our complete Kenyan catalog — hearty Grainmill oats, wholesome Nutmill snacks, Nanacare baby essentials, and more.",
    },
    oats: {
        title: "Grainmill Healthy Oats & Breakfast Cereals",
        description: "Shop 100% natural Jumbo Rolled Oats, Steel-Cut Oats, and fine Oat Flour in Nairobi, Kenya. Fast countrywide delivery.",
    },
    grainmill: {
        title: "Grainmill Premium Oats & Grains",
        description: "Explore the complete Grainmill collection: steel-cut, rolled jumbo oats, and nutritious grain flours crafted for everyday health.",
    },
    nanacare: {
        title: "Nanacare Baby Essentials & Motherhood Care",
        description: "Shop Nanacare breastmilk storage cups, insulated cooler bags, nursing covers, and feeding bottles online in Kenya.",
    },
    nutmill: {
        title: "Nutmill Roasted Nuts & Seed Snacks",
        description: "Discover fresh, perfectly roasted nuts, seeds, and healthy pantry snacks with doorstep delivery in Nairobi.",
    },
};

export async function generateMetadata({ params }) {
    const rawSlug = (params.category || "").toLowerCase().trim();
    const copy = categoryBrandCopy[rawSlug];

    if (copy) {
        return {
            title: `${copy.title} | ngwindsongk`,
            description: copy.description,
            openGraph: {
                title: `${copy.title} | ngwindsongk`,
                description: copy.description,
                images: ['/logo.png'],
            },
            alternates: {
                canonical: `/products/${rawSlug}`,
            }
        };
    }

    const spacedSlug = rawSlug.replaceAll('-', ' ').replaceAll('%20', ' ');
    const titleCased = spacedSlug.charAt(0).toUpperCase() + spacedSlug.slice(1);
    return {
        title: `${titleCased} Products | ngwindsongk`,
        description: `Browse premium ${spacedSlug} products from ngwindsongk in Nairobi, Kenya. Fast delivery across Kenya.`,
        alternates: {
            canonical: `/products/${rawSlug}`,
        }
    };
}

export default async function CategoryPage({ params, searchParams }) {
    const page = parseInt(searchParams?.page) || 1;
    const search = searchParams?.search || "";

    // SSR: fetch with correct filters + search term
    const fallbackData = await getCategoryProducts(params.category, page, search);

    return (
        <CategoryClient fallbackData={fallbackData} initialSearch={search} />
    );
}

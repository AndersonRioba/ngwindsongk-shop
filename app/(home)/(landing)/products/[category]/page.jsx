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

export async function generateMetadata({ params }) {
    const rawSlug = (params.category || "").toLowerCase().trim();
    if (rawSlug === "all") {
        return {
            title: "All Products | Ngwindsongk",
            description: "Browse our complete catalog — oats, nuts & seeds, baby care products and more.",
        };
    }
    const spacedSlug = rawSlug.replaceAll('-', ' ').replaceAll('%20', ' ');
    return {
        title: `${spacedSlug.charAt(0).toUpperCase() + spacedSlug.slice(1)} | Ngwindsongk`,
        description: `Browse our collection of ${spacedSlug} products.`
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


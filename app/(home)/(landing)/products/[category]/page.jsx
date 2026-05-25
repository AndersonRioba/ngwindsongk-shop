import CategoryClient from "./CategoryClient";

async function getCategoryProducts(category, page = 1) {
    const rawSlug = (category || "").toLowerCase().trim();
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: "12",
        sort_by: "newest",
        brand: rawSlug,
        category: rawSlug
    });

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Failed to fetch category products:", error);
        return null;
    }
}

export async function generateMetadata({ params }) {
    const rawSlug = (params.category || "").toLowerCase().trim();
    const spacedSlug = rawSlug.replaceAll('-', ' ').replaceAll('%20', ' ');
    return {
        title: `${spacedSlug.charAt(0).toUpperCase() + spacedSlug.slice(1)} | Ngwindsongk`,
        description: `Browse our collection of ${spacedSlug} products.`
    };
}

export default async function CategoryPage({ params, searchParams }) {
    // Next.js 14 passes searchParams as a prop to page components
    const page = parseInt(searchParams?.page) || 1;
    const fallbackData = await getCategoryProducts(params.category, page);

    return (
        <CategoryClient fallbackData={fallbackData} />
    );
}

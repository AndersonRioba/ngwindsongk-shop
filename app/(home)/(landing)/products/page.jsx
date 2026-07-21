import ProductsClient from "./ProductsClient";

async function getProductsData() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?per_page=500`, {
            next: { tags: ['products'], revalidate: 60 }
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return null;
    }
}


export const metadata = {
    title: "All Products | Ngwindsongk",
    description: "Browse our complete catalog of healthy oats and baby care products."
};

export default async function ProductsPage() {
    const fallbackData = await getProductsData();

    return (
        <ProductsClient fallbackData={fallbackData} />
    );
}

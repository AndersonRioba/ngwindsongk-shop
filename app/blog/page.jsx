import BlogsClient from "./BlogsClient";

async function getBlogsData(searchParams) {
    const page = parseInt(searchParams?.page) || 1;
    const currentBrand = searchParams?.brand_id;
    const currentProduct = searchParams?.product_id;

    const params = new URLSearchParams({ page: page.toString() });
    if (currentBrand) params.append('brand_id', currentBrand);
    if (currentProduct) params.append('product_id', currentProduct);

    try {
        const [blogsRes, brandsRes, productsRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs?${params.toString()}`, { next: { revalidate: 60 } }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`, { next: { revalidate: 3600 } }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { next: { revalidate: 3600 } })
        ]);

        const blogsData = blogsRes.ok ? await blogsRes.json() : null;
        const brandsData = brandsRes.ok ? await brandsRes.json() : null;
        const productsData = productsRes.ok ? await productsRes.json() : null;

        return { blogsData, brandsData, productsData };
    } catch (error) {
        console.error("Failed to fetch blogs data:", error);
        return { blogsData: null, brandsData: [], productsData: [] };
    }
}

export const metadata = {
    title: "Blog | Ngwindsongk",
    description: "Stories of healthy living, parenting tips, and nourishing recipes from our community."
};

export default async function BlogsPage({ searchParams }) {
    const { blogsData, brandsData, productsData } = await getBlogsData(searchParams);

    return (
        <BlogsClient 
            fallbackBlogs={blogsData} 
            fallbackBrands={brandsData} 
            fallbackProducts={productsData} 
        />
    );
}
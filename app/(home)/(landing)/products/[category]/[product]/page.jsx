import ProductView from "./ProductView";

async function getProductData(slug) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, {
            next: { tags: ['products'], revalidate: 3600 }
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return null;
    }
}

async function getDescriptionData(slug) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/descriptions/${slug}`, {
            next: { tags: ['products'], revalidate: 3600 }
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Failed to fetch description:", error);
        return null;
    }
}


export async function generateMetadata({ params }) {
    const product = await getProductData(params.product);
    if (!product) return { title: "Product Not Found" };
    
    return {
        title: `${product.name} | Ngwindsongk`,
        description: product.about,
        openGraph: {
            title: product.name,
            description: product.about,
            images: product.product_images?.[0]?.url ? [{ url: product.product_images[0].url }] : [],
        },
    };
}

export default async function Page({ params }) {
    // Parallel fetching
    const [productData, descriptionData] = await Promise.all([
        getProductData(params.product),
        getDescriptionData(params.product)
    ]);

    return (
        <ProductView 
            params={params} 
            initialProduct={productData} 
            initialDescription={descriptionData} 
        />
    );
}
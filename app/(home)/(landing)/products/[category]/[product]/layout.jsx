const SITE_URL = 'https://ngwindsongk.com';

async function fetchProduct(params) {
    const product = params.product;
    const productData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${product}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).then(res => res.json()).catch(() => null);
    return { product, productData };
}

// Dynamic metadata generation for product pages
export async function generateMetadata({ params }) {
    const { product, productData } = await fetchProduct(params);

    if (!productData) {
      return {
        title: `${product}`,
        description: `Shop ${product} from ngwindsongk. Premium healthy oats and Nanacare products.`,
      };
    }

    const categorySlug = productData.brand?.slug || productData.category?.slug || (productData.brand?.name || productData.category?.name || 'Products').toLowerCase().trim().replaceAll(' ', '-');
    const productSlug = productData.slug || productData.name.toLowerCase().trim().replaceAll(' ', '-');
    const productUrl = `${SITE_URL}/products/${categorySlug}/${productSlug}`;
    const primaryImage = productData.product_images?.find(img => img.is_primary)?.url || productData.product_images?.[0]?.url;
    const metaDescription = productData.about?.substring(0, 160) || `Shop ${productData.name} from ngwindsongk. Premium healthy oats and Nanacare products.`;

    return {
      title: `${productData.name} - ${productData.category?.name || 'Products'}`,
      description: metaDescription,
      keywords: [
        productData.name,
        productData.category?.name,
        productData.brand?.name,
        'ngwindsongk',
        'healthy oats',
        'nanacare',
        'premium products'
      ].filter(Boolean),
      openGraph: {
        title: `${productData.name} - ngwindsongk`,
        description: metaDescription,
        url: productUrl,
        images: primaryImage ? [primaryImage] : ['/logo.png'],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${productData.name} - ngwindsongk`,
        description: metaDescription,
        images: primaryImage ? [primaryImage] : ['/logo.png'],
      },
      alternates: {
        canonical: `/products/${categorySlug}/${productSlug}`,
      },
    };
  }

export default async function ProductDescription({children, params}){
    const { productData } = await fetchProduct(params);

    const categorySlug = productData ? (productData.brand?.slug || productData.category?.slug || (productData.brand?.name || productData.category?.name || 'products').toLowerCase().trim().replaceAll(' ', '-')) : 'products';
    const productSlug = productData ? (productData.slug || productData.name.toLowerCase().trim().replaceAll(' ', '-')) : '';

    // Build Product JSON-LD for search engines and AI crawlers
    const jsonLd = productData ? {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": productData.name,
      "description": productData.about,
      "image": (productData.product_images || []).map(img => img.url),
      "brand": {
        "@type": "Brand",
        "name": productData.brand?.name || "ngwindsongk"
      },
      "category": productData.category?.name || "Health & Wellness",
      "sku": productData.slug || productData.id?.toString(),
      "offers": {
        "@type": "Offer",
        "price": productData.price,
        "priceCurrency": "KES",
        "availability": productData.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": `${SITE_URL}/products/${categorySlug}/${productSlug}`,
        "seller": {
          "@type": "Organization",
          "name": "ngwindsongk"
        }
      },
    } : null;

    return(
        <main className="w-11/12 2xl:w-10/12 mx-auto">
            {/* Server-rendered Product JSON-LD for crawlers & AI agents */}
            {jsonLd && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
              />
            )}
            {/* Server-rendered product content visible to crawlers that don't execute JS */}
            {productData && (
              <div data-nosnippet="" className="sr-only" aria-hidden="true">
                <h1>{productData.name}</h1>
                <p>{productData.category?.name} by {productData.brand?.name || 'ngwindsongk'}</p>
                <p>Price: KES {productData.price}</p>
                <p>{productData.about}</p>
                {productData.product_variations?.length > 0 && (
                  <ul>
                    {productData.product_variations.map((v, i) => (
                      <li key={i}>{v.attribute_name}: {v.attribute_value} - KES {v.price}</li>
                    ))}
                  </ul>
                )}
                {productData.stock > 0 ? <p>In Stock ({productData.stock} available)</p> : <p>Out of Stock</p>}
              </div>
            )}
            {children}
        </main>
    )
}
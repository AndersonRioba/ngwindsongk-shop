const SITE_URL = 'https://ngwindsongk.com';

async function fetchProduct(params) {
    const product = params.product;
    const productData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${product}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 },
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

    // SEO field fallback chain
    const title = productData.seo_title || `${productData.name} - ${productData.category?.name || 'Products'}`;
    const metaDescription = productData.seo_description || productData.about?.substring(0, 160) || `Shop ${productData.name} from ngwindsongk. Premium healthy oats and Nanacare products.`;
    const canonical = productData.canonical_url || `/products/${categorySlug}/${productSlug}`;

    const keywords = productData.seo_keywords
      ? productData.seo_keywords.split(',').map(k => k.trim()).filter(Boolean)
      : [
          productData.name,
          productData.category?.name,
          productData.brand?.name,
          'ngwindsongk',
          'healthy oats',
          'nanacare',
          'premium products'
        ].filter(Boolean);

    return {
      title: `${title} | ngwindsongk`,
      description: metaDescription,
      keywords,
      openGraph: {
        title: `${title} | ngwindsongk`,
        description: metaDescription,
        url: productUrl,
        images: primaryImage ? [{ url: primaryImage, alt: productData.name }] : [{ url: `${SITE_URL}/logo.png`, alt: 'ngwindsongk' }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | ngwindsongk`,
        description: metaDescription,
        images: primaryImage ? [primaryImage] : [`${SITE_URL}/logo.png`],
      },
      alternates: {
        canonical,
      },
      robots: productData.noindex ? {
        index: false,
        follow: false,
      } : {
        index: true,
        follow: true,
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
      "name": productData.seo_title || productData.name,
      "description": productData.seo_description || productData.about,
      "image": (productData.product_images || []).map(img => img.url),
      "brand": {
        "@type": "Brand",
        "name": productData.brand?.name || "ngwindsongk"
      },
      "category": productData.category?.name || "Health & Wellness",
      "sku": productData.slug || productData.id?.toString(),
      "keywords": productData.seo_keywords || undefined,
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
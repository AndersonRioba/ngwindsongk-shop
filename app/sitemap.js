const baseUrl = 'https://ngwindsongk.com'
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ngwindsongk.com/api'

export default async function sitemap() {
  // Fetch all products from the API
  let productEntries = []
  try {
    const res = await fetch(`${apiUrl}/products`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 }, // revalidate every hour
    })
    const data = await res.json()
    const products = data.data || data || []

    productEntries = products.map((product) => {
      const categorySlug = (product.brand?.name || product.category?.name || 'Products').toLowerCase().trim().replaceAll(' ', '-');
      const productSlug = (product.slug || product.name).toLowerCase().trim().replaceAll(' ', '-');
      return {
        url: `${baseUrl}/products/${categorySlug}/${productSlug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      };
    })
  } catch (e) {
    // If API fails, sitemap still works with static pages
  }

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/recipes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/FAQs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  return [...staticPages, ...productEntries]
}

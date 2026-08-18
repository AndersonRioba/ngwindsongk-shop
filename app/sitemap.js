const baseUrl = 'https://ngwindsongk.com'
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ngwindsongk.com/api'

export default async function sitemap() {
  // Fetch products
  let productEntries = []
  try {
    const res = await fetch(`${apiUrl}/products`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    const products = (data.data || data || []).filter(p => !p.noindex)

    productEntries = products.map((product) => {
      const categorySlug = product.brand?.slug || product.category?.slug || (product.brand?.name || product.category?.name || 'Products').toLowerCase().trim().replaceAll(' ', '-');
      const productSlug = product.slug || product.name.toLowerCase().trim().replaceAll(' ', '-');
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

  // Fetch brand category pages (e.g. /products/Grainmill)
  let brandEntries = []
  try {
    const res = await fetch(`${apiUrl}/brands`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    const brands = Array.isArray(data) ? data : (data.data || [])

    brandEntries = brands.map((brand) => ({
      url: `${baseUrl}/products/${brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: brand.updated_at ? new Date(brand.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch (e) {
    // Non-critical fallback — use known brand slugs
    brandEntries = [
      { url: `${baseUrl}/products/Grainmill`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/products/Nanacare`,  lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/products/Nutmill`,   lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ]
  }

  // Fetch blogs
  let blogEntries = []
  try {
    const res = await fetch(`${apiUrl}/blogs`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    const blogs = (data.data?.data || data.data || data.blogs || []).filter(b => !b.noindex)

    blogEntries = blogs.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(post.created_at || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
  } catch (e) {
    // Non-critical fallback
  }

  // Fetch recipes
  let recipeEntries = []
  try {
    const res = await fetch(`${apiUrl}/recipes`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    const recipes = (data.data?.data || data.data || data.recipes || []).filter(r => !r.noindex)

    recipeEntries = recipes.map((recipe) => ({
      url: `${baseUrl}/recipes/${recipe.slug}`,
      lastModified: recipe.updated_at ? new Date(recipe.updated_at) : new Date(recipe.created_at || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
  } catch (e) {
    // Non-critical fallback
  }

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/recipes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
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

  return [...staticPages, ...brandEntries, ...productEntries, ...blogEntries, ...recipeEntries]
}

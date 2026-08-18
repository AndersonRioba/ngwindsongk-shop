const SITE_URL = 'https://ngwindsongk.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ngwindsongk.com/api';

async function fetchRecipe(slug) {
    try {
        const res = await fetch(`${API_URL}/recipes/${slug}`, {
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 3600 }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.recipe || data.data || null;
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }) {
    const slug = params?.recipe;
    const recipe = await fetchRecipe(slug);

    if (!recipe) {
        return {
            title: 'Recipe Not Found | ngwindsongk',
            description: 'Discover delicious, healthy oat recipes from ngwindsongk.',
        };
    }

    const title = recipe.seo_title || recipe.title;
    const description = recipe.seo_description || recipe.content || `Cook ${recipe.title} with healthy oats and fresh ingredients. Easy step-by-step recipe from ngwindsongk.`;
    const ogImage = recipe.image || `${SITE_URL}/logo.png`;
    const canonical = recipe.canonical_url || `${SITE_URL}/recipes/${slug}`;

    const keywords = recipe.seo_keywords
        ? recipe.seo_keywords.split(',').map(k => k.trim()).filter(Boolean)
        : [recipe.title, `${recipe.category} recipe`, 'oat recipes Kenya', 'healthy recipes', 'ngwindsongk'];

    return {
        title: `${title} | Healthy Recipes | ngwindsongk`,
        description,
        keywords,
        openGraph: {
            title: `${title} | ngwindsongk`,
            description,
            url: `${SITE_URL}/recipes/${slug}`,
            type: 'article',
            publishedTime: recipe.created_at,
            modifiedTime: recipe.updated_at,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ],
            siteName: 'ngwindsongk',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | ngwindsongk`,
            description,
            images: [ogImage],
        },
        alternates: {
            canonical,
        },
        robots: recipe.noindex ? {
            index: false,
            follow: false,
        } : {
            index: true,
            follow: true,
        },
    };
}

export default async function RecipeDetailLayout({ children, params }) {
    const slug = params?.recipe;
    const recipe = await fetchRecipe(slug);

    // Format ISO 8601 duration for cooking time (e.g., PT30M)
    const cookTimeDuration = recipe?.cooking_time ? `PT${recipe.cooking_time}M` : 'PT30M';

    // Parse ingredients array
    const ingredientList = Array.isArray(recipe?.ingredients)
        ? recipe.ingredients.map(i => typeof i === 'string' ? i : (i.text || i.name || ''))
        : [];

    // Parse instructions array
    const instructionList = Array.isArray(recipe?.instructions)
        ? recipe.instructions.map((step, idx) => ({
            "@type": "HowToStep",
            "position": idx + 1,
            "text": typeof step === 'string' ? step : (step.text || step.instruction || '')
        }))
        : [];

    // Rich Recipe JSON-LD schema (enables Google Recipe rich snippet on SERP)
    const jsonLd = recipe ? {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": recipe.seo_title || recipe.title,
        "image": recipe.image ? [recipe.image] : [`${SITE_URL}/logo.png`],
        "description": recipe.seo_description || recipe.content || `Delicious ${recipe.title} recipe.`,
        "cookTime": cookTimeDuration,
        "totalTime": cookTimeDuration,
        "recipeYield": `${recipe.servings || 4} servings`,
        "recipeCategory": recipe.category || "Breakfast",
        "recipeCuisine": "International",
        "recipeIngredient": ingredientList.filter(Boolean),
        "recipeInstructions": instructionList.filter(s => s.text),
        "author": {
            "@type": "Organization",
            "name": "ngwindsongk",
            "url": SITE_URL
        },
        "publisher": {
            "@type": "Organization",
            "name": "ngwindsongk",
            "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/logo.png`
            }
        },
        "datePublished": recipe.created_at,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${SITE_URL}/recipes/${slug}`
        }
    } : null;

    return (
        <section className="w-full">
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            {children}
        </section>
    );
}

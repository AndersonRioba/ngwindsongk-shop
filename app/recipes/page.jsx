import RecipesClient from "./RecipesClient";

async function getRecipesData(page = 1) {
    const params = new URLSearchParams({ page: page.toString() });
    try {
        const [recipesRes, categoriesRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/recipes?${params.toString()}`, { next: { revalidate: 60 } }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/recipes/categories`, { next: { revalidate: 3600 } }) // categories don't change often
        ]);

        const recipesData = recipesRes.ok ? await recipesRes.json() : null;
        const categoriesData = categoriesRes.ok ? await categoriesRes.json() : null;

        return { recipesData, categoriesData };
    } catch (error) {
        console.error("Failed to fetch recipes data:", error);
        return { recipesData: null, categoriesData: null };
    }
}

export const metadata = {
    title: "Culinary Collection | Ngwindsongk Recipes",
    description: "Explore our curated collection of artisanal recipes and elevated flavors for the modern kitchen."
};

export default async function RecipesPage({ searchParams }) {
    const page = parseInt(searchParams?.page) || 1;
    const { recipesData, categoriesData } = await getRecipesData(page);

    return (
        <RecipesClient 
            fallbackData={recipesData} 
            fallbackCategories={categoriesData} 
        />
    );
}
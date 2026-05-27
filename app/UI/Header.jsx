import HeaderClient from "@/app/UI/Menus";

async function getHeaderData() {
    try {
        const [navRes, settingsRes, categoriesRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/nav-menus`, {
                next: { revalidate: 300 } // Cache for 5 minutes
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings?group=footer`, {
                next: { revalidate: 3600 } // Cache for 1 hour
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
                next: { revalidate: 300 }
            })
        ]);

        const navData   = navRes.ok       ? await navRes.json()        : null;
        const settings  = settingsRes.ok  ? await settingsRes.json()   : null;
        const categories = categoriesRes.ok ? await categoriesRes.json() : null;

        return { navData, settings, categories };
    } catch (error) {
        console.error("Failed to fetch header data:", error);
        return { navData: null, settings: null, categories: null };
    }
}

export default async function Header() {
    const { navData, settings, categories } = await getHeaderData();

    return (
        <HeaderClient
            fallbackNavData={navData}
            fallbackSettings={settings}
            fallbackCategories={categories}
        />
    );
}

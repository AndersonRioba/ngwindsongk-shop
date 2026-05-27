import FooterClient from "./FooterClient";

async function getFooterData() {
    try {
        const [settingsRes, brandsRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings?group=footer`, {
                next: { revalidate: 3600 } // Cache for 1 hour — footer data rarely changes
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`, {
                next: { revalidate: 3600 }
            })
        ]);

        const settings = settingsRes.ok ? await settingsRes.json() : null;
        const brands = brandsRes.ok ? await brandsRes.json() : null;

        return { settings, brands };
    } catch (error) {
        console.error("Failed to fetch footer data:", error);
        return { settings: null, brands: null };
    }
}

export default async function Footer() {
    const { settings, brands } = await getFooterData();

    return (
        <FooterClient
            fallbackSettings={settings}
            fallbackBrands={brands}
        />
    );
}
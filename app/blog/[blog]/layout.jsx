import { headers } from "next/headers";

const SITE_URL = 'https://ngwindsongk.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ngwindsongk.com/api';

async function fetchBlog(slug) {
    try {
        const res = await fetch(`${API_URL}/blogs/${slug}`, {
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 3600 }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.blog || data.data || null;
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }) {
    const slug = params?.blog;
    const blog = await fetchBlog(slug);

    if (!blog) {
        return {
            title: 'Blog Post Not Found | ngwindsongk',
            description: 'Read healthy recipes, wellness tips, and motherhood guides from ngwindsongk.',
        };
    }

    const title = blog.seo_title || blog.title;
    const cleanContent = blog.content ? blog.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    const description = blog.seo_description || blog.excerpt || (cleanContent ? cleanContent.substring(0, 155) + '...' : `Read ${blog.title} on ngwindsongk.`);
    const ogImage = blog.featured_image || `${SITE_URL}/logo.png`;
    const canonical = blog.canonical_url || `${SITE_URL}/blog/${slug}`;

    const keywords = blog.seo_keywords
        ? blog.seo_keywords.split(',').map(k => k.trim()).filter(Boolean)
        : [blog.title, 'healthy oats Kenya', 'wellness tips', 'ngwindsongk blog'];

    return {
        title: `${title} | ngwindsongk`,
        description,
        keywords,
        openGraph: {
            title: `${title} | ngwindsongk`,
            description,
            url: `${SITE_URL}/blog/${slug}`,
            type: 'article',
            publishedTime: blog.created_at,
            modifiedTime: blog.updated_at,
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
        robots: blog.noindex ? {
            index: false,
            follow: false,
        } : {
            index: true,
            follow: true,
        },
    };
}

export default async function BlogLayout({ children, params }) {
    const slug = params?.blog;
    const blog = await fetchBlog(slug);

    const jsonLd = blog ? {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": blog.seo_title || blog.title,
        "description": blog.seo_description || blog.excerpt || (blog.content ? blog.content.replace(/<[^>]+>/g, ' ').substring(0, 160) : ''),
        "image": blog.featured_image ? [blog.featured_image] : [`${SITE_URL}/logo.png`],
        "datePublished": blog.created_at,
        "dateModified": blog.updated_at || blog.created_at,
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
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${SITE_URL}/blog/${slug}`
        }
    } : null;

    return (
        <main className="w-full">
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            {children}
        </main>
    );
}
import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "./HeroCarousel";

async function getAboutSettings() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
    if (!apiUrl) return {};

    try {
        const res = await fetch(`${apiUrl}/settings?group=about`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
            return {};
        }

        const data = await res.json();
        return data?.data || {};
    } catch (err) {
        console.error("Failed to fetch about settings:", err);
        return {};
    }
}

export async function generateMetadata() {
  const settings = await getAboutSettings();

  const title = settings.about_seo_title || "About Us - Our Story & Mission";
  const description = settings.about_seo_description || "Learn about ngwindsong Kenya. Discover our mission to provide premium healthy oats and Nanacare products supporting healthy living and new mothers.";
  const keywords = settings.about_seo_keywords 
    ? settings.about_seo_keywords.split(',').map(k => k.trim()) 
    : [
        "about ngwindsongk",
        "company story",
        "healthy oats mission",
        "nanacare products",
        "new mother support",
        "healthy living",
        "company values",
        "quality products"
      ];
  const canonical = settings.about_canonical_url || '/about';
  const robots = settings.about_noindex ? { index: false, follow: false } : { index: true, follow: true };

  const ogImage = settings.about_og_image 
    ? (settings.about_og_image.startsWith('http') ? settings.about_og_image : `${process.env.NEXT_PUBLIC_API_URL?.split('/api')[0] || ''}/storage/${settings.about_og_image}`)
    : '/logo.png';

  return {
    title,
    description,
    keywords,
    robots,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical,
    },
  };
}

export default async function About(){
    const settings = await getAboutSettings();

    // Structured data for the company
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ngwindsongk",
      "url": "https://ngwindsongk.com",
      "logo": "https://ngwindsongk.com/logo.png",
      "description": "Premium healthy oats and Nanacare products for new mothers",
      "foundingDate": "2024",
      "founder": {
        "@type": "Person",
        "name": "Jennifer",
        "jobTitle": "Founder & CEO",
        "description": "Founder of ngwindsongk, passionate advocate for healthy living and supporting new mothers"
      },
      "mission": settings.about_mission || "To empower healthy living through nutritious food choices and support new mothers with practical, thoughtful products",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "KE"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "url": "https://ngwindsongk.com/contact"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "ngwindsongk Products",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Healthy Oats Collection",
              "description": "Premium oats including jumbo oats, steel-cut oats, quick breakfast oats, and oat flour"
            }
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "Product",
              "name": "Nanacare Products",
              "description": "Products for new mothers including cooler bags, storage cups, and practical solutions"
            }
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "Product",
              "name": "Nutmill Nuts & Seeds Collection",
              "description": "Wholesome and nutritious nuts and edible seeds for snacking, baking, and healthy meals"
            }
          }
        ]
      }
    };

    return(
        <main className="min-h-screen bg-gradient-to-b from-slate-50 via-purple-50/40 to-blue-50/40 font-sans selection:bg-purple-500 selection:text-white">
            {/* Structured Data */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData)
              }}
            />

            {/* Hero Section */}
            <HeroCarousel />

            {/* Our Story & Mission Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        {/* Story Column */}
                        <div className="lg:col-span-7 space-y-6">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                                Our Story
                            </h2>
                            {settings.about_story ? (
                                <div 
                                    className="text-base sm:text-lg text-gray-600 leading-relaxed space-y-4 blog-content"
                                    dangerouslySetInnerHTML={{ __html: settings.about_story }}
                                />
                            ) : (
                                <div className="space-y-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Ng Windsong was founded from a deep understanding of two critical needs: 
                                        the importance of healthy nutrition and the challenges faced by new parents.
                                    </p>
                                    <p>
                                        As a passionate advocate for healthy living, the founder recognized that many families struggle 
                                        to maintain nutritious eating habits in today&apos;s fast-paced world. This led to the creation of 
                                        a premium product line of oats (<i>Avena Sativa</i>), edible nuts & seeds offering wholesome, convenient nutrition for everyone.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Mission Card Column */}
                        <div className="lg:col-span-5">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500" />
                                <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 sm:p-10 text-white shadow-2xl overflow-hidden">
                                    {/* Decorative subtle circles */}
                                    <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
                                    <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-6 shadow-inner">
                                        <span className="icon-[solar--target-bold-duotone] w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-extrabold mb-4 tracking-tight">Our Mission</h3>
                                    <div className="text-base sm:text-lg leading-relaxed text-purple-100 font-normal">
                                        {settings.about_mission ? (
                                            <div dangerouslySetInnerHTML={{ __html: settings.about_mission }} />
                                        ) : (
                                            "To empower healthy living through nutritious food choices and support new mothers with practical, thoughtful products that make their journey easier and more enjoyable."
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Products Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                            Our Product Lines
                        </h2>
                        <p className="text-gray-500 text-base">Crafted with care, purpose, and uncompromising nutritional integrity.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Oats Line Card */}
                        <div className="group bg-gradient-to-br from-purple-50/80 via-white to-purple-50/30 rounded-3xl p-8 border border-purple-100/80 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl p-2 flex items-center justify-center shadow-md shadow-purple-500/10 border border-purple-100 group-hover:scale-105 transition-transform overflow-hidden relative">
                                        <Image
                                            src="/brand-logos/grainmill_logo.png"
                                            alt="Grainmill Logo"
                                            width={56}
                                            height={56}
                                            className="object-contain w-full h-full"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-black tracking-widest uppercase text-purple-600 font-mono">Grainmill Brand</span>
                                        <h3 className="text-2xl font-bold text-gray-900">Healthy Oats</h3>
                                    </div>
                                </div>
                                <div className="text-base text-gray-600 mb-8 leading-relaxed blog-content">
                                    {settings.about_oats_desc ? (
                                        <div dangerouslySetInnerHTML={{ __html: settings.about_oats_desc }} />
                                    ) : (
                                        "Our premium oats line offers a variety of nutritious options including jumbo oats, steel-cut oats, quick breakfast oats, and oat flour."
                                    )}
                                </div>
                            </div>
                            <Link
                                href="/products/Grainmill"
                                className="inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-purple-900 group/link pt-4 border-t border-purple-100"
                            >
                                <span>Explore Grainmill Oats</span>
                                <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>

                        {/* Nanacare Line Card */}
                        <div className="group bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 rounded-3xl p-8 border border-blue-100/80 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl p-2 flex items-center justify-center shadow-md shadow-blue-500/10 border border-blue-100 group-hover:scale-105 transition-transform overflow-hidden relative">
                                        <Image
                                            src="/brand-logos/nanacare_logo.png"
                                            alt="Nanacare Logo"
                                            width={56}
                                            height={56}
                                            className="object-contain w-full h-full"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-black tracking-widest uppercase text-blue-600 font-mono">Motherhood Care</span>
                                        <h3 className="text-2xl font-bold text-gray-900">Nanacare</h3>
                                    </div>
                                </div>
                                <div className="text-base text-gray-600 mb-8 leading-relaxed blog-content">
                                    {settings.about_nanacare_desc ? (
                                        <div dangerouslySetInnerHTML={{ __html: settings.about_nanacare_desc }} />
                                    ) : (
                                        "Our Nanacare line was specifically designed to address the real challenges new mothers face, from cooler bags to storage cups."
                                    )}
                                </div>
                            </div>
                            <Link
                                href="/products/Nanacare"
                                className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 group/link pt-4 border-t border-blue-100"
                            >
                                <span>Explore Nanacare Essentials</span>
                                <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>

                        {/* Nutmill Line Card */}
                        <div className="group bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 rounded-3xl p-8 border border-amber-100/80 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl p-2 flex items-center justify-center shadow-md shadow-amber-500/10 border border-amber-100 group-hover:scale-105 transition-transform overflow-hidden relative">
                                        <Image
                                            src="/brand-logos/nutmill_logo.png"
                                            alt="Nutmill Logo"
                                            width={56}
                                            height={56}
                                            className="object-contain w-full h-full"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-black tracking-widest uppercase text-amber-600 font-mono">Nutmill Brand</span>
                                        <h3 className="text-2xl font-bold text-gray-900">Nuts & Seeds</h3>
                                    </div>
                                </div>
                                <div className="text-base text-gray-600 mb-8 leading-relaxed blog-content">
                                    {settings.about_nutmill_desc ? (
                                        <div dangerouslySetInnerHTML={{ __html: settings.about_nutmill_desc }} />
                                    ) : (
                                        "Our Nutmill line delivers nutrient-dense edible nuts and superfood seeds carefully sourced for fresh, wholesome everyday snacking and recipes."
                                    )}
                                </div>
                            </div>
                            <Link
                                href="/products/Nutmill"
                                className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-900 group/link pt-4 border-t border-amber-100"
                            >
                                <span>Explore Nutmill Collection</span>
                                <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                            Our Values
                        </h2>
                        <p className="text-gray-500 text-base">The unwavering standards that drive every product we create.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Value 1 */}
                        <div className="bg-white/80 backdrop-blur-sm border border-purple-100/60 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 text-center group">
                            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{settings.about_value1_title || 'Quality'}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                {settings.about_value1_desc || 'We never compromise on quality. Every product is carefully selected and tested.'}
                            </p>
                        </div>

                        {/* Value 2 */}
                        <div className="bg-white/80 backdrop-blur-sm border border-blue-100/60 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 text-center group">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{settings.about_value2_title || 'Care'}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                {settings.about_value2_desc || 'We care deeply about our customers\u2019 well-being.'}
                            </p>
                        </div>

                        {/* Value 3 */}
                        <div className="bg-white/80 backdrop-blur-sm border border-indigo-100/60 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 text-center group">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{settings.about_value3_title || 'Innovation'}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                {settings.about_value3_desc || 'We continuously innovate to solve real problems.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Founder's Message */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50 rounded-3xl p-8 sm:p-12 lg:p-16 border border-purple-100/80 shadow-lg text-center relative overflow-hidden">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-purple-500/20 text-white">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-8 tracking-tight">
                            A Message from the Founder
                        </h2>
                        <blockquote className="text-lg sm:text-xl text-gray-700 italic leading-relaxed mb-8 blog-content max-w-2xl mx-auto">
                            {settings.about_founder_message ? (
                                 <div dangerouslySetInnerHTML={{ __html: settings.about_founder_message }} />
                            ) : (
                                "\"When I founded NG windsong Kenya LTD, I wanted to create more than just products – I wanted to create solutions that make a real difference in people's lives.\""
                            )}
                        </blockquote>
                        <div className="inline-block pt-6 border-t border-purple-100">
                            <p className="text-base font-bold text-gray-900">
                                {settings.about_founder_name || 'The Founder'}
                            </p>
                            <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest font-mono mt-0.5">
                                Founder & CEO, ngwindsongk
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                        Join Our Community
                    </h2>
                    <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
                        Discover our products and experience the difference.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link href={'/products'} className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-300 text-base">
                            Explore Our Products
                        </Link>
                        <Link href="/contact" className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-4 px-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-base">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
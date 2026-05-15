import Link from "next/link";
import HeroCarousel from "./HeroCarousel";

async function getAboutSettings() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings?group=about`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        const data = await res.json();
        return data?.data || {};
    } catch (err) {
        console.error("Failed to fetch about settings:", err);
        return {};
    }
}

export const metadata = {
  title: "About Us - Our Story & Mission",
  description: "Learn about ngwindsong Kenya. Discover our mission to provide premium healthy oats and Nanacare products supporting healthy living and new mothers.",
  keywords: [
    "about ngwindsongk",
    "company story",
    "healthy oats mission",
    "nanacare products",
    "new mother support",
    "healthy living",
    "company values",
    "quality products"
  ],
  openGraph: {
    title: "About ngwindsongk - Our Story & Mission",
    description: "Discover the story behind ngwindsongk and our commitment to healthy living and supporting new mothers.",
    images: ['/logo.png'],
  },
  alternates: {
    canonical: '/about',
  },
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
          }
        ]
      }
    };

    return(
        <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            {/* Structured Data */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData)
              }}
            />

            {/* Hero Section */}
            <HeroCarousel />

            {/* Our Story Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
                            {settings.about_story ? (
                                <div 
                                    className="text-lg text-gray-600 mb-6 leading-relaxed blog-content"
                                    dangerouslySetInnerHTML={{ __html: settings.about_story }}
                                />
                            ) : (
                                <>
                                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                        Ng Windsong was founded from a deep understanding of two critical needs: 
                                        the importance of healthy nutrition and the challenges faced by new parents.
                                    </p>
                                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                        As a passionate advocate for healthy living, the founder recognized that many families struggle 
                                        to maintain nutritious eating habits in today's fast-paced world. This led to the creation of 
                                        a premium product line of oats (<i>Avena Sativa</i>), edible nuts & seeds offering wholesome, convenient nutrition for everyone.
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl p-8 text-white shadow-xl">
                                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                                <div className="text-lg leading-relaxed blog-content prose-invert">
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
            </section>

            {/* Our Products Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-gray-800 text-center mb-16">Our Product Lines</h2>
                    
                    <div className="grid md:grid-cols-2 gap-12 mb-16">
                        {/* Oats Line */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 shadow-sm">
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800">Healthy Oats</h3>
                            </div>
                            <div className="text-lg text-gray-600 mb-6 leading-relaxed blog-content">
                                {settings.about_oats_desc ? (
                                    <div dangerouslySetInnerHTML={{ __html: settings.about_oats_desc }} />
                                ) : (
                                    "Our premium oats line offers a variety of nutritious options including jumbo oats, steel-cut oats, quick breakfast oats, and oat flour."
                                )}
                            </div>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                    Jumbo Oats for hearty breakfasts
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                    Steel-Cut Oats for texture and nutrition
                                </li>
                            </ul>
                        </div>

                        {/* Nanacare Line */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-sm">
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800">Nanacare</h3>
                            </div>
                            <div className="text-lg text-gray-600 mb-6 leading-relaxed blog-content">
                                {settings.about_nanacare_desc ? (
                                    <div dangerouslySetInnerHTML={{ __html: settings.about_nanacare_desc }} />
                                ) : (
                                    "Our Nanacare line was specifically designed to address the real challenges new mothers face, from cooler bags to storage cups."
                                )}
                            </div>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                    Insulated cooler bags for on-the-go feeding
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                    Storage cups for organized meal prep
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-gray-800 text-center mb-16">Our Values</h2>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center group p-6 rounded-2xl transition hover:bg-white hover:shadow-xl hover:shadow-purple-500/5">
                            <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Quality</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We never compromise on quality. Every product is carefully selected and tested.
                            </p>
                        </div>

                        <div className="text-center group p-6 rounded-2xl transition hover:bg-white hover:shadow-xl hover:shadow-blue-500/5">
                            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Care</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We care deeply about our customers' well-being.
                            </p>
                        </div>

                        <div className="text-center group p-6 rounded-2xl transition hover:bg-white hover:shadow-xl hover:shadow-purple-600/5">
                            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Innovation</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We continuously innovate to solve real problems.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Founder's Message */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-8">A Message from the Founder</h2>
                    <blockquote className="text-xl text-gray-600 italic leading-relaxed mb-8 blog-content">
                        {settings.about_founder_message ? (
                             <div dangerouslySetInnerHTML={{ __html: settings.about_founder_message }} />
                        ) : (
                            "\"When I founded NG windsong Kenya LTD, I wanted to create more than just products – I wanted to create solutions that make a real difference in people's lives.\""
                        )}
                    </blockquote>
                    <p className="text-lg text-gray-600">
                        <strong className="text-gray-800">{settings.about_founder_name || 'The Founder'}</strong> 
                    </p>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-gray-800 mb-6">Join Our Community</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Discover our products and experience the difference.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={'/products'} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-purple-200 transition duration-300">
                            Explore Our Products
                        </Link>
                        <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-200 transition duration-300">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
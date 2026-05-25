import { Suspense } from "react";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ContextProvider from "@/app/lib/ContextProvider";
import Popup from "@/app/UI/Popup";
import Header from "@/app/UI/Menus";
import Footer from "@/app/UI/Footer";
import Cart from "@/app/UI/Cart";
// import Overlays from "@/app/UI/Overlays";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import PageTracker from "@/app/components/PageTracker";
import GoogleTag from "@/app/components/GoogleTag";


const outfit = Outfit({ 
  subsets: ["latin"], 
  weight: ['300', '400', '500', '600', '700'], 
  style: 'normal',
  display: 'swap' 
});

export const metadata = {
  title: {
    default: "Buy Healthy Oats & Nanacare Products in Kenya | ngwindsongk",
    template: "%s | ngwindsongk"
  },
  description: "Buy premium healthy oats in Nairobi, Kenya. Steel-cut oats, jumbo oats, oat flour, and Nanacare products for new mothers — cooler bags, storage cups, and breastmilk essentials. Shop online with delivery across Kenya.",
  keywords: [
    "buy oats Kenya",
    "buy oats Nairobi",
    "healthy oats Kenya",
    "steel-cut oats Kenya",
    "jumbo oats Nairobi",
    "oat flour Kenya",
    "buy oats online Kenya",
    "nanacare Kenya",
    "baby products Nairobi",
    "new mother products Kenya",
    "cooler bags Kenya",
    "breastmilk storage bags",
    "healthy breakfast Kenya",
    "organic oats Nairobi",
    "oats delivery Nairobi"
  ],
  authors: [{ name: "Jennifer", url: "https://ngwindsongk.com" }],
  creator: "Jennifer - Founder of ngwindsongk",
  publisher: "ngwindsongk",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ngwindsongk.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ngwindsongk.com',
    siteName: 'ngwindsongk',
    title: 'Buy Healthy Oats & Nanacare Products in Kenya | ngwindsongk',
    description: 'Buy premium healthy oats in Nairobi, Kenya. Steel-cut oats, jumbo oats, oat flour, and Nanacare products for new mothers. Shop online with delivery across Kenya.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'ngwindsongk - Healthy Living and Motherhood Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ngwindsongk - Healthy Oats & Nanacare Products',
    description: 'Premium healthy oats and thoughtful products for new mothers. Quality nutrition and practical solutions.',
    images: ['/logo.png'],
    creator: '@ngwindsongk',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

import { AuthProvider } from "@/src/context/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6D31ED" />
        <meta name="msapplication-TileColor" content="#6D31ED" />
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Nairobi" />
        <meta name="geo.position" content="-1.2921;36.8219" />
        <meta name="ICBM" content="-1.2921, 36.8219" />

        {/* Preload Hero Banners */}
        <link rel="preload" as="image" href="/carousel/OatsPoster.webp" fetchPriority="high" />

        <link rel="preconnect" href="https://api.ngwindsongk.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <GoogleTag />



        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ngwindsongk",
              "url": "https://ngwindsongk.com",
              "logo": "https://ngwindsongk.com/logo.png",
              "description": "Buy premium healthy oats and Nanacare products in Kenya. Steel-cut oats, jumbo oats, oat flour, and essentials for new mothers. Delivery across Nairobi and Kenya.",
              "foundingDate": "2024",
              "founder": {
                "@type": "Person",
                "name": "Jennifer",
                "jobTitle": "Founder"
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Nairobi",
                "addressCountry": "KE"
              },
              "areaServed": {
                "@type": "Country",
                "name": "Kenya"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://ngwindsongk.com/contact"
              },
              "sameAs": [
                "https://facebook.com/ngwindsongk",
                "https://instagram.com/ngwindsongk",
                "https://twitter.com/ngwindsongk"
              ]
            })
          }}
        />
      </head>
      <body suppressHydrationWarning className={`${outfit.className} lg:text-sm 2xl:text-base`}>
      <Analytics/>
      <SpeedInsights />
        <AuthProvider>
            <Suspense fallback={null}>
              <PageTracker />
            </Suspense>
            <ContextProvider>
              <Header />
              <div className="fixed z-50 bottom-[140px] md:bottom-24 right-[3vw] lg:right-[0.5vw] 2xl:right-[3vw] w-fit h-fit">
                  <Cart />
              </div>
              <a href="https://wa.me/254718156421" aria-label="Chat on WhatsApp" className="block fixed z-50 bottom-[80px] md:bottom-10 right-[3vw] lg:right-[0.5vw] 2xl:right-[3vw] icon-[logos--whatsapp-icon] w-12 h-12 md:w-14 md:h-14">
              </a>
              {children}
            </ContextProvider>
          </AuthProvider>
        <Footer />
        <Popup />
        {/* <Overlays/> */}
      </body>
    </html>
  );
}

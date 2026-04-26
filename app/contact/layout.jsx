export const metadata = {
  title: "Contact Us - Get in Touch",
  description: "Contact ngwindsongk for questions about our healthy oats and Nanacare products. Located in Kilimani, Nairobi. Call +254712345678 or email sales@ngwindsongk.com",
  keywords: [
    "contact ngwindsongk",
    "customer service",
    "support",
    "healthy oats contact",
    "nanacare contact",
    "Nairobi location",
    "customer care"
  ],
  openGraph: {
    title: "Contact ngwindsongk - Get in Touch",
    description: "Get in touch with ngwindsongk for questions about our products and services.",
    images: ['/contactImage.jpg'],
  },
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactLayout({ children }) {
    return (
        <>
            {children}
        </>
    )
}
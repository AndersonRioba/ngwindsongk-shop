export const metadata = {
    title: "Buy Healthy Oats & Baby Care Products Online in Kenya",
    description: "Buy premium steel-cut oats, jumbo oats, and oat flour online in Nairobi, Kenya. Plus Nanacare baby care products — breastmilk storage bags, nursing covers, and feeding bottles. Fast delivery across Kenya.",
    keywords: [
      "buy oats Kenya",
      "buy oats Nairobi",
      "buy oats online Kenya",
      "steel-cut oats Kenya",
      "jumbo oats Nairobi",
      "oat flour Kenya",
      "healthy oats delivery Nairobi",
      "nanacare Kenya",
      "baby care products Kenya",
      "breastmilk storage bags Nairobi",
      "nursing covers Kenya",
      "baby feeding bottles Kenya",
      "healthy breakfast Kenya"
    ],
    openGraph: {
      title: "Buy Healthy Oats & Baby Care Products in Kenya | ngwindsongk",
      description: "Shop premium oats and Nanacare baby care products online in Nairobi. Steel-cut oats, jumbo oats, oat flour, and essentials for new mothers. Delivery across Kenya.",
      images: ['/logo.png'],
    },
    alternates: {
      canonical: '/',
    },
  }

export default function HomeLayout({children}){
    return(
        <main className="bg-[#fcfcfb]">
            {children}
        </main>
    )
}

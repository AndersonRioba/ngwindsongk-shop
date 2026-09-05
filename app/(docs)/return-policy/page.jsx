import Link from "next/link";

export const metadata = {
  title: "Return & Refund Policy | NGWindsong Kenya",
  description: "Official Return and Refund Policy for NGWindsong Kenya Ltd. Learn about our inspection guidelines, damaged goods replacement, refund procedures, and customer support.",
  alternates: {
    canonical: "/return-policy",
  },
  openGraph: {
    title: "Return & Refund Policy | NGWindsong Kenya",
    description: "Learn about our return guidelines, damaged goods replacement policy, and refund procedures.",
    url: "https://ngwindsongk.com/return-policy",
    siteName: "NGWindsong Kenya",
    type: "website",
  },
};

export default function ReturnPolicyPage() {
  const returnPolicySchema = {
    "@context": "https://schema.org",
    "@type": "MerchantReturnPolicy",
    "name": "NGWindsong Kenya Return & Refund Policy",
    "url": "https://ngwindsongk.com/return-policy",
    "applicableCountry": "KE",
    "returnFees": "https://schema.org/ReturnShippingCustomerResponsibility",
    "refundType": "https://schema.org/FullRefund",
    "itemCondition": [
      "https://schema.org/NewCondition",
      "https://schema.org/DamagedCondition"
    ],
    "restockingFee": {
      "@type": "MonetaryAmount",
      "value": "0",
      "currency": "KES"
    },
    "merchantReturnLink": "https://ngwindsongk.com/return-policy"
  };

  return (
    <main className="min-h-screen bg-[#fafaf8] py-12 md:py-16">
      {/* Structured Data for Google Merchant Center & Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(returnPolicySchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-black/40 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-black">Return Policy</span>
        </nav>

        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary mb-4 border border-primary/20">
            Customer Care & Product Guarantee
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">
            Return & Refund Policy
          </h1>
          <p className="text-base md:text-lg text-black/60 max-w-2xl leading-relaxed">
            At NGWindsong Kenya Ltd, we stand firmly behind the quality of our products. If there is an issue with your order, our team is committed to assisting you quickly and transparently.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-black/45 mt-4 pt-4 border-t border-black/8">
            <span>Last Updated: September 2026</span>
            <span>•</span>
            <span>Applicable for all deliveries across Kenya</span>
          </div>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-5 rounded-2xl border border-black/6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-primary font-bold text-lg mb-3">
              🔍
            </div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">Prompt Inspection</h2>
            <p className="text-xs text-black/60 leading-relaxed">
              Please inspect your package immediately upon delivery.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg mb-3">
              ✓
            </div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">Quality Verification</h2>
            <p className="text-xs text-black/60 leading-relaxed">
              Timely review and verification for defective or incorrect orders.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg mb-3">
              KES
            </div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">M-Pesa Refunds</h2>
            <p className="text-xs text-black/60 leading-relaxed">
              Approved refunds disbursed within 2–5 business days.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-lg mb-3">
              24h
            </div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">Support Team</h2>
            <p className="text-xs text-black/60 leading-relaxed">
              Prompt response via WhatsApp or Phone within 24 hours.
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-black/6 shadow-sm space-y-10 text-gray-700 leading-relaxed text-sm md:text-base">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="text-primary font-mono text-base">01.</span>
              Order Inspection & Issue Reporting
            </h2>
            <p>
              We take great pride in the quality and careful packaging of our products. Please inspect your delivery immediately upon receipt. If an item arrives damaged, defective, or incorrect, please notify our customer support team as soon as possible so that we can review and assist.
            </p>
            <div className="bg-gray-50 rounded-2xl p-5 border border-black/5 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Eligible claim scenarios:</h3>
              <ul className="list-disc list-inside space-y-1.5 text-black/75 text-sm">
                <li>Products that arrived defective, crushed, damaged, or spoiled during transit.</li>
                <li>Incorrect items received (e.g., wrong size, wrong variation, or wrong product).</li>
                <li>Missing items or order quantity discrepancies.</li>
                <li>Unopened non-perishable goods in their original, sealed, tamper-evident packaging.</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="text-primary font-mono text-base">02.</span>
              Exceptions & Non-Returnable Items (Food Safety & Hygiene)
            </h2>
            <p>
              Because we specialize in wholesome health foods (oats, flours, seeds, nuts) and maternal/infant baby care essentials, certain items cannot be returned once opened in compliance with Kenyan public health and food safety standards:
            </p>
            <ul className="list-disc list-inside space-y-2 text-black/75">
              <li>
                <strong>Opened Food Products:</strong> Packets of oat flour, steel-cut oats, rolled oats, nuts, raisins, and seeds whose inner safety seal or packaging has been opened or unsealed cannot be returned unless verified defective upon arrival.
              </li>
              <li>
                <strong>Personal Hygiene & Baby Care:</strong> For sanitary reasons, opened breastmilk storage bags, silicone feeding nipples, or used nursing covers cannot be accepted back once unpacked, unless there is a manufacturer defect.
              </li>
              <li>
                <strong>Clearance or Final-Sale Items:</strong> Items explicitly marked as final clearance or promotional gift bundles.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="text-primary font-mono text-base">03.</span>
              Return Shipping & Drop-offs
            </h2>
            <p>
              Where a physical return of an eligible item is approved by our customer care team, goods must be returned or dropped off to our Nairobi fulfillment facility. Customers are responsible for return transport arrangements and costs, unless otherwise agreed directly with our support team. No restocking fees apply.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="text-primary font-mono text-base">04.</span>
              How to Report an Issue (Step-by-Step)
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  1
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">Contact Customer Support Promptly</h3>
                  <p className="text-sm text-black/70 mt-0.5">
                    Contact our customer care team via WhatsApp at <a href="https://wa.me/254718156421" className="text-primary font-semibold underline">+254 718 156 421</a> or email <a href="mailto:info@ngwindsongk.com" className="text-primary font-semibold underline">info@ngwindsongk.com</a> upon receiving your order. Please provide your order number, product name, and a clear photo or short video demonstrating the issue.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  2
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">Review & Verification</h3>
                  <p className="text-sm text-black/70 mt-0.5">
                    Our team reviews your inquiry within 24 hours. Once verified, we will advise on the appropriate resolution, including drop-off or exchange details.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  3
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">Resolution (Replacement or Refund)</h3>
                  <p className="text-sm text-black/70 mt-0.5">
                    Depending on the case and item availability, we will arrange a product replacement, store credit, or an approved refund to your original payment method.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="text-primary font-mono text-base">05.</span>
              Refund Processing & Timelines
            </h2>
            <p>
              Once a claim is reviewed and approved by our team, refunds are processed promptly:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-black/75">
              <li><strong>M-Pesa Payments:</strong> Refunded directly to your M-Pesa phone number within <strong>2 to 5 business days</strong>.</li>
              <li><strong>Credit / Debit Card:</strong> Reversed to your card issuer within <strong>3 to 7 business days</strong> depending on your bank's clearance schedule.</li>
              <li><strong>Direct Bank Transfer:</strong> Processed within <strong>2 to 4 business days</strong>.</li>
            </ul>
            <p className="text-xs text-black/55">
              You will receive an SMS/WhatsApp or email confirmation with the transaction reference as soon as the refund is executed.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="text-primary font-mono text-base">06.</span>
              Order Cancellations
            </h2>
            <p>
              If you wish to cancel an order, please contact us immediately. Orders cancelled prior to courier dispatch from our Nairobi fulfillment center will receive an immediate refund. Once an order is with the delivery courier, it is subject to our standard delivery and inspection guidelines upon arrival.
            </p>
          </section>

          {/* Contact Box */}
          <div className="mt-8 pt-8 border-t border-black/8 bg-gray-50 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help with an Order?</h3>
            <p className="text-sm text-black/60 mb-6">
              Our dedicated support team is on standby to assist you with any questions or order issues.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="https://wa.me/254718156421?text=Hello%20NGWindsong,%20I%20would%20like%20assistance%20with%20my%20order"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm"
              >
                Chat on WhatsApp
              </a>
              <a
                href="tel:+254718156421"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-primary bg-white text-primary font-bold text-xs uppercase tracking-wider hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                Call: +254 718 156 421
              </a>
              <a
                href="mailto:info@ngwindsongk.com?subject=Order%20Inquiry"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-black/15 bg-white text-gray-800 font-bold text-xs uppercase tracking-wider hover:bg-black/5 transition-all shadow-sm"
              >
                Email Support
              </a>
            </div>
            <div className="mt-5 text-xs text-black/45 space-y-1">
              <p><strong>Physical Address:</strong> Rashali GoDown, No. 2, Maasai Road, off Mombasa Road, Nairobi, Kenya</p>
              <p><strong>Business Hours:</strong> Monday to Saturday: 8:00 AM – 6:00 PM EAT</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

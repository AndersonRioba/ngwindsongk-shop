'use client'

import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Logo from "@/app/UI/Logo"
import useSWR from 'swr'
import { fetcher } from "@/app/lib/data"
import Image from "next/image"
import { getImageUrl } from "@/app/lib/utils/image"

export default function Footer() {
    const { data: response } = useSWR(['/settings', { group: 'footer' }], fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })
    const { data: brands } = useSWR(['/brands', {}], fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })
    const settings = response?.data || {}
    const pathname = usePathname()

    const aboutMenu = useMemo(() => {
        try {
            if (settings.footer_menu_about) return JSON.parse(settings.footer_menu_about)
        } catch (e) { console.error("About menu parse error", e) }
        return []
    }, [settings.footer_menu_about])

    const shopMenu = useMemo(() => {
        try {
            if (settings.footer_menu_shop) return JSON.parse(settings.footer_menu_shop)
        } catch (e) { console.error("Shop menu parse error", e) }
        return []
    }, [settings.footer_menu_shop])

    const consultantImg = getImageUrl(settings.consultant_image, null);

    return (
        <footer className="bg-[#f9f9f7] border-t border-black/8 mt-16">

            {/* ── Maternal Consultant Strip ─────────────────────── */}
            {pathname === '/' && (
                <div className="border-b border-black/6 bg-white/60">
                    <div className="mx-auto max-w-5xl px-6 md:px-10 py-10">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-7">

                            {/* Circle portrait */}
                            <div className="relative shrink-0">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg shadow-primary/10 ring-2 ring-white">
                                    {consultantImg ? (
                                        <Image
                                            src={consultantImg}
                                            alt={settings.consultant_name || 'Lactation Expert'}
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                            <span className="icon-[solar--user-bold-duotone] w-8 h-8 text-primary/30" />
                                        </div>
                                    )}
                                </div>
                                {/* Online dot */}
                                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
                            </div>

                            {/* Bio + contacts */}
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                                    <span className="icon-[solar--heart-bold-duotone] w-3.5 h-3.5 text-primary" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Maternal & Childcare Support</span>
                                </div>
                                <h3 className="text-lg font-black text-gray-900 italic tracking-tight mb-1">
                                    {settings.consultant_name || 'Lactation Expert'}
                                </h3>
                                <p className="text-sm text-black/50 leading-relaxed font-medium">
                                    {settings.consultant_profile || 'A dedicated maternal and childcare consultant committed to supporting mothers at every stage — from pregnancy through early childhood.'}
                                </p>

                                {/* Contact row */}
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
                                    {settings.consultant_phone && (
                                        <a href={`tel:${settings.consultant_phone}`}
                                            className="flex items-center gap-2 text-sm font-bold text-black/60 hover:text-primary transition-colors">
                                            <span className="icon-[solar--phone-bold-duotone] w-4 h-4 text-primary/70" />
                                            {settings.consultant_phone}
                                        </a>
                                    )}
                                    {settings.consultant_email && (
                                        <a href={`mailto:${settings.consultant_email}`}
                                            className="flex items-center gap-2 text-sm font-bold text-black/60 hover:text-primary transition-colors">
                                            <span className="icon-[solar--letter-bold-duotone] w-4 h-4 text-primary/70" />
                                            {settings.consultant_email}
                                        </a>
                                    )}
                                    <a
                                        href={`https://wa.me/${settings.consultant_whatsapp || settings.footer_whatsapp || '254718156421'}`}
                                        className="flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 transition-colors">
                                        <span className="icon-[logos--whatsapp-icon] w-4 h-4" />
                                        Chat on WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Main Footer Grid ───────────────────────────────── */}
            <div className="mx-auto max-w-7xl px-6 md:px-10 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">

                {/* Col 1: Brand + General Contact */}
                <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
                    <div className="w-40">
                        <Logo />
                    </div>
                    <p className="text-sm italic text-black/40 -mt-2">Simply Delivered.</p>

                    <div className="flex flex-col gap-2 text-sm text-black/55 mt-1">
                        {settings.footer_phone && (
                            <a href={`tel:${settings.footer_phone}`} className="flex items-center gap-2 hover:text-black transition-colors group">
                                <span className="icon-[solar--phone-bold-duotone] w-4 h-4 shrink-0 text-primary group-hover:scale-110 transition-transform" />
                                {settings.footer_phone}
                            </a>
                        )}
                        {settings.footer_email && (
                            <a href={`mailto:${settings.footer_email}`} className="flex items-center gap-2 hover:text-black transition-colors group">
                                <span className="icon-[solar--letter-bold-duotone] w-4 h-4 shrink-0 text-primary group-hover:scale-110 transition-transform" />
                                {settings.footer_email}
                            </a>
                        )}
                        {settings.footer_address && (
                            <span className="flex items-start gap-2">
                                <span className="icon-[solar--map-point-bold-duotone] w-4 h-4 shrink-0 text-primary mt-0.5" />
                                {settings.footer_address}
                            </span>
                        )}
                        <div className="mt-3">
                            <p className="text-black/30 text-[10px] font-black uppercase tracking-widest mb-2">Need help?</p>
                            <a
                                href={`https://wa.me/${settings.footer_whatsapp || '254718156421'}`}
                                className="flex items-center gap-2 text-green-600 font-bold hover:text-green-700 transition-all hover:translate-x-1"
                            >
                                <span className="icon-[logos--whatsapp-icon] w-5 h-5 flex-shrink-0" />
                                Chat with us
                            </a>
                        </div>
                    </div>
                </div>

                {/* Col 2: About */}
                <div className="flex flex-col gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/35 mb-3">About</p>
                    {aboutMenu.map((item, i) => {
                        const href = item.link.startsWith('http') || item.link.startsWith('/') ? item.link : `/${item.link}`;
                        return (
                            <Link key={i} href={href} className="text-sm text-black/55 hover:text-primary hover:translate-x-1 transition-all duration-300 font-medium">
                                {item.label}
                            </Link>
                        )
                    })}
                </div>

                {/* Col 3: Shop */}
                <div className="flex flex-col gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/35 mb-3">Shop</p>
                    {shopMenu.map((item, i) => {
                        const href = item.link.startsWith('http') || item.link.startsWith('/') ? item.link : `/${item.link}`;
                        return (
                            <Link key={i} href={href} className="text-sm text-black/55 hover:text-primary hover:translate-x-1 transition-all duration-300 font-medium">
                                {item.label}
                            </Link>
                        )
                    })}
                </div>

                {/* Col 4: Partnerships + Social */}
                <div className="flex flex-col gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/35 mb-3">Partnerships</p>
                    <Link href="/register/distributor" className="text-sm text-black/55 hover:text-primary hover:translate-x-1 transition-all duration-300 font-medium">
                        Become our distributor
                    </Link>
                    <Link href="/register/influencer" className="text-sm text-black/55 hover:text-primary hover:translate-x-1 transition-all duration-300 font-medium">
                        Become our influencer
                    </Link>
                    <Link href="/about" className="text-sm text-black/55 hover:text-primary hover:translate-x-1 transition-all duration-300 font-medium mt-2">
                        About Us
                    </Link>

                    {/* Brand social links */}
                    {brands?.some(b => b.facebook_url || b.instagram_url) && (
                        <div className="mt-5 pt-5 border-t border-black/6 space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/35">Follow Our Brands</p>
                            {brands?.filter(b => b.facebook_url || b.instagram_url).map((brand, i) => (
                                <div key={i} className="flex items-center justify-between border-b border-black/4 pb-2 last:border-0">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-black/35">{brand.name}</p>
                                    <div className="flex gap-3">
                                        {brand.facebook_url && (
                                            <a href={brand.facebook_url}
                                                className="text-black/25 hover:text-[#1877F2] hover:scale-110 transition-all">
                                                <span className="icon-[logos--facebook] w-4 h-4" />
                                            </a>
                                        )}
                                        {brand.instagram_url && (
                                            <a href={brand.instagram_url}
                                                className="text-black/25 hover:text-[#E4405F] hover:scale-110 transition-all">
                                                <span className="icon-[skill-icons--instagram] w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bottom Bar ─────────────────────────────────────── */}
            <div className="border-t border-black/8">
                <div className="mx-auto max-w-7xl px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-black/35 font-bold uppercase tracking-widest">
                    <p>© {new Date().getFullYear()} NGWindsong Kenya Ltd. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/policy" className="hover:text-black transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-black transition-colors">Terms & Conditions</Link>
                        <Link href="/cookies" className="hover:text-black transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
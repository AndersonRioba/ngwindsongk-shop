'use client'

import useSWR from "swr"
import { fetcher } from "@/app/lib/data"

export default function RunningBanner() {
    const { data: response } = useSWR(['/settings', { group: 'running_banner' }], fetcher, { revalidateOnFocus: false })
    const settings = response?.data || {}

    const isActive = settings.rb_is_active !== 'false'
    const bannerText = settings.rb_text || "Free Delivery on orders over 5,000 Kshs"
    const iconPrimary = settings.rb_icon_primary || "icon-[mdi--truck-fast-outline]"
    const iconSecondary = settings.rb_icon_secondary || "icon-[solar--scooter-linear]"

    // Force Tailwind JIT to compile these dynamic icon classes
    const _safeListIcons = [
        "icon-[mdi--truck-fast-outline]",
        "icon-[mdi--truck-fast]",
        "icon-[mdi--bike-fast]",
        "icon-[solar--scooter-linear]",
        "icon-[fluent--vehicle-truck-profile-24-regular]",
        "icon-[fluent--gift-24-regular]",
        "icon-[fluent--tag-24-regular]",
        "icon-[fluent--clock-24-regular]",
        "icon-[fluent--star-24-regular]",
        "icon-[ph--airplane-tilt]",
    ];

    if (!isActive) return null;

    return (
        <div className="bg-white text-primary text-xs lg:text-sm font-bold tracking-widest py-1 md:py-1.5 overflow-hidden flex items-center">
            <div className="flex animate-marquee-css whitespace-nowrap items-center w-max">
                {/* We double the content to create a seamless loop. `w-max` and `translateX(-50%)` handle the repeating smoothly */}
                {[...Array(6)].map((_, i) => (
                    <span key={i} className="flex items-center gap-3 px-8 md:px-16">
                        {bannerText}
                        {i % 2 === 0 ? (
                            <span className={`${iconPrimary} w-5 h-5 md:w-6 md:h-6`} />
                        ) : (
                            <span className={`${iconSecondary} w-5 h-5 md:w-6 md:h-6`} />
                        )}
                    </span>
                ))}
            </div>
        </div>
    )
}


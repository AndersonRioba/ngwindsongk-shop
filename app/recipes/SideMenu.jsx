'use client'

import Link from "next/link"
import { Clock, Users, Star } from "lucide-react"
import useSWR from "swr"
import { fetcher } from "@/app/lib/data"

export default function SideMenu() {
    return (
        <section className="w-full space-y-8">
            {/* Categories */}
            <div className="bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-black/5 p-8 transition-transform hover:-translate-y-1 duration-500">
                <p className="text-xs uppercase tracking-[0.25em] text-black/45 mb-6 font-semibold">Categories</p>
                <div className="space-y-1">
                    {['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].map((category) => (
                        <Link
                            key={category}
                            href={`/recipes?category=${category}`}
                            className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#f6f7fb] hover:text-primary transition-all text-sm font-medium text-black/75 group"
                        >
                            <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                            <span className="icon-[heroicons--chevron-right] w-4 h-4 text-black/20 group-hover:text-primary transition-colors"></span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-primary rounded-3xl shadow-[0_16px_50px_rgba(24,119,242,0.2)] border border-white/10 p-8 text-white transition-transform hover:-translate-y-1 duration-500 relative overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
                
                <p className="text-xs uppercase tracking-[0.25em] text-white/70 mb-6 font-semibold relative z-10">Cooking Tips</p>
                
                <ul className="space-y-5 text-sm leading-relaxed text-white/95 relative z-10">
                    <li className="flex items-start gap-4">
                        <span className="icon-[solar--chef-hat-bold] mt-0.5 text-white/50 w-5 h-5 shrink-0"/> 
                        <span>Always measure ingredients accurately.</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <span className="icon-[solar--flame-bold] mt-0.5 text-white/50 w-5 h-5 shrink-0"/> 
                        <span>Preheat your oven before baking.</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <span className="icon-[solar--leaf-bold] mt-0.5 text-white/50 w-5 h-5 shrink-0"/> 
                        <span>Use fresh ingredients when possible.</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <span className="icon-[solar--clock-circle-bold] mt-0.5 text-white/50 w-5 h-5 shrink-0"/> 
                        <span>Don't rush the cooking process.</span>
                    </li>
                </ul>
            </div>
        </section>
    )
}
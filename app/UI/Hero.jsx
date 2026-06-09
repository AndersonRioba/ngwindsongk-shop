'use client'

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import useSWR from 'swr'
import { fetcher } from "@/app/lib/data"
import { getImageUrl } from "@/app/lib/utils/image";

export default function Carousel() {
  const { data: response } = useSWR(['/banners', { page: 'homepage' }], fetcher)
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [imgErrors, setImgErrors] = useState({});
  let pathname = usePathname();
  pathname = pathname.replaceAll('%20', ' ');
  pathname = pathname.replaceAll('%20', ' ');

  const dynamicBanners = response?.data || []
  
  const items = dynamicBanners.length > 0 
    ? dynamicBanners.map((banner, i) => (
        <div key={i} className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[1920/700]">
            <Image 
                src={imgErrors[i] ? getImageUrl("/carousel/OatsPoster.webp") : getImageUrl(banner.image)}
                onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))}
                fill
                sizes="100vw"
                className="object-cover block"
                alt={banner.title || 'Hero Banner'} 
                priority={i === 0}
            />
            {(banner.title || banner.description) && (
                <div className="absolute inset-0 bg-black/10 flex flex-col justify-center px-8 md:px-20 text-white">
                    <div className="max-w-4xl">
                        {banner.title && <h2 className="text-3xl md:text-5xl font-black mb-4 animate-in slide-in-from-left duration-700 tracking-tight drop-shadow-lg">{banner.title}</h2>}
                        {banner.description && <p className="text-sm md:text-lg max-w-2xl mb-8 animate-in slide-in-from-left duration-700 delay-100 font-medium drop-shadow-md">{banner.description}</p>}
                        {banner.link_url && (
                            <a href={banner.link_url} className="w-fit bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-dark transition-all hover:scale-105 shadow-xl animate-in slide-in-from-left duration-700 delay-200">
                                {banner.link_text || 'Explore Now'}
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    ))
    : [
        <div key="fall1" className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[1920/700]">
            <Image src={getImageUrl("/carousel/OatsPoster.webp")} fill sizes="100vw" className="object-cover block" alt="Oats" priority />
        </div>,
        <div key="fall2" className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[1920/700]">
            <Image src={getImageUrl("/carousel/nanacare.jpeg")} fill sizes="100vw" className="object-cover block" alt="Nanacare" />
        </div>,
        <div key="fall3" className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[1920/700]">
            <Image src={getImageUrl("/carousel/nutmill.jpeg")} fill sizes="100vw" className="object-cover block" alt="Nutmill" />
        </div>
    ];

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items.length, paused]);

  if (pathname === '/')
    return (
      <div
        className="relative w-full overflow-x-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Slides */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={index} className="w-full flex-shrink-0">
              {item}
            </div>
          ))}
        </div>

        {/* Dot indicators — lifted to sit above the search bar */}
        <div className="absolute bottom-28 md:bottom-32 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
          {items.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                index === activeIndex ? "bg-primary w-8" : "bg-white/40 w-3 hover:bg-white/60"
              }`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    );
  else return null;
}

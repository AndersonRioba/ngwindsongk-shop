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
  let pathname = usePathname();
  pathname = pathname.replaceAll('%20', ' ');

  const dynamicBanners = response?.data || []
  
  // Create items from dynamic banners or fallback to hardcoded ones
  const items = dynamicBanners.length > 0 
    ? dynamicBanners.map((banner, i) => (
        <div key={i} className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[1920/700]">
            <Image 
                src={getImageUrl(banner.image)}
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

  const handleNext = () => setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
  const handlePrev = () => setActiveIndex((prevIndex) => prevIndex === 0 ? items.length - 1 : prevIndex - 1);

  if (pathname === '/')
    return (
      <div
        className="relative w-full overflow-x-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
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
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {items.map((_, index) => (
            <button
              key={index}
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


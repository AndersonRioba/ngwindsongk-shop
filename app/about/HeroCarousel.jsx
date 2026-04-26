'use client'
import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/lib/data";
import { getImageUrl } from "@/app/lib/utils/image";

export default function HeroCarousel() {
  const { data: response } = useSWR(["/banners", { page: "about" }], fetcher);
  const [current, setCurrent] = useState(0);

  const images = response?.data?.map(b => getImageUrl(b.image)) || 
           ["/about_hero/about-hero-3.jpeg", "/about_hero/about-hero-2.jpeg", "/about_hero/about-hero-4.jpeg", "/about_hero/about-hero.jpg"].map(path => getImageUrl(path));

  const banners = response?.data || [];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
      {images.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{
            backgroundImage: `url('${src}')`,
            opacity: i === current ? 1 : 0,
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.55)" }}
      />
      <div className="relative z-10 text-center px-4">
        {banners[current]?.title ? (
           <>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
              <span className="text-purple-400">{banners[current].title}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              {banners[current].description}
            </p>
           </>
        ) : (
          <>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
              <span className="text-purple-400">Ng Windsong Kenya Ltd</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              Nurturing healthy living and supporting families through quality
              products and care.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

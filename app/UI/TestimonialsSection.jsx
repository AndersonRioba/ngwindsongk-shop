'use client'

import React, { useRef, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr'
import { fetcher } from '@/app/lib/data'

const TestimonialsSection = () => {
  const { data: response } = useSWR(['/reviews', {}], fetcher)
  const testimonials = useMemo(() => response?.data || [], [response]);
  
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!scrollRef.current || testimonials.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      const { current } = scrollRef;
      if (!current) return;

      const cardWidth = current.querySelector('.testimonial-card')?.offsetWidth || 400;
      const gap = 32; // gap-8 = 2rem = 32px
      const scrollAmount = cardWidth + gap;

      const isAtEnd = current.scrollLeft + current.offsetWidth >= current.scrollWidth - 10;

      if (isAtEnd) {
        current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [testimonials, isPaused]);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 px-4 bg-[#fcfcfc] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative px-4 md:px-0">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-black mb-6 tracking-tight">
            Happy Clients
          </h2>
          <div className="w-20 h-1.5 bg-primary mx-auto rounded-full mb-8" />
          <p className="text-black/60 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Don't just take our word for it. Here's what our community has to say about their experience with our products.
          </p>
        </div>
        
        {/* Horizontal Scroll Container */}
        <div 
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth"
        >
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="testimonial-card bg-white rounded-3xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-black/5 hover:-translate-y-2 transition duration-500 overflow-hidden relative group min-w-[320px] md:min-w-[380px] snap-center first:ml-0"
            >
              <div className="flex text-yellow-400 mb-6 space-x-1">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <p className="text-black/75 leading-relaxed font-medium min-h-[100px] mb-8 group-hover:text-black transition-colors">
                "{testimonial.comment}"
              </p>
              
              <div className="flex items-center pt-6 border-t border-black/5">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xl mr-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {testimonial.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-black text-lg">{testimonial.name}</h4>
                  <p className="text-xs text-black/40 font-bold uppercase tracking-widest mt-0.5">{testimonial.role}</p>
                </div>
              </div>

            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
            <Link 
              href="/reviews"
              className="bg-primary text-white font-bold tracking-widest uppercase text-[11px] py-4 px-10 rounded-2xl hover:bg-primary/90 inline-flex items-center gap-3 shadow-[0_12px_40px_rgba(24,119,242,0.25)] transition hover:shadow-[0_16px_50px_rgba(24,119,242,0.3)] hover:scale-105 active:scale-95 duration-200"
            >
                View all Reviews
                <span className="icon-[heroicons--arrow-right-20-solid] w-4 h-4" />
            </Link>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;

'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { fetcher } from '@/app/lib/data';
import { getImageUrl } from "@/app/lib/utils/image";
import BreadCrump from '@/app/UI/BreadCrump';
import Spinner from '@/app/UI/Spinner';
import ReviewModal from '@/app/UI/ReviewModal';

export default function ReviewsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: reviewsRes, isLoading, mutate } = useSWR(['/reviews', {}], fetcher);
    const reviews = reviewsRes?.data || [];

    if (isLoading) return <Spinner full={true} />;

    return (
        <main className="min-h-screen bg-[#fcfcfc] pb-24">
            <ReviewModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => {
                    mutate();
                }}
            />
            <div className="bg-white border-b border-black/5 pt-12 pb-24">
                <div className="max-w-7xl mx-auto px-6 md:px-10">
                    <BreadCrump page="Reviews" />
                    <div className="mt-12 text-center max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-black text-black mb-8 tracking-tighter leading-tight">
                            Customer <span className="text-primary tracking-normal ml-4">Reviews</span>
                        </h1>
                        <p className="text-black/50 text-xl font-medium leading-relaxed">
                            Discover honest experiences from our community of oat lovers and wellness enthusiasts.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12">
                {reviews.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-xl shadow-black/[0.02] border border-black/5">
                        <span className="icon-[solar--chat-dots-bold-duotone] w-20 h-20 text-gray-200 mb-6 mx-auto" />
                        <h3 className="text-2xl font-bold text-gray-400">No reviews yet. Be the first to share your experience!</h3>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {reviews.map((item) => (
                            <div 
                                key={item.id} 
                                className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/[0.02] border border-black/5 flex flex-col hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xl group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-md flex-shrink-0">
                                            {item.name ? item.name[0] : 'C'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-base">{item.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex text-yellow-400 space-x-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className={`w-3.5 h-3.5 fill-current ${i < (item.rating || 5) ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-gray-700 text-lg leading-relaxed font-medium grow mb-10 relative z-10">
                                    "{item.comment}"
                                </p>

                                {item.product && (
                                    <div className="flex items-center pt-6 border-t border-black/5">
                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden mr-4 shadow-sm border border-black/5">
                                            {item.product.image ? (
                                                <Image 
                                                    src={getImageUrl(item.product.image)} 
                                                    alt={item.product.name} 
                                                    width={56}
                                                    height={56}
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <span className="icon-[solar--box-bold-duotone] w-8 h-8 text-gray-200" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-0.5">Reviewed Product</p>
                                            <h4 className="font-black text-gray-900 text-sm line-clamp-1">{item.product.name}</h4>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <section className="max-w-7xl mx-auto px-6 md:px-10 mt-24">
                <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/30">
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Share Your Experience</h2>
                        <p className="text-white/80 text-lg max-w-xl mx-auto mb-12 font-medium">
                            Have our products made a difference in your life? We'd love to hear from you.
                        </p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-white text-primary font-black py-5 px-12 rounded-2xl hover:bg-gray-50 transition-all inline-block shadow-xl shadow-black/10 hover:scale-105"
                        >
                            Send Your Review
                        </button>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
                </div>
            </section>
        </main>
    );
}

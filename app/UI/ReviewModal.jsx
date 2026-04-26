'use client'

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { fetcher, postFetcher } from '@/app/lib/data';
import { getImageUrl } from '@/app/lib/utils/image';

const ReviewModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Info, 2: Preview
    const [formData, setFormData] = useState({
        brand_id: '',
        product_id: '',
        reviewer_name: '',
        rate: 5,
        review: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: brandsRes } = useSWR(['/brands', {}], fetcher);
    const { data: productsRes } = useSWR(['/products', {}], fetcher);

    const brands = useMemo(() => brandsRes?.data || brandsRes || [], [brandsRes]);
    const allProducts = useMemo(() => productsRes?.data || productsRes || [], [productsRes]);

    const filteredProducts = useMemo(() => {
        if (!formData.brand_id) return [];
        return allProducts.filter(p => p.brand_id == formData.brand_id || p.brand?.id == formData.brand_id);
    }, [formData.brand_id, allProducts]);

    const selectedProduct = useMemo(() => {
        return allProducts.find(p => p.id == formData.product_id);
    }, [formData.product_id, allProducts]);

    const handleSumbit = async () => {
        setIsSubmitting(true);
        try {
            const res = await postFetcher(['/reviews', {
                product_id: formData.product_id,
                reviewer_name: formData.reviewer_name,
                review: formData.review,
                rate: formData.rate
            }]);
            
            if (res.success) {
                setStep(3);
                mutate(['/reviews', {}]); // Refresh reviews globally if possible
                if (onSuccess) onSuccess();
                setFormData({
                    brand_id: '',
                    product_id: '',
                    reviewer_name: '',
                    rate: 5,
                    review: ''
                });
            } else {
                alert(res.message || 'Failed to submit review');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
                {/* Header */}
                <div className="bg-primary p-6 md:p-8 text-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <span className="icon-[fluent--dismiss-16-filled] w-5 h-5" />
                    </button>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-1">
                        {step === 1 ? 'Share Your Experience' : 'Review Preview'}
                    </h2>
                    <p className="text-white/60 text-sm font-medium">
                        {step === 1 ? 'Tell us what you think about our products.' : 'Verify your review before sending.'}
                    </p>
                </div>

                <div className="p-6 md:p-8">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Your Name</label>
                                    <input 
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                        value={formData.reviewer_name}
                                        onChange={e => setFormData({...formData, reviewer_name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Product Brand</label>
                                    <select 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium appearance-none text-sm"
                                        value={formData.brand_id}
                                        onChange={e => setFormData({...formData, brand_id: e.target.value, product_id: ''})}
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Select Product</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium appearance-none disabled:opacity-50 text-sm"
                                    value={formData.product_id}
                                    onChange={e => setFormData({...formData, product_id: e.target.value})}
                                    disabled={!formData.brand_id}
                                >
                                    <option value="">{formData.brand_id ? 'Select Product' : 'Select a brand first'}</option>
                                    {filteredProducts.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Rating</label>
                                <div className="flex gap-2">
                                    {[1,2,3,4,5].map(star => (
                                        <button 
                                            key={star}
                                            onClick={() => setFormData({...formData, rate: star})}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${formData.rate >= star ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-400/20' : 'bg-gray-100 text-gray-300'}`}
                                        >
                                            <span className="icon-[solar--star-bold] w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Your Review</label>
                                <textarea 
                                    rows={3}
                                    placeholder="Write your thoughts here..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none text-gray-700 text-sm"
                                    value={formData.review}
                                    onChange={e => setFormData({...formData, review: e.target.value})}
                                />
                            </div>

                            <button 
                                onClick={() => setStep(2)}
                                disabled={!formData.reviewer_name || !formData.product_id || !formData.review}
                                className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:shadow-none translate-y-0 active:scale-95 transition-transform text-sm uppercase tracking-widest"
                            >
                                Preview Review
                            </button>
                        </div>
                    ) : step === 2 ? (
                        <div className="space-y-8">
                            <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center font-black text-2xl shadow-lg">
                                            {formData.reviewer_name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">{formData.reviewer_name}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verified Customer</p>
                                        </div>
                                    </div>
                                    <div className="flex text-yellow-400 gap-0.5 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`${i < formData.rate ? 'icon-[solar--star-bold]' : 'icon-[solar--star-linear] text-gray-200'} w-4 h-4`} />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-gray-700 text-xl leading-relaxed font-medium mb-8 relative z-10 italic">
                                    "{formData.review}"
                                </p>

                                {selectedProduct && (
                                    <div className="flex items-center pt-6 border-t border-gray-200 relative z-10">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden mr-4 shadow-md border border-gray-100">
                                            {selectedProduct.image ? (
                                                <Image 
                                                    src={getImageUrl(selectedProduct.image, "/product-placeholder.png")} 
                                                    alt={selectedProduct.name}
                                                    fill
                                                    className="object-cover" 
                                                />
                                            ) : (
                                                <span className="icon-[solar--box-bold-duotone] w-8 h-8 text-gray-200" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Product Being Reviewed</p>
                                            <h4 className="font-black text-gray-900 text-base">{selectedProduct.name}</h4>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Decoration */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-12 -translate-y-12 blur-2xl" />
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-gray-100 text-gray-500 font-black py-5 rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Edit Details
                                </button>
                                <button 
                                    onClick={handleSumbit}
                                    disabled={isSubmitting}
                                    className="flex-[2] bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group active:scale-95"
                                >
                                    {isSubmitting ? 'Sending...' : 'Confirm & Submit'}
                                    {!isSubmitting && <span className="icon-[fluent--send-20-filled] w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-200/50">
                                <span className="icon-[solar--check-circle-bold] w-14 h-14" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Thank You!</h2>
                            <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-sm mx-auto mb-10">
                                Your review has been submitted successfully and is currently under <span className="text-primary font-bold">moderation</span>. 
                            </p>
                            <button 
                                onClick={() => {
                                    onClose();
                                    setStep(1);
                                    setFormData({
                                        brand_id: '',
                                        product_id: '',
                                        reviewer_name: '',
                                        rate: 5,
                                        review: ''
                                    });
                                }}
                                className="bg-primary text-white font-black py-4 px-12 rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 uppercase tracking-widest text-xs"
                            >
                                Back to Products
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;

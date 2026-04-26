'use client';

import { useState, useEffect } from 'react';
import { postData, getData } from '@/app/lib/data';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SuccessModal from '@/app/UI/SuccessModal';

export default function InfluencerRegister() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        social_handles: {},
        niche: [],
        brands_interested: [],
        products_interested: []
    });
    
    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const router = useRouter();

    const socialPlatforms = [
        { id: 'instagram', label: 'Instagram', icon: 'icon-[skill-icons--instagram]' },
        { id: 'tiktok', label: 'TikTok', icon: 'icon-[logos--tiktok-icon]' },
        { id: 'twitter', label: 'Twitter / X', icon: 'icon-[logos--twitter]' },
        { id: 'youtube', label: 'YouTube', icon: 'icon-[logos--youtube-icon]' },
        { id: 'facebook', label: 'Facebook', icon: 'icon-[logos--facebook]' },
        { id: 'other', label: 'Other', icon: 'icon-[solar--link-bold]' }
    ];

    const niches = [
        "Maternal & Childcare",
        "Healthy Living & Nutrition",
        "Family & Parenting",
        "Fitness & Wellness",
        "Cooking & Culinary Arts",
        "Lifestyle & Home"
    ];

    useEffect(() => {
        getData((res) => setBrands(res.data || res), '/brands');
        getData((res) => setProducts(res.data || res), '/products');
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSocialToggle = (platformId) => {
        const newHandles = { ...formData.social_handles };
        if (newHandles.hasOwnProperty(platformId)) {
            delete newHandles[platformId];
        } else {
            newHandles[platformId] = '';
        }
        setFormData({ ...formData, social_handles: newHandles });
    };

    const handleSocialHandleChange = (platform, value) => {
        setFormData({
            ...formData,
            social_handles: {
                ...formData.social_handles,
                [platform]: value
            }
        });
    };

    const handleNicheToggle = (niche) => {
        const currentNiches = formData.niche;
        const updatedNiches = currentNiches.includes(niche)
            ? currentNiches.filter(n => n !== niche)
            : [...currentNiches, niche];
        setFormData({ ...formData, niche: updatedNiches });
    };

    const handleBrandToggle = (brandName) => {
        const currentBrands = formData.brands_interested;
        const updatedBrands = currentBrands.includes(brandName)
            ? currentBrands.filter(b => b !== brandName)
            : [...currentBrands, brandName];
        
        let updatedProducts = formData.products_interested;
        if (currentBrands.includes(brandName)) {
            const brandProducts = products
                .filter(p => p.brand?.name === brandName)
                .map(p => p.name);
            updatedProducts = updatedProducts.filter(p => !brandProducts.includes(p));
        }

        setFormData({ 
            ...formData, 
            brands_interested: updatedBrands,
            products_interested: updatedProducts
        });
    };

    const handleProductToggle = (productName) => {
        const currentProducts = formData.products_interested;
        const updatedProducts = currentProducts.includes(productName)
            ? currentProducts.filter(p => p !== productName)
            : [...currentProducts, productName];
        setFormData({ ...formData, products_interested: updatedProducts });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const activeHandles = Object.fromEntries(
            Object.entries(formData.social_handles).filter(([_, v]) => v.trim() !== '')
        );

        if (Object.keys(activeHandles).length === 0) {
            setStatus('error');
            setMessage('Please select at least one social media platform and provide your handle.');
            return;
        }

        if (formData.niche.length === 0) {
            setStatus('error');
            setMessage('Please select at least one niche that fits your content.');
            return;
        }

        setStatus('loading');
        setMessage('');

        const apiData = {
            ...formData,
            social_handles: activeHandles
        };

        postData((response) => {
            if (response.success) {
                setStatus('success');
                setMessage(response.message);
            } else {
                setStatus('error');
                setMessage(response.message || 'Something went wrong. Please try again.');
            }
        }, apiData, '/register/influencer');
    };

    const filteredProducts = products.filter(product => 
        formData.brands_interested.includes(product.brand?.name)
    );

    const groupedProducts = formData.brands_interested.reduce((acc, brandName) => {
        acc[brandName] = filteredProducts.filter(p => p.brand?.name === brandName);
        return acc;
    }, {});

    return (
        <>
            <SuccessModal 
                isOpen={status === 'success'} 
                message={message} 
                type="influencer"
                onClose={() => setStatus('idle')}
            />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
                <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100">
                    <div className="mb-10 text-center">
                        <div className="inline-flex p-4 rounded-2xl bg-purple-50 text-purple-600 mb-4">
                            <span className="icon-[solar--magic-stick-3-bold] w-10 h-10"/>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight text-center">Become our influencer</h2>
                        <p className="text-gray-500 mt-2 font-medium">Collaborate with us and share the goodness</p>
                    </div>

                    {status === 'error' && (
                        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center gap-2">
                                <span className="icon-[solar--danger-bold] w-5 h-5"/>
                                <span className="font-bold">Error:</span> {message}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Full Name</label>
                                <input name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"/>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Phone Number</label>
                                <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder="07... or +254..." className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"/>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Email Address</label>
                                <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"/>
                            </div>

                            {/* Social Media Selection */}
                            <div className="md:col-span-2 p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 space-y-6">
                                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Step 1: Select Your Platforms</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {socialPlatforms.map(platform => (
                                        <button
                                            key={platform.id}
                                            type="button"
                                            onClick={() => handleSocialToggle(platform.id)}
                                            className={`flex items-center gap-2 p-3 rounded-2xl border transition-all ${formData.social_handles.hasOwnProperty(platform.id) ? 'bg-white border-purple-500 shadow-sm ring-2 ring-purple-50' : 'bg-white/50 border-gray-200 text-gray-400 hover:border-purple-200'}`}
                                        >
                                            <span className={`${platform.icon} w-5 h-5`}/>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{platform.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {Object.keys(formData.social_handles).length > 0 && (
                                    <div className="space-y-4 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-4">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Step 2: Enter Handles / Links</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {Object.keys(formData.social_handles).map(platformId => {
                                                const platform = socialPlatforms.find(p => p.id === platformId);
                                                return (
                                                    <div key={platformId} className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-purple-100 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-50 transition-all">
                                                        <div className="w-10 h-10 flex items-center justify-center bg-purple-50 rounded-xl text-purple-600">
                                                            <span className={`${platform?.icon} w-5 h-5`}/>
                                                        </div>
                                                        <input 
                                                            required
                                                            value={formData.social_handles[platformId]} 
                                                            onChange={(e) => handleSocialHandleChange(platformId, e.target.value)}
                                                            placeholder={platformId === 'other' ? 'Enter full link' : `@username`}
                                                            className="flex-1 bg-transparent py-2 text-sm font-bold outline-none placeholder:text-gray-300"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Niche Selection */}
                            <div className="md:col-span-2 p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 space-y-6">
                                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Your Niche / Focus Areas</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {niches.map(niche => (
                                        <label key={niche} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${formData.niche.includes(niche) ? 'bg-white border-purple-500 ring-2 ring-purple-50' : 'bg-white/50 border-gray-200 hover:border-purple-300'}`}>
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500 transition-all"
                                                checked={formData.niche.includes(niche)}
                                                onChange={() => handleNicheToggle(niche)}
                                            />
                                            <span className={`text-xs font-black uppercase tracking-widest ${formData.niche.includes(niche) ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {niche}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Brand/Product Selection */}
                            <div className="md:col-span-2 p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 space-y-8">
                                <div>
                                    <label className="block text-sm font-black text-gray-900 mb-4 uppercase tracking-wider">Brands you'd like to collaborate with</label>
                                    <div className="flex flex-wrap gap-3">
                                        {brands.map(brand => (
                                            <button
                                                key={brand.id}
                                                type="button"
                                                onClick={() => handleBrandToggle(brand.name)}
                                                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${formData.brands_interested.includes(brand.name) ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200 scale-105' : 'bg-white border-gray-200 text-gray-500 hover:border-purple-400'}`}
                                            >
                                                {brand.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {formData.brands_interested.length > 0 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                                        <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Specific Products of Interest</label>
                                        
                                        {formData.brands_interested.map(brandName => (
                                            <div key={brandName} className="space-y-3">
                                                <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <span className="w-8 h-[1px] bg-purple-200"/>
                                                    {brandName} Lineup
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {groupedProducts[brandName]?.map(product => (
                                                        <label key={product.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${formData.products_interested.includes(product.name) ? 'bg-white border-purple-500 ring-2 ring-purple-50' : 'bg-white/50 border-gray-200 hover:border-purple-300'}`}>
                                                            <input
                                                                type="checkbox"
                                                                className="w-5 h-5 rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500 transition-all"
                                                                checked={formData.products_interested.includes(product.name)}
                                                                onChange={() => handleProductToggle(product.name)}
                                                            />
                                                            <span className={`text-xs font-black uppercase tracking-widest ${formData.products_interested.includes(product.name) ? 'text-gray-900' : 'text-gray-400'}`}>
                                                                {product.name}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Password Fields */}
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Password</label>
                                    <input name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Confirm Password</label>
                                    <input name="password_confirmation" type="password" required value={formData.password_confirmation} onChange={handleChange} placeholder="••••••••" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"/>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-purple-600 text-white font-black rounded-[1.5rem] py-5 mt-4 hover:bg-purple-700 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 shadow-xl shadow-purple-200 text-lg tracking-tight"
                        >
                            {status === 'loading' ? 'Sending Application...' : 'Apply as Influencer'}
                        </button>
                    </form>

                    <div className="mt-10 text-center text-sm text-gray-500 font-bold">
                        Already a partner?{' '}
                        <Link href="/login" className="text-purple-600 hover:underline ml-1">
                            Log In
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

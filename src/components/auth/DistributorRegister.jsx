'use client';

import { useState, useEffect } from 'react';
import { postData, getData } from '@/app/lib/data';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SuccessModal from '@/app/UI/SuccessModal';

export default function DistributorRegister() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        business_name: '',
        location: '',
        tax_id: '',
        brands_interested: [],
        products_interested: []
    });
    
    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Fetch Brands and Products for selection
        getData((res) => setBrands(res.data || res), '/brands');
        getData((res) => setProducts(res.data || res), '/products');
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBrandToggle = (brandName) => {
        const currentBrands = formData.brands_interested;
        const updatedBrands = currentBrands.includes(brandName)
            ? currentBrands.filter(b => b !== brandName)
            : [...currentBrands, brandName];
        
        // When unselecting a brand, also remove its products from products_interested
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
        setStatus('loading');
        setMessage('');

        postData((response) => {
            if (response.success) {
                setStatus('success');
                setMessage(response.message);
            } else {
                setStatus('error');
                setMessage(response.message || 'Something went wrong. Please try again.');
            }
        }, formData, '/register/distributor');
    };

    // Filter products based on selected brands
    const filteredProducts = products.filter(product => 
        formData.brands_interested.includes(product.brand?.name)
    );

    // Group filtered products by brand
    const groupedProducts = formData.brands_interested.reduce((acc, brandName) => {
        acc[brandName] = filteredProducts.filter(p => p.brand?.name === brandName);
        return acc;
    }, {});

    return (
        <>
            <SuccessModal 
                isOpen={status === 'success'} 
                message={message} 
                type="distributor"
                onClose={() => setStatus('idle')}
            />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
                <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100">
                    <div className="mb-10 text-center">
                        <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-4">
                            <span className="icon-[solar--shop-2-bold] w-10 h-10"/>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Become our Distributor</h2>
                        <p className="text-gray-500 mt-2 font-medium">Apply to join our premium partner network</p>
                    </div>

                    {status === 'error' && (
                        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center gap-2">
                                <span className="icon-[solar--danger-bold] w-5 h-5"/>
                                <span className="font-bold">Error:</span> {message}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Business Name</label>
                                <input name="business_name" required value={formData.business_name} onChange={handleChange} placeholder="Official Business Name" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"/>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Your Full Name</label>
                                <input name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"/>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Phone Number</label>
                                <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder="07... or +254..." className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"/>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Email Address</label>
                                <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="business@example.com" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"/>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Business Location</label>
                                <input name="location" required value={formData.location} onChange={handleChange} placeholder="City, Area" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"/>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Tax ID / KRA PIN</label>
                                <input name="tax_id" required value={formData.tax_id} onChange={handleChange} placeholder="KRA PIN (Required)" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"/>
                            </div>

                            {/* Selection Sections */}
                            <div className="md:col-span-2 p-6 rounded-[2rem] bg-gray-50/50 border border-gray-100 space-y-8">
                                <div>
                                    <label className="block text-sm font-black text-gray-900 mb-4 uppercase tracking-wider">1. Select Brands of Interest</label>
                                    <div className="flex flex-wrap gap-3">
                                        {brands.map(brand => (
                                            <button
                                                key={brand.id}
                                                type="button"
                                                onClick={() => handleBrandToggle(brand.name)}
                                                className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all border ${formData.brands_interested.includes(brand.name) ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25 scale-105' : 'bg-white border-gray-200 text-gray-500 hover:border-primary/50'}`}
                                            >
                                                {brand.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {formData.brands_interested.length > 0 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">2. Select Specific Products</label>
                                        
                                        {formData.brands_interested.map(brandName => (
                                            <div key={brandName} className="space-y-3">
                                                <h4 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                                    <span className="w-8 h-[1px] bg-primary/20"/>
                                                    {brandName} Products
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {groupedProducts[brandName]?.map(product => (
                                                        <label key={product.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${formData.products_interested.includes(product.name) ? 'bg-white border-primary ring-2 ring-primary/5' : 'bg-white/50 border-gray-200 hover:border-primary/30'}`}>
                                                            <input
                                                                type="checkbox"
                                                                className="w-5 h-5 rounded-lg border-gray-300 text-primary focus:ring-primary transition-all"
                                                                checked={formData.products_interested.includes(product.name)}
                                                                onChange={() => handleProductToggle(product.name)}
                                                            />
                                                            <span className={`text-sm font-bold ${formData.products_interested.includes(product.name) ? 'text-gray-900' : 'text-gray-500'}`}>
                                                                {product.name}
                                                            </span>
                                                        </label>
                                                    ))}
                                                    {groupedProducts[brandName]?.length === 0 && (
                                                        <p className="text-xs text-gray-400 italic px-2">No products found for this brand.</p>
                                                    )}
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
                            className="w-full bg-primary text-white font-black rounded-[1.5rem] py-5 mt-4 hover:bg-primary/95 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 shadow-xl shadow-primary/25 text-lg tracking-tight"
                        >
                            {status === 'loading' ? 'Submitting Application...' : 'Apply as Distributor'}
                        </button>
                    </form>

                    <div className="mt-10 text-center text-sm text-gray-500 font-bold">
                        Looking for standard customer account?{' '}
                        <Link href="/register" className="text-primary hover:underline ml-1">
                            Join here
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

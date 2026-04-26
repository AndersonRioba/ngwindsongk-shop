'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SuccessModal({ isOpen, message, title, type = 'distributor', onClose }) {
    const router = useRouter();
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Delay unrendering for exit animation
            const timer = setTimeout(() => setIsRendered(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isRendered) return null;

    const config = {
        distributor: {
            icon: 'icon-[solar--check-circle-bold]',
            color: 'text-green-500',
            bgColor: 'bg-green-50',
            accentColor: 'bg-green-100',
            title: title || 'Application Received!'
        },
        influencer: {
            icon: 'icon-[solar--magic-stick-3-bold]',
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
            accentColor: 'bg-purple-100',
            title: title || 'Magic in Progress!'
        }
    };

    const activeConfig = config[type] || config.distributor;

    return (
        <div 
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'bg-black/60 backdrop-blur-sm opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0'}`}
        >
            <div 
                className={`bg-white max-w-md w-full rounded-[2.5rem] p-10 text-center shadow-2xl transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-10 opacity-0'}`}
            >
                <div className={`w-24 h-24 ${activeConfig.bgColor} rounded-full flex items-center justify-center mx-auto mb-8 relative`}>
                    <div className={`absolute inset-0 ${activeConfig.accentColor} rounded-full animate-ping opacity-20`}/>
                    <span className={`${activeConfig.icon} w-16 h-16 ${activeConfig.color} relative z-10`}/>
                </div>
                
                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                    {activeConfig.title}
                </h2>
                <p className="text-gray-500 leading-relaxed mb-10 px-4 font-medium">
                    {message || "We've received your application. Our team will review your details and get back to you shortly."}
                </p>
                
                <div className="space-y-3">
                    <button 
                        onClick={() => {
                            onClose?.();
                            router.push('/');
                        }}
                        className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 transform active:scale-[0.98]"
                    >
                        Back to Home
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-100 transition-all transform active:scale-[0.98]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

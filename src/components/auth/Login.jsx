'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/src/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAdminUrl } from "@/app/lib/urls";

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithToken, user, token, isAdmin, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get('token');

  // Handle SSO token from URL
  useEffect(() => {
    if (urlToken && !token) {
      loginWithToken(urlToken);
    }
  }, [urlToken, token, loginWithToken]);

  // Redirect if already logged in
  useEffect(() => {
    if (!isAuthLoading && token && user) {
      if (isAdmin) {
        window.location.href = `${getAdminUrl()}/login?token=${token}`;
      } else {
        router.push('/');
      }
    }
  }, [user, token, isAdmin, isAuthLoading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone || !password) {
      setError('All fields are required.');
      return;
    }

    setIsLoading(true);
    const result = await login(phone, password);
    setIsLoading(false);

    if (result.success) {
      if (result.user?.role === 'admin' || result.user?.role === 'superadmin' || result.user?.role === 'super_admin') {
        window.location.href = `${getAdminUrl()}/login?token=${result.token}`;
      } else {
        router.push('/');
      }
    } else {
      setError(result.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f5f5f3]">
      {/* Left side: Branding / Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
            <Image 
                src="/carousel/OatsPoster.webp" 
                alt="Healthy Oats" 
                fill 
                className="object-cover opacity-80 mix-blend-overlay"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 p-12 text-white max-w-lg">
          <Link href="/" className="inline-block mb-12 hover:scale-105 transition-transform">
             <div className="bg-white p-3 rounded-2xl w-fit">
                <Image src="/logo.png" alt="ngwindsongk" width={120} height={40} className="object-contain" />
             </div>
          </Link>
          <h1 className="text-5xl font-black tracking-tight mb-6 leading-tight">Welcome back to better shopping.</h1>
          <p className="text-lg text-white/80 font-medium">Access your account to view past orders, track deliveries, and discover new healthy essentials.</p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 relative">
        <div className="absolute top-6 left-6 lg:right-10 lg:left-auto">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors group">
                <span className="icon-[heroicons--arrow-left] w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Store
            </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
            <div className="lg:hidden mb-10 flex justify-center">
                <Link href="/">
                    <Image src="/logo.png" alt="ngwindsongk" width={140} height={50} className="object-contain" />
                </Link>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Sign In</h2>
                    <p className="text-gray-500 mt-2 font-medium">Welcome back! Please enter your details.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm font-medium animate-in slide-in-from-top-2">
                        <span className="icon-[heroicons--exclamation-circle] w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                        <div className="relative flex items-center">
                            <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-4 pr-3 border-r border-gray-200 bg-gray-50 rounded-l-xl">
                                <span className="text-sm font-semibold text-gray-600">+254</span>
                            </div>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="712 345 678"
                                className="w-full pl-[4.5rem] pr-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                        <div className="relative flex items-center">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                <span className={`w-5 h-5 block ${showPassword ? 'icon-[heroicons--eye-slash]' : 'icon-[heroicons--eye]'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white font-bold rounded-xl py-4 hover:bg-primary/90 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm font-medium text-gray-500">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

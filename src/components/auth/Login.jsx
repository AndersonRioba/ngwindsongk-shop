'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/src/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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
        console.log('Admin detected, redirecting to admin');
        window.location.href = `${process.env.NEXT_PUBLIC_ADMIN_URL}/login?token=${token}`;
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
        console.log('Login success - Admin detected, redirecting to 3001');
        window.location.href = `http://localhost:3001/login?token=${result.token}`;
      } else {
        router.push('/');
      }
    } else {
      setError(result.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-dark px-4 py-12">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0712345678"
              className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold rounded-xl py-4 mt-6 hover:bg-primary/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Join Us
          </Link>
        </div>
      </div>
    </div>
  );
}

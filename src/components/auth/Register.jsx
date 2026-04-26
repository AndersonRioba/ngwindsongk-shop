'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, user, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    console.log('Shop Register state check:', { isAuthLoading, token, hasUser: !!user, role: user?.role });
    if (!isAuthLoading && token && user) {
      if (user?.role === 'admin' || user?.role === 'super_admin') {
        console.log('Admin detected at shop register, redirecting to admin panel...');
        window.location.href = `http://localhost:3001/login?token=${token}`;
      } else {
        console.log('Regular user detected at register, going home...');
        router.push('/');
      }
    }
  }, [user, token, isAuthLoading, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const { name, phone, password, confirmPassword } = formData;

    if (!name || !phone || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const result = await register(name, phone, password, confirmPassword);
    setIsLoading(false);

    if (result.success) {
      if (result.user?.role === 'admin' || result.user?.role === 'super_admin') {
        window.location.href = `http://localhost:3001/login?token=${result.token}`;
      } else {
        router.push('/');
      }
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-dark px-4 py-12">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Join Us</h2>
          <p className="text-gray-500 mt-2">Create your account to start shopping</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
            <input
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 0712345678"
              className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold rounded-xl py-4 mt-6 hover:bg-primary/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

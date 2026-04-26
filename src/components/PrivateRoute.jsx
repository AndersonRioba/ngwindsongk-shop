'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/src/hooks/useAuth';
import Spinner from '@/app/UI/Spinner';

export default function PrivateRoute({ children }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return <Spinner full={true} />;
  }

  if (!token) {
    return null;
  }

  return children;
}

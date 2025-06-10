'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBitcoinAuth } from '@/hooks/useBitcoinAuth';
import { Loader2 } from 'lucide-react';

interface BitcoinProtectedRouteProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

export function BitcoinProtectedRoute({ 
  children, 
  fallbackUrl = '/auth/login' 
}: BitcoinProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useBitcoinAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackUrl);
    }
  }, [isAuthenticated, isLoading, router, fallbackUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying wallet authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
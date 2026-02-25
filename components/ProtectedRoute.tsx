'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { FaSpinner } from 'react-icons/fa';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (!authApi.isAuthenticated()) {
        router.push('/login');
        setIsChecking(false);
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = authApi.getUserRole();
        if (!userRole || !allowedRoles.includes(userRole)) {
          router.push('/');
          setIsChecking(false);
          return;
        }
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [router, allowedRoles]);

  // Only show loading after hydration is complete
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-railway-red-700" />
      </div>
    );
  }

  // Don't render children until authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

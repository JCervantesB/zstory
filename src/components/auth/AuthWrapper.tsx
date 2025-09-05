"use client";

import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const { data: session, isPending } = useSession();

  // Show loading spinner while checking session
  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-300">Cargando...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the protected content
  if (session) {
    return <>{children}</>;
  }

  // If user is not authenticated, redirect to sign-in page
  if (fallback) {
    return <>{fallback}</>;
  }

  // Redirect to the dedicated sign-in page
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/sign-in';
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-gray-300">Redirigiendo a la página de autenticación...</p>
      </div>
    </div>
  );
}

// Hook to check if user is authenticated
export function useAuth() {
  const { data: session, isPending } = useSession();
  
  return {
    user: session?.user || null,
    isAuthenticated: !!session,
    isLoading: isPending,
  };
}
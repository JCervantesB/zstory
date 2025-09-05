"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { User as DbUser } from "@/db/schema";

// Tipo para el usuario de la sesión que puede tener propiedades parciales
type SessionUser = {
  id: string;
  email: string;
  name: string;
  characterName?: string | null;
  characterLastName?: string | null;
  characterDescription?: string | null;
  characterSpecialty?: string | null;
  characterImageUrl?: string | null;
  characterVisualPrompt?: string | null;
  image?: string | null;
  emailVerified?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

interface CharacterRedirectWrapperProps {
  children: React.ReactNode;
  requiresCharacter?: boolean; // Si true, requiere que el usuario tenga un personaje
  redirectTo?: string; // URL personalizada de redirección
}

export function CharacterRedirectWrapper({ 
  children, 
  requiresCharacter = false,
  redirectTo 
}: CharacterRedirectWrapperProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && session) {
      const user = session.user as SessionUser;
      const hasCharacter = user?.characterName && user.characterName.trim() !== '';
      const currentPath = pathname;

      // Debug logs temporales
      console.log('🔍 CharacterRedirectWrapper Debug:');
      console.log('- requiresCharacter:', requiresCharacter);
      console.log('- user:', user);
      console.log('- characterName:', user?.characterName);
      console.log('- hasCharacter:', hasCharacter);
      console.log('- current path:', currentPath);

      // Si estamos en una página que requiere personaje pero el usuario no lo tiene
      if (requiresCharacter && !hasCharacter) {
        const targetUrl = redirectTo || '/create-character';
        // Evitar redirección si ya estamos en la página de destino
        if (currentPath !== targetUrl) {
          console.log('🔄 Redirecting to:', targetUrl, '(requires character but user has none)');
          router.push(targetUrl);
        }
        return;
      }

      // Si estamos en una página que NO requiere personaje pero el usuario SÍ lo tiene
      if (!requiresCharacter && hasCharacter) {
        const targetUrl = redirectTo || '/dashboard';
        // Evitar redirección si ya estamos en la página de destino
        if (currentPath !== targetUrl) {
          console.log('🔄 Redirecting to:', targetUrl, '(user has character, should go to dashboard)');
          router.push(targetUrl);
        }
        return;
      }

      console.log('✅ No redirection needed');
    }
  }, [session, isPending, router, requiresCharacter, redirectTo, pathname]);

  // Show loading spinner while checking session
  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-300">Verificando estado del personaje...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, this should be handled by AuthWrapper
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">No autenticado...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook para verificar el estado del personaje
export function useCharacterStatus() {
  const { data: session, isPending } = useSession();
  
  const user = session?.user as DbUser | undefined;
  const hasCharacter = user?.characterName && user.characterName.trim() !== '';
  
  return {
    user,
    hasCharacter,
    isLoading: isPending,
    isAuthenticated: !!session,
  };
}
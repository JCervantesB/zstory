'use client';

import { Button } from '@/components/ui/button';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Home, LogIn, LogOut, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

interface NavigationHeaderProps {
  title?: string;
  subtitle?: string;
  showBackToHome?: boolean;
  className?: string;
}

export function NavigationHeader({ 
  title = "🧟 ZOMBIE STORY", 
  subtitle,
  showBackToHome = true,
  className = ""
}: NavigationHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada exitosamente');
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  const handleDashboard = () => {
    router.push('/dashboard');
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <div className={`bg-card border-b border-border ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <Link href="/" className="flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="Zombie Story Logo" 
                width={80} 
                height={80} 
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-accent font-mono pixel-text">{title}</h1>
              {subtitle && (
                <p className="text-sm md:text-base text-muted-foreground font-mono">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
            {/* Back to Home Button */}
            {showBackToHome && (
              <Button 
                onClick={handleHome}
                variant="outline" 
                size="sm" 
                className="border-border text-foreground hover:bg-orange-500 hover:text-white hover:border-orange-500 w-full sm:w-auto font-mono pixel-button transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                <span className="sm:inline">Inicio</span>
              </Button>
            )}

            {/* Conditional buttons based on session */}
            {session ? (
              <>
                {/* Dashboard Button */}
                <Button 
                  onClick={handleDashboard}
                  variant="outline" 
                  size="sm" 
                  className="border-secondary text-secondary w-full sm:w-auto font-mono pixel-button transition-colors"
                >
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  <span className="sm:inline">Dashboard</span>
                </Button>
                
                {/* Sign Out Button */}
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  size="sm" 
                  className="border-destructive text-destructive w-full sm:w-auto font-mono pixel-button transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="sm:inline">Cerrar Sesión</span>
                </Button>
              </>
            ) : (
              /* Sign In Button */
              <Button 
                onClick={handleSignIn}
                variant="outline" 
                size="sm" 
                className="border-secondary text-green-400 hover:bg-orange-500 hover:text-white hover:border-orange-500 w-full sm:w-auto font-mono pixel-button transition-colors"
              >
                <LogIn className="w-4 h-4 mr-2" />
                <span className="sm:inline">Iniciar Sesión</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
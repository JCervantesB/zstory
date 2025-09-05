"use client";

import { signOut } from "@/lib/auth-client";
import { useAuth } from "./AuthWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

interface UserProfileProps {
  showCard?: boolean;
  className?: string;
}

export function UserProfile({ showCard = true, className }: UserProfileProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const content = (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.image || undefined} alt={user.name || "Usuario"} />
          <AvatarFallback className="bg-red-600 text-white">
            {user.name ? getUserInitials(user.name) : <User className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-gray-200">
            {user.name || "Superviviente"}
          </p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
      </div>
      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        className="border-gray-600 text-gray-300 hover:bg-gray-800"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Salir
      </Button>
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg text-red-500">Perfil del Superviviente</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

// Compact version for navigation bars
export function UserProfileCompact() {
  return <UserProfile showCard={false} className="p-2" />;
}
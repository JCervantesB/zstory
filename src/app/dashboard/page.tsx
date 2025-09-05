"use client";

import { useState } from "react";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { CharacterRedirectWrapper } from "@/components/auth/CharacterRedirectWrapper";
import { EditCharacterModal } from "@/components/character/EditCharacterModal";
import { SessionHistory } from "@/components/game/session-history";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type { User as DbUser } from "@/db/schema";
import { Button } from "@/components/ui/button";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, BookOpen, Edit, MessageCircle, LogOut, Gamepad2, History, Globe } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

function CharacterDashboardContent() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser] = useState<SessionUser | null>(session?.user as SessionUser);
  const [activeTab, setActiveTab] = useState("adventures");
  const router = useRouter();

  const user = currentUser || (session?.user as SessionUser);

  const handleStartStoryChat = async () => {
    setLoading(true);
    try {
      // Redirigir a story-chat sin sesión para mostrar la pantalla de bienvenida
      router.push('/story-chat');
    } catch (error) {
      console.error('Error starting story chat:', error);
      toast.error('Error al iniciar el chat de historia');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    router.push(`/story-chat?sessionId=${sessionId}`);
  };

  const handleNewSession = () => {
    router.push('/story-chat');
  };

  const handleEditCharacter = () => {
    setIsEditModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada exitosamente');
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const handleSaveCharacter = async (updatedData: Partial<DbUser>) => {
    try {
      const response = await fetch('/api/update-character', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Personaje actualizado exitosamente');
        setIsEditModalOpen(false);

        // Force page reload to refresh session data
        setTimeout(() => {
          window.location.reload();
        }, 1000); // Small delay to show the toast
      } else {
        toast.error(data.error || 'Error al actualizar el personaje');
      }
    } catch (error) {
      console.error('Error updating character:', error);
      toast.error('Error al actualizar el personaje');
    }
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors: { [key: string]: string } = {
      "Médico": "bg-secondary",
      "Ingeniero": "bg-primary",
      "Soldado": "bg-destructive",
      "Científico": "bg-accent",
      "Superviviente": "bg-primary"
    };
    return colors[specialty] || "bg-muted";
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty) {
      case "Médico":
        return "🏥";
      case "Ingeniero":
        return "🔧";
      case "Soldado":
        return "⚔️";
      case "Científico":
        return "🧪";
      case "Superviviente":
        return "🎯";
      default:
        return "🧟";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧟‍♂️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Cargando...</h1>
          <p className="text-muted-foreground">Preparando tu perfil de superviviente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="text-2xl md:text-3xl">
                <Image src="/logo.png" alt="Zombie Story Logo" width={80} height={80} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-accent font-mono pixel-text">DASHBOARD ZOMBIE</h1>
                <p className="text-sm md:text-base text-muted-foreground font-mono">Centro de Control del Superviviente</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
              <Button
                onClick={handleEditCharacter}
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-muted w-full sm:w-auto"
              >
                <Edit className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Editar Personaje</span>
                <span className="sm:hidden">Editar</span>
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-destructive text-destructive hover:bg-destructive/20 w-full sm:w-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card border-border">
            <TabsTrigger
              value="character"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-muted-foreground flex items-center justify-center px-2 py-2"
            >
              <User className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Personaje</span>
            </TabsTrigger>
            <TabsTrigger
              value="adventures"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-muted-foreground flex items-center justify-center px-2 py-2"
            >
              <Gamepad2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Aventuras</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="character" className="mt-4 md:mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Character Info Card */}
              <div className="lg:col-span-2">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white text-lg md:text-xl">
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-2 text-accent" />
                        Información del Personaje
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              Los cambios afectarán las nuevas escenas
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={handleEditCharacter}
                          variant="outline"
                          size="sm"
                          className="border-border text-foreground hover:bg-muted"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar Personaje
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 md:space-y-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-border">
                          <AvatarImage
                            src={user.characterImageUrl || undefined}
                            alt={`${user.characterName} ${user.characterLastName}`}
                          />
                          <AvatarFallback className="bg-muted text-foreground text-base sm:text-lg">
                            {user.characterName?.[0]}{user.characterLastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Character Details */}
                      <div className="flex-1 space-y-3 text-center sm:text-left">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {user.characterName} {user.characterLastName}
                          </h3>
                          <p className="text-muted-foreground text-sm">{user.email}</p>
                        </div>

                        {user.characterSpecialty && (
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2 items-center sm:items-start">
                            <span className="text-sm text-muted-foreground flex-shrink-0">Especialidad:</span>
                            <Badge className={`${getSpecialtyColor(user.characterSpecialty)} text-white w-fit mx-auto sm:mx-0`}>
                              {getSpecialtyIcon(user.characterSpecialty)} {user.characterSpecialty}
                            </Badge>
                          </div>
                        )}

                        {user.characterDescription && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Descripción:</p>
                            <p className="text-foreground text-sm leading-relaxed line-clamp-3">
                              {user.characterDescription.length > 150
                                ? `${user.characterDescription.substring(0, 150)}...`
                                : user.characterDescription}
                            </p>
                          </div>
                        )}



                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions Card */}
              <div className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <BookOpen className="w-5 h-5 mr-2 text-accent" />
                      Acciones Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => setActiveTab("adventures")}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      Ver Aventuras
                    </Button>
                    <Button
                      onClick={() => router.push('/gallery')}
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-muted"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Galería Pública
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="adventures" className="mt-6">
            <div className="space-y-6">
              {/* Nueva Aventura */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Gamepad2 className="w-5 h-5 mr-2 text-accent" />
                    Nueva Aventura
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                      <div className="flex-1 text-center mb-6 md:mb-0">
                        <div className="mx-auto">
                          <Image
                            src="/01.png"
                            alt="Zombie Story Loading"
                            width={100}
                            height={100}
                            className="h-28 w-28 sm:h-40 sm:w-40 lg:h-48 lg:w-48 mx-auto"
                          />
                        </div>
                      </div>
                      
                      {/* Contenido - alineado a la izquierda */}
                      <div className="flex-1 text-left">
                        <h3 className="text-xl font-bold text-white mb-3">
                          ¡Comienza tu Supervivencia!
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md text-sm">
                          Sumérgete en una historia interactiva de supervivencia zombie.
                          Cada decisión que tomes afectará tu destino.
                        </p>
                        <Button
                          onClick={handleStartStoryChat}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-2 w-full md:w-auto"
                          disabled={loading}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {loading ? 'Iniciando...' : 'Nueva Aventura'}
                        </Button>
                        <div className="text-left">
                          <p className="text-xs text-muted-foreground">
                            💡 Tu historia se guardará automáticamente
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Aventuras Existentes */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <History className="w-5 h-5 mr-2 text-accent" />
                    Continuar Aventuras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SessionHistory
                    onSessionSelect={handleSessionSelect}
                    onNewSession={handleNewSession}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Character Modal */}
      {user && (
        <EditCharacterModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user as unknown as DbUser}
          onSave={handleSaveCharacter}
        />
      )}
    </div>
  );
}

export default function CharacterDashboard() {
  return (
    <AuthWrapper>
      <CharacterRedirectWrapper requiresCharacter={true}>
        <CharacterDashboardContent />
      </CharacterRedirectWrapper>
    </AuthWrapper>
  );
}
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { forgetPassword, resetPassword } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<"request" | "reset">("request");
  const [token, setToken] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if there's a token in the URL
    const urlToken = searchParams.get("token");
    const errorParam = searchParams.get("error");
    
    if (urlToken) {
      setToken(urlToken);
      setStep("reset");
    }
    
    if (errorParam === "INVALID_TOKEN") {
      setError("El enlace de restablecimiento es inválido o ha expirado. Solicita uno nuevo.");
      setStep("request");
    }
  }, [searchParams]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await forgetPassword({
        email,
        redirectTo: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/auth/forgot-password`,
      });
      
      setSuccess("Se ha enviado un enlace de restablecimiento a tu email. Revisa tu bandeja de entrada.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al enviar el email de restablecimiento");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      if (!token) {
        throw new Error("Token de restablecimiento no encontrado");
      }

      await resetPassword({
        newPassword,
        token,
      });
      
      setSuccess("¡Contraseña restablecida exitosamente! Redirigiendo al inicio de sesión...");
      
      // Redirect to sign-in after 2 seconds
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black text-white font-mono flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center hover:opacity-80 transition-opacity">
            <Image src="/02.png" alt="Zombie Email Logo" width={200} height={150} />
          </div>
          <h1 className="text-3xl font-bold mt-4 mb-2 text-red-500 pixel-text">
            {step === "request" ? "RECUPERAR ACCESO" : "NUEVA CONTRASEÑA"}
          </h1>
          <p className="text-muted-foreground">
            {step === "request" 
              ? "Recupera el acceso a tu cuenta de superviviente"
              : "Establece una nueva contraseña para tu cuenta"
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border-4 border-accent p-8 rounded-lg">
          {step === "request" ? (
            <form onSubmit={handleRequestReset} className="space-y-6">
              {error && (
                <div className="bg-red-900 border border-red-500 p-3 rounded text-red-200 text-sm">
                  ⚠️ {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-900 border border-green-500 p-3 rounded text-green-200 text-sm">
                  ✅ {success}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-accent font-bold mb-2">
                  EMAIL DE SUPERVIVIENTE
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-background border-2 border-border rounded text-foreground focus:border-accent focus:outline-none pixel-input"
                  placeholder="tu@email.com"
                  required
                />
                <p className="text-muted-foreground text-sm mt-2">
                  Te enviaremos un enlace para restablecer tu contraseña
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors pixel-button transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⚡</span>
                    ENVIANDO...
                  </span>
                ) : (
                  "📧 ENVIAR ENLACE"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && (
                <div className="bg-red-900 border border-red-500 p-3 rounded text-red-200 text-sm">
                  ⚠️ {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-900 border border-green-500 p-3 rounded text-green-200 text-sm">
                  ✅ {success}
                </div>
              )}

              <div>
                <label htmlFor="newPassword" className="block text-accent font-bold mb-2">
                  NUEVA CONTRASEÑA
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 bg-background border-2 border-border rounded text-foreground focus:border-accent focus:outline-none pixel-input"
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-accent font-bold mb-2">
                  CONFIRMAR CONTRASEÑA
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 bg-background border-2 border-border rounded text-foreground focus:border-accent focus:outline-none pixel-input"
                  placeholder="Repite la nueva contraseña"
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors pixel-button transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⚡</span>
                    RESTABLECIENDO...
                  </span>
                ) : (
                  "🔐 RESTABLECER CONTRASEÑA"
                )}
              </button>
            </form>
          )}

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              ¿Recordaste tu contraseña?{" "}
              <Link href="/auth/sign-in" className="text-accent hover:underline font-bold">
                Volver al inicio de sesión
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .pixel-text {
          text-shadow: 2px 2px 0px rgba(0,0,0,0.8);
        }
        .pixel-button {
          image-rendering: pixelated;
          border-style: solid;
        }
        .pixel-input {
          font-family: 'Courier New', monospace;
        }
      `}</style>
    </div>
  );
}

// Loading component for Suspense fallback
function ForgotPasswordLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black text-white font-mono flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-black/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-8 shadow-2xl">
          <div className="text-center">
            <div className="animate-pulse text-red-400 text-lg mb-4">Cargando...</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
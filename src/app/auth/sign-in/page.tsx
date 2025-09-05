"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn.email({
        email,
        password,
      });
      
      // Redirect to character creation or dashboard after successful login
      router.push("/create-character");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black text-white font-mono flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="flex flex-col items-center hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="Zombie Story Logo" width={80} height={80} className="mb-4" />
            <span className="text-2xl font-bold text-accent font-mono pixel-text">
              ZOMBIE STORY
            </span>
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2 text-red-500 pixel-text">
            REGRESO AL APOCALIPSIS
          </h1>
          <p className="text-muted-foreground">
            Inicia sesión para continuar tu supervivencia
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border-4 border-accent p-8 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900 border border-red-500 p-3 rounded text-red-200 text-sm">
                ⚠️ {error}
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
            </div>

            <div>
              <label htmlFor="password" className="block text-accent font-bold mb-2">
                CONTRASEÑA
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-background border-2 border-border rounded text-foreground focus:border-accent focus:outline-none pixel-input"
                placeholder="Tu contraseña secreta"
                required
              />
              <div className="flex justify-between items-center mt-2">
                <label className="flex items-center text-sm text-muted-foreground">
                  <input type="checkbox" className="mr-2" />
                  Recordarme
                </label>
                <Link href="/auth/forgot-password" className="text-accent hover:underline text-sm">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors pixel-button transform hover:scale-105 disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⚡</span>
                  ACCEDIENDO...
                </span>
              ) : (
                "🔓 INICIAR SESIÓN"
              )}
            </button>
          </form>

          {/* Social Login Options */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-muted-foreground mb-4 text-sm">
              O accede usando:
            </p>
            <div className="space-y-3">
              <button className="w-full py-2 bg-background hover:bg-muted border border-border text-foreground rounded transition-colors flex items-center justify-center">
                <span className="mr-2">📧</span>
                Google (Próximamente)
              </button>
              <button className="w-full py-2 bg-background hover:bg-muted border border-border text-foreground rounded transition-colors flex items-center justify-center">
                <span className="mr-2">🐙</span>
                GitHub (Próximamente)
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              ¿Nuevo en el apocalipsis?{" "}
              <Link href="/auth/sign-up" className="text-accent hover:underline font-bold">
                Crea tu cuenta aquí
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
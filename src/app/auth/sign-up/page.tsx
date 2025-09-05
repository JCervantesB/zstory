"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Generate random username with format usuario#XXXX
  const generateRandomUsername = () => {
    const randomHash = Math.floor(1000 + Math.random() * 9000).toString();
    return `usuario#${randomHash}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Generate automatic username
      const autoUsername = generateRandomUsername();

      await signUp.email({
        email,
        password,
        name: autoUsername, // Use the auto-generated username as the name
      });
      
      // Redirect to character creation after successful signup
      router.push("/create-character");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta");
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
            ÚNETE A LA SUPERVIVENCIA
          </h1>
          <p className="text-muted-foreground">
            Crea tu cuenta para comenzar tu aventura apocalíptica
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-card border-4 border-accent p-8 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900 border border-red-500 p-3 rounded text-red-200 text-sm">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-accent font-bold mb-2">
                EMAIL DE CONTACTO
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
                CONTRASEÑA SEGURA
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-background border-2 border-border rounded text-foreground focus:border-accent focus:outline-none pixel-input"
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
              />
              <p className="text-muted-foreground text-xs mt-1">
                💡 Usa una contraseña fuerte para proteger tu progreso
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-destructive hover:bg-destructive/90 disabled:bg-muted text-destructive-foreground font-bold rounded-lg transition-colors pixel-button transform hover:scale-105 disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⚡</span>
                  CREANDO SUPERVIVIENTE...
                </span>
              ) : (
                "🧟‍♂️ CREAR CUENTA"
              )}
            </button>
          </form>

          {/* Social Login Options */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-muted-foreground mb-4 text-sm">
              O únete usando:
            </p>
            <div className="space-y-3">
              <button className="w-full py-2 bg-muted hover:bg-muted/80 border border-border text-foreground rounded transition-colors flex items-center justify-center">
                <span className="mr-2">📧</span>
                Google (Próximamente)
              </button>
              <button className="w-full py-2 bg-muted hover:bg-muted/80 border border-border text-foreground rounded transition-colors flex items-center justify-center">
                <span className="mr-2">🐙</span>
                GitHub (Próximamente)
              </button>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              ¿Ya eres un superviviente?{" "}
              <Link href="/auth/sign-in" className="text-accent hover:underline font-bold">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>🎮 Juego gratuito • 🤖 Narrativa IA • 🎨 Arte pixel</p>
          <p className="mt-2">
            Al registrarte, aceptas sobrevivir al apocalipsis zombie
          </p>
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
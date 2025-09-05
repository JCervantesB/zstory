"use client";

import Link from "next/link";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { CharacterRedirectWrapper } from "@/components/auth/CharacterRedirectWrapper";
import Image from "next/image";
import Typewriter from 'typewriter-effect';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black text-white font-mono">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div className="text-xl sm:text-2xl font-bold text-green-400 pixel-text text-center sm:text-left">
            <Image
              src="/logo.png"
              alt="Zombie Story Logo"
              width={150}
              height={40}
              className="mx-auto sm:mx-0"
            />
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 md:space-x-4">
            <Link 
              href="/gallery" 
              className="px-3 py-2 sm:px-4 border border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black transition-colors pixel-button text-center text-sm sm:text-base"
            >
              GALERÍA
            </Link>
            <Link 
              href="/auth/sign-in" 
              className="px-3 py-2 sm:px-4 border border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black transition-colors pixel-button text-center text-sm sm:text-base"
            >
              INICIAR SESIÓN
            </Link>
            <Link 
              href="/auth/sign-up" 
              className="px-3 py-2 sm:px-4 bg-red-600 hover:bg-red-700 text-white transition-colors pixel-button font-bold text-center text-sm sm:text-base"
            >
              REGISTRARSE
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-red-500 pixel-text animate-pulse">
            PIXEL APOCALYPSE
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Sobrevive al apocalipsis zombie en una aventura única generada por IA
          </p>
          <div className="text-lg text-gray-400 mb-12">
            🎮 Cada historia es única • 🤖 Narrativa generada por IA • 🎨 Arte pixel dinámico
          </div>
        </div>

        {/* Game Preview */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-orange-400 pixel-text">
              ¿TIENES LO NECESARIO PARA SOBREVIVIR?
            </h2>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start space-x-3">
                <span className="text-red-500 text-xl">💀</span>
                <div>
                  <h3 className="font-bold text-white">Historia Personalizada</h3>
                  <p>Cada decisión que tomes creará una narrativa única generada por IA</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">🎨</span>
                <div>
                  <h3 className="font-bold text-white">Arte Pixel Dinámico</h3>
                  <p>Imágenes pixel art generadas automáticamente para cada escena</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 text-xl">👥</span>
                <div>
                  <h3 className="font-bold text-white">Mundo Compartido</h3>
                  <p>Encuentra rastros de otros supervivientes en tu aventura</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mock Game Interface */}
          <div className="bg-black border-4 border-orange-400 p-6 rounded-lg">
            <div className="relative bg-gray-700 h-48 md:h-56 lg:h-64 rounded mb-4 overflow-hidden">
              <Image 
                src="https://res.cloudinary.com/dtzshajzs/image/upload/v1757030960/zombie-story/scenes/scene_3b7021fa-c4df-4635-83f2-b5507d6cbbce_0_1757030948935.webp"
                alt="Mock Game Interface"
                fill
                className="object-cover rounded"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="bg-gray-800 p-4 rounded mb-4">
              <div className="text-orange-400 text-sm mb-2">[ESCENA 1]</div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Te despiertas en un hospital abandonado. El silencio es ensordecedor, 
                solo interrumpido por gemidos distantes. Tu ropa está manchada de sangre...
              </p>
            </div>
            {/* Chat Input Simulation */}
            <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-xs text-gray-400">Tú escribes...</span>
              </div>
              <div className="bg-gray-800 border border-gray-600 rounded p-3 text-gray-300 text-sm min-h-[72px] flex items-start">
                 <Typewriter
                    onInit={(typewriter) => {
                      typewriter
                        .typeString('Buscar en los cajones del escritorio')
                        .pauseFor(2000)
                        .deleteAll()
                        .typeString('Revisar debajo de la cama')
                        .pauseFor(2000)
                        .deleteAll()
                        .typeString('Mirar por la ventana')
                        .pauseFor(2000)
                        .deleteAll()
                        .typeString('Abrir la puerta del armario')
                        .pauseFor(2000)
                        .deleteAll()
                        .start();
                    }}
                    options={{
                      loop: true,
                      delay: 75,
                      deleteSpeed: 50,
                      cursor: '|',
                      cursorClassName: 'text-orange-400'
                    }}
                  />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">Presiona Enter para enviar</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
            

          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-900 border-4 border-red-500 p-12 rounded-lg">
          <h2 className="text-4xl font-bold mb-6 text-red-500 pixel-text">
            ¡COMIENZA TU SUPERVIVENCIA!
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Crea tu personaje y sumérgete en una aventura apocalíptica única
          </p>
          <Link 
            href="/auth/sign-up"
            className="inline-block px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-lg transition-colors pixel-button transform hover:scale-105"
          >
            🧟‍♂️ CREAR CUENTA GRATIS
          </Link>
          <div className="mt-4 text-gray-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/sign-in" className="text-orange-400 hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-4xl mb-4">🎲</div>
            <h3 className="text-xl font-bold mb-2 text-orange-400">Decisiones Importantes</h3>
            <p className="text-gray-400">Cada elección afecta tu historia y supervivencia</p>
          </div>
          <div className="text-center p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-2 text-orange-400">Historias Infinitas</h3>
            <p className="text-gray-400">Juega múltiples partidas con narrativas diferentes</p>
          </div>
          <div className="text-center p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-4xl mb-4">💾</div>
            <h3 className="text-xl font-bold mb-2 text-orange-400">Guarda y Comparte</h3>
            <p className="text-gray-400">Guarda tu progreso y comparte tus aventuras</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black p-6 text-center text-gray-500">
        <p>&copy; 2025 Zombie Story: Pixel Apocalypse. Sobrevive si puedes.</p>
      </footer>

      <style jsx>{`
        .pixel-text {
          text-shadow: 2px 2px 0px rgba(0,0,0,0.8);
        }
        .pixel-button {
          image-rendering: pixelated;
          border-style: solid;
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  return (
    <AuthWrapper fallback={<HomePage />}>
      <CharacterRedirectWrapper requiresCharacter={false}>
        <HomePage />
      </CharacterRedirectWrapper>
    </AuthWrapper>
  );
}

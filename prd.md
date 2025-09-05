# 🧟‍♂️ PRD: Juego de Supervivencia Zombie con IA  
**Nombre del Proyecto:** *Zombie Story: Pixel Apocalypse*  
**Versión:** 1.0  
**Autor:** [JCervantesB](https://github.com/JCervantesB)  
**Fecha:** Septiembre 2025  

---

## 🎯 Visión del Producto

Crear un juego web de aventura conversacional basado en IA, donde cada jugador vive una historia única de supervivencia en un apocalipsis zombie. El juego combina texto narrativo generado por IA, imágenes pixel art dinámicas y referencias a otros jugadores como personajes secundarios, creando un mundo compartido aunque la experiencia sea individual.

---

## 🎮 Objetivo Principal

Ofrecer una experiencia inmersiva, personalizada y visualmente coherente, donde:
- El jugador toma decisiones que afectan su historia.
- La narrativa se genera dinámicamente con IA.
- Las imágenes pixel art acompañan cada escena.
- De forma aleatoria, el jugador encuentra rastros o interacciones con otros jugadores (personajes secundarios).
- Toda la historia se puede guardar, reanudar y compartir.

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js (App Router) |
| Estilo | Tailwind CSS + Pixel Art UI |
| Backend | Next.js API Routes |
| Autenticación | [Better Auth](https://better-auth.com/) |
| Base de datos | PostgreSQL con [Drizzle ORM](https://orm.drizzle.team/) |
| Almacenamiento de imágenes | [Cloudinary](https://cloudinary.com/) |
| Generación de contenido | Google Gemini (texto + imágenes) |
| Hosting | Vercel (recomendado) |

---

## 📂 Arquitectura del Proyecto
/app
/auth
/sign-in
/sign-up
/create-character
page.tsx
/game
page.tsx
/story
[id]/page.tsx
/shared
[id]/page.tsx
layout.tsx
page.tsx
/components
/Scene
Narrative.tsx
ImageDisplay.tsx
NPCBadge.tsx
/lib
/db.ts → Drizzle + DB
/auth.ts → Better Auth
/gemini.ts → Gemini API
/cloudinary.ts → Subida de imágenes
/gamePrompts.ts → Prompts para IA
/schema
users.ts
gameSessions.ts
gameScenes.ts
relations.ts


---

## 🗃️ Esquemas de Base de Datos (Drizzle ORM)

### `users` – Jugadores y sus personajes
```ts
{
  id: string; // Better Auth ID
  email: string;
  name: string;
  createdAt: Date;
  
  // Datos del personaje
  characterName: string;
  characterLastName: string;
  characterDescription: string; // ej. "hombre fuerte, barba larga, herido en la pierna"
  characterItems: string[]; // máx 5 objetos
  characterVisualPrompt: string; // "pixel art of a 35yo man with beard, plaid shirt, eye patch, 8-bit"
  characterImageUrl: string; // URL de Cloudinary
  
  // Estado del juego
  currentSessionId: string; // referencia a game_sessions
  isOnboarded: boolean; // si ya creó personaje
}

### game_sessions – Partidas del jugador
{
  id: string;
  userId: string;
  title: string; // opcional
  createdAt: Date;
  lastActive: Date;
  isCompleted: boolean;
}

### game_scenes – Escenas narrativas.
{
  id: string;
  sessionId: string;
  order: number; // orden en la historia
  narrativeText: string; // texto generado por IA
  imageUrl: string; // URL de imagen en Cloudinary
  secondaryCharacterId: string; // opcional: ID de otro jugador
  createdAt: Date;
}
```

## 🔁 Flujos Principales
1. Registro y Creación del Personaje
Usuario se registra con Better Auth.
Se redirige a /create-character.
Completa:
Nombre y apellido del personaje
Descripción física
Hasta 5 objetos que lleva
El sistema genera un characterVisualPrompt estandarizado.
Se llama a Gemini desde OpenRouter para generar una imagen Base64 del personaje.
La imagen se sube a Cloudinary.
Se guarda characterImageUrl y datos en users.
isOnboarded = true.

2. Iniciar una Partida
Usuario entra a /game.
Si no tiene sesión activa:
Se crea un nuevo game_session.
Se actualiza currentSessionId del usuario.
Se llama a Gemini desde OpenRouter con INITIAL_STORY.
Se genera imagen Base64 de la escena.
Se sube a Cloudinary.
Se guarda la primera escena en game_scenes.
Se muestra al jugador: texto + imagen.

3. Continuar la Historia
Jugador envía acción: "Buscar en el coche abandonado".
Backend recupera historial de escenas de la sesión.
Decide si incluir un personaje secundario (15% de probabilidad):
Busca un user aleatorio (excluyendo al actual).
Usa su characterVisualPrompt, descripción e items.
Llama a Gemini con CONTINUE_STORY, incluyendo contexto del secundario.
Genera nueva imagen Base64.
Sube a Cloudinary.
Guarda nueva escena en game_scenes.
Devuelve texto + imagen al frontend.

4. Reanudar o Compartir Historia
Usuario entra a /story/[id].
Se recuperan todas las escenas de game_scenes por sessionId.
Se muestra la historia en orden cronológico.
Opción: "Compartir" → genera enlace público: /shared/[id].

🖼️ Gestión de Imágenes
Todas las imágenes se generan con Google Gemini (modelo de imagen + texto) usando OpenRouter.
Se devuelven en Base64.
Se suben a Cloudinary mediante backend.
Solo se guarda la URL pública en la base de datos.
Formato: PNG, 16:9, estilo pixel art 8-bit.

🤖 IA: Google Gemini
Prompts Clave
INITIAL_STORY
`Genera escena inicial del apocalipsis zombie. Máximo 2 párrafos. Termina con pregunta de acción. Incluye línea "IMAGEN: [descripción en inglés]".` 

CONTINUE_STORY
`Continúa la historia basado en la acción del jugador. Si aplica, incluye un personaje secundario con su characterVisualPrompt. Máximo 2 párrafos. Termina con pregunta. Incluye "IMAGEN: [...]".`

GENERATE_IMAGE
`Usa: Generate a pixel art style image in 16:9 aspect ratio: ${description}. 8-bit retro aesthetic, limited palette, blocky pixels.`

### Diseño y Experiencia de Usuario
Estilo visual: pixel art retro, colores oscuros y saturados.
Tipografía: font-mono o fuente tipo terminal.
Cada escena muestra:
Texto narrativo
Imagen pixel art
(Opcional) Miniatura del personaje secundario
Barra de progreso: número de escenas
Botón: "Guardar y salir", "Compartir historia"

### 🚀 Requisitos Técnicos
Credenciales de Cloudinary en .env
Configuración de Drizzle ORM con PostgreSQL
Integración de Better Auth
Llave de API de Google Gemini
Función para subir Base64 a Cloudinary
Prompts estructurados para mantener coherencia narrativa y visual

### 🔮 Futuras Mejoras (V2)
Sistema de salud, hambre y moral
Inventario y crafting
Finales múltiples
Notificaciones: "Un jugador te encontró en su historia"
Modo "Diario" con entradas por fecha
Mapa generado por IA

### ✅ Estado Actual
Autenticación configurada (Better Auth)
Next.js + Drizzle listo
Esquemas de BD definidos
API de Gemini integrada
Cloudinary configurado
Frontend básico

### 📎 Anexos
Cloudinary Dashboard
Gemini API Docs
Better Auth Docs
Drizzle ORM Docs
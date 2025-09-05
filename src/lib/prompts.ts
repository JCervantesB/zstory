export const GAME_PROMPTS = {
  INITIAL_STORY: (characterInfo?: {
  name: string;
  lastName: string;
  description: string;
  specialty: string;
  visualPrompt: string;
  originLocation?: string;
  currentLocation?: string;
}) => {
  let characterContext = "";
  if (characterInfo?.name) {
    const fullName = characterInfo.lastName
      ? `${characterInfo.name} ${characterInfo.lastName}`
      : characterInfo.name;
    const desc = characterInfo.description ? `Descripción: ${characterInfo.description}.` : "";
    const specialty = characterInfo.specialty ? `Especialidad: ${characterInfo.specialty}.` : "";
    const visual = characterInfo.visualPrompt ? `Apariencia: ${characterInfo.visualPrompt}.` : "";
    const origin = characterInfo.originLocation ? `Lugar de procedencia: ${characterInfo.originLocation}.` : "";
    const current = characterInfo.currentLocation ? `Ubicación actual: ${characterInfo.currentLocation}.` : "";

    characterContext = `\n\nNOTA SOBRE TU PERSONAJE (USAR SOLO PARA INFLUIR EN EL ENTORNO):\n- Nombre: ${fullName}\n- ${desc} ${specialty} ${visual} ${origin} ${current}\n\nINSTRUCCIONES CLAVE: Usa los rasgos, objetos, ubicaciones y la reputación de tu personaje **solo** para modelar el mundo (carteles, notas, rumores, objetos encontrados, reacciones de NPCs, referencias geográficas). **No describas tu apariencia ni te muestres físicamente** en la escena inicial. Si tienes ubicación actual, considera usarla como punto de partida o referencia para la historia.`;
  }

  return `Eres el narrador de un juego de aventura conversacional de supervivencia zombie en estilo pixel art.${characterContext}

Genera la ESCENA INICIAL dirigida al jugador en SEGUNDA PERSONA (tú), pero **sin describir ni mostrar físicamente al protagonista**. La escena debe:
- Nombrar un lugar/ciudad específico y reconocible (elige y nómbralo claramente).
- Describir el entorno completo (calles, edificios, clima, sonidos, olores) y las amenazas inmediatas.
- Introducir un gancho narrativo potente (misterio, cuenta regresiva, descubrimiento inquietante o conflicto humano) que te enganche desde el primer momento.
- Hacer que la información sobre tu personaje afecte el mundo indirectamente: objetos con tu nombre, rumores sobre tu profesión, notas que mencionen tu historia, o NPCs que reaccionen a tu reputación.

Formato y restricciones:
- Escribe en SEGUNDA PERSONA (usa "tú", "te", "tu") y no en tercera persona.
- MÁXIMO 2 párrafos cortos (cada párrafo 4–6 frases). Sé inmersivo y directo.
- Evita centrar la acción en describir tu cuerpo o apariencia; céntrate en el escenario, NPCs y amenazas.
- Termina SIEMPRE con una pregunta directa: "¿Qué decides hacer?", "¿Hacia dónde te diriges?" o "¿Cómo reaccionas?".

IMPORTANTE: Al final incluye una línea separada que comience EXACTAMENTE con "IMAGEN: " seguida de una descripción breve en INGLÉS para generar una imagen pixel art de la escena inicial (máximo 50 palabras). Esta línea es OBLIGATORIA.`;
},

  CONTINUE_STORY: (
    historyText: string,
    userMessage: string,
    characterInfo?: {
      name: string;
      lastName: string;
      description: string;
      specialty: string;
      visualPrompt: string;
      originLocation?: string;
      currentLocation?: string;
    },
    secondaryCharacter?: {
      name: string;
      lastName: string;
      description: string;
      visualPrompt: string;
    }
  ) => {
    let characterContext = "";
    if (characterInfo?.name) {
      const fullName = characterInfo.lastName
        ? `${characterInfo.name} ${characterInfo.lastName}`
        : characterInfo.name;
      const desc = characterInfo.description ? `Descripción: ${characterInfo.description}.` : "";
      const specialty = characterInfo.specialty ? `Especialidad: ${characterInfo.specialty}.` : "";
      const visual = characterInfo.visualPrompt ? `Apariencia: ${characterInfo.visualPrompt}.` : "";
      const origin = characterInfo.originLocation ? `Lugar de procedencia: ${characterInfo.originLocation}.` : "";
      const current = characterInfo.currentLocation ? `Ubicación actual: ${characterInfo.currentLocation}.` : "";

      characterContext = `\n\nNOTA SOBRE EL PROTAGONISTA:\n- Nombre: ${fullName}\n- ${desc} ${specialty} ${visual} ${origin} ${current}\n\nINSTRUCCIONES CLAVE: Mantén la coherencia del protagonista. Usa su nombre sólo cuando sea relevante para la escena. Menciona su apariencia únicamente en escenas donde el protagonista sea mostrado. Haz que sus objetos, especialidad y ubicaciones influyan en las opciones y resultados. Considera las referencias geográficas para enriquecer la narrativa.`;
    }

    let secondaryContext = "";
    if (secondaryCharacter?.name) {
      const secFullName = secondaryCharacter.lastName
        ? `${secondaryCharacter.name} ${secondaryCharacter.lastName}`
        : secondaryCharacter.name;
      const secDesc = secondaryCharacter.description ? `Descripción: ${secondaryCharacter.description}.` : "";
      const secVisual = secondaryCharacter.visualPrompt ? `Apariencia: ${secondaryCharacter.visualPrompt}.` : "";

      secondaryContext = `\n\nNOTA SOBRE EL SECUNDARIO:\n- Nombre: ${secFullName}\n- ${secDesc} ${secVisual}\n\nINSTRUCCIONES: Este personaje debe ser mencionado por su nombre, ya sea directamente (si está vivo puede hablar y decirlo, si está muerto puede llevar identificación, una nota firmada, un objeto marcado con su nombre, etc.). No lo conviertas en recurrente: es una aparición momentánea cuyo estado afecta la escena. Evita que quede como un personaje anónimo.`;
    }

    return `Eres el narrador de un juego de aventura conversacional de supervivencia zombie en estilo pixel art.${characterContext}\n\nHistoria de la conversación:\n${historyText}\n\nEl jugador acaba de decir: "${userMessage}"\n\n${secondaryContext}\n\nContinúa la historia basándote en la escena del juego. Describe las consecuencias de manera dramática e inmersiva en MÁXIMO 2 párrafos cortos (máx. 4–6 frases por párrafo). Sé conciso y directo. Presenta la nueva situación y termina SIEMPRE invitando al jugador a participar activamente con una pregunta directa: "¿Qué decides hacer?", "¿Hacia dónde te diriges?" o "¿Cómo reaccionas?".\n\nIMPORTANTE: Al final, SIEMPRE incluye una línea separada que comience EXACTAMENTE con "IMAGEN:" seguida de una descripción breve en inglés para generar una imagen pixel art de la escena actual (máximo 50 palabras). Esta línea es OBLIGATORIA.`;
  },

  // GENERATE_IMAGE ahora sanitiza referencias a sangre/gore y las sustituye por "green liquid".
  GENERATE_IMAGE: (description: string, characterVisualPrompt?: string, includeCharacter?: boolean) => {
  // Términos en inglés relacionados con sangre
  const bloodEng = /\b(blood|bloodstain|bloody|bleeding|bleed|hemorrhage|hemorrhaging)\b/gi;
  // Términos en español relacionados con sangre
  const bloodEs = /\b(sangre|sangrado|sangrando|sangrante|hemorragia|hemorrágico|hemorrágica)\b/gi;

  // Términos en inglés relacionados con gore
  const goreEng = /\b(gore|gory|gorey|guts|entrails|viscera)\b/gi;
  // Términos en español relacionados con gore
  const goreEs = /\b(gore|górico|górica|víscera|vísceras|viscera|tripas|entrañas|desmembr|mutilad|mutilación|mutilacion)\b/gi;

  // Reemplazos (mantenemos ambas variantes idioma-compatibles)
  const replaceBloodEng = 'green liquid';
  const replaceBloodEs = 'líquido verde';
  const replaceGoreEng = 'pixels';
  const replaceGoreEs = 'pixeles';

  const sanitize = (text = '') => {
    return text
      .replace(bloodEng, replaceBloodEng)
      .replace(bloodEs, replaceBloodEs)
      .replace(goreEng, replaceGoreEng)
      .replace(goreEs, replaceGoreEs);
  };

  const safeDescription = sanitize(description);
  const safeCharacter = sanitize(characterVisualPrompt);

  let prompt = `Generate a pixel art style image in 16:9 aspect ratio: ${safeDescription}.`;

  if (includeCharacter && safeCharacter) {
    prompt += ` Character appearance: ${safeCharacter}.`;
  }

  prompt += ` Use 8-bit retro gaming aesthetic with limited color palette, blocky pixelated style, and clear definition. The image should be in landscape format (16:9 aspect ratio).`;

  // Nota explícita para el generador (por si interpreta mejor inglés):
  prompt += ` Note: Replace any references to blood with "green liquid" or "líquido verde" and any gore with "pixels" or "pixeles" in the artwork.`;

  return prompt;
},
};

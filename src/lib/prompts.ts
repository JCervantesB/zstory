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

      characterContext = `\n\nNOTA SOBRE TU PERSONAJE (USAR SOLO PARA INFLUIR EN EL ENTORNO):\n- Nombre: ${fullName}\n- ${desc} ${specialty} ${visual} ${origin} ${current}\n\nINSTRUCCIONES CLAVE: Usa rasgos, objetos, ubicaciones y reputación del personaje SOLO para modelar el mundo (carteles, pistas, rumores, objetos con nombres). **No muestres ni describas físicamente al protagonista en esta escena inicial.**`;
    }

    return `Eres el narrador de un juego de aventura conversacional de supervivencia zombie en estilo pixel art.${characterContext}

Genera la ESCENA INICIAL en SEGUNDA PERSONA (tú). La escena debe:
- Basarse en la ubicación: si existe characterInfo.currentLocation, usa esa ubicación como origen y descríbela detalladamente (calles, edificios, clima, sonidos, olores, atmósfera). Si no existe, elige y nombra una ciudad/ubicación creíble.
- Ser inmersiva: mostrar amenazas inmediatas, objetos, NPCs y un gancho narrativo potente (misterio, conflicto, cuenta regresiva).
- Usar la información del personaje solo indirectamente (pistas, notas, objetos, rumores).

Formato y restricciones:
- Máximo 2 párrafos cortos.
- Segunda persona. No describir el cuerpo ni mostrar físicamente al protagonista.
- Termina con UNA pregunta directa invitando a decidir: "¿Qué decides hacer?", "¿Hacia dónde te diriges?" o similar.

IMPORTANTE: Al final añade una línea separada que comience EXACTAMENTE con \`IMAGEN: \` seguida de una descripción breve en INGLÉS (máx. 200 palabras) para generar una imagen pixel art fiel al lugar. Evita palabras relacionadas con gore/sangre; si son necesarias sustituir por "green liquid" o "pixels".
Instead of: A grotesque scene with mutilated bodies and blood everywhere.
For example, use: A scene with pixelated figures representing bodies and green liquid stains everywhere.`;
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

      characterContext = `\n\nNOTA SOBRE EL PROTAGONISTA:\n- Nombre: ${fullName}\n- ${desc} ${specialty} ${visual} ${origin} ${current}\n\nINSTRUCCIONES CLAVE: A partir de ahora muestra coherentemente al protagonista cuando la escena lo requiera; su apariencia ${visual}, posición y acciones deben influir en la imagen y en las opciones. Usa su nombre solo si aporta claridad.`;
    }

    let secondaryContext = "";
    if (secondaryCharacter?.name) {
      const secFullName = secondaryCharacter.lastName
        ? `${secondaryCharacter.name} ${secondaryCharacter.lastName}`
        : secondaryCharacter.name;
      const secDesc = secondaryCharacter.description ? `Descripción: ${secondaryCharacter.description}.` : "";
      const secVisual = secondaryCharacter.visualPrompt ? `Apariencia: ${secondaryCharacter.visualPrompt}.` : "";

      secondaryContext = `\n\nNOTA SOBRE EL SECUNDARIO:\n- Nombre: ${secFullName}\n- ${secDesc} ${secVisual}\n\nINSTRUCCIONES: Menciona a este personaje por su nombre en la escena (si está vivo, habla o se presenta; si está muerto, indicativo en identificación, nota o marca en un objeto). No lo dejes anónimo.`;
    }

    /*
      Mejora clave: introducir "respiros" ocasionales.
      - Cuando la escena sea muy tensa o el jugador esté presionado, el narrador debe, en aproximadamente 1 de cada 3 continuaciones,
        insertar UN BREVE RESPIRO: una oración corta que alivie la tensión (ej.: sonido lejano, recuerdo breve, pequeño instante de calma, olor familiar).
      - El respiro debe ser breve (1 oración), evocador y en segunda persona, y luego reanudar la narrativa.
      - Esto busca mantener la inmersión pero reducir la sensación de acoso continuo.
    */

    return `Eres el narrador de un juego de aventura conversacional de supervivencia zombie en estilo pixel art.${characterContext}

Historia previa:
${historyText}

Última acción del jugador: "${userMessage}"${secondaryContext}

Continúa la historia describiendo las consecuencias inmediatas y la nueva situación. Sé dramático e inmersivo, en MÁXIMO 2 párrafos cortos (4–6 frases por párrafo). Ahora SÍ puedes mostrar y describir al protagonista en la escena (posición, gesto, ropa, arma u objeto relevante). Incluye opciones implícitas y termina con una pregunta directa para el jugador.

RESPIRADERO: Si la escena es intensa o el jugador parece presionado, en aproximadamente 1 de cada 5 respuestas inserta ANTES del segundo párrafo un único "respiro" (1 oración) en segunda persona que alivie momentáneamente la tensión — por ejemplo, un sonido distante que te recuerda a casa, una brisa fría que corta la adrenalina, o una breve memoria de algo cotidiano. Este respiro debe ser corto y poético, no resolver la tensión.

IMAGEN: Al final añade una línea separada que comience EXACTAMENTE con \`IMAGEN: \` seguida de una breve descripción EN INGLÉS para generar una imagen pixel art de la escena actual (máx. 200 palabras). La descripción debe:
- Ser fiel al personaje ${characterInfo?.visualPrompt} y al escenario (si el protagonista aparece, indícalo: pose, vestimenta, ángulo).
- Evitar términos gore/sangre; reemplaza referencias a sangre por "green liquid" y gore por "pixels" si aparecen.
- Ser lista para alimentar un generador de pixel art (pose, ambiente, aspecto general).`;
  },

  // GENERATE_IMAGE saneador: recibe descripción libre y devuelve prompt en inglés listo para modelo de imágenes
  GENERATE_IMAGE: (description: string, characterVisualPrompt?: string, includeCharacter?: boolean) => {
    // Patrones para sanitizar términos de sangre/gore (inglés y español)
    const bloodEng = /\b(blood|bloodstain|bloody|bleeding|bleed|hemorrhage|hemorrhaging)\b/gi;
    const bloodEs = /\b(sangre|sangrado|sangrando|sangrante|hemorragia|hemorrágico|hemorrágica)\b/gi;
    const goreEng = /\b(gore|gory|gorey|guts|entrails|viscera|tripes|disembowel|mutilat)\b/gi;
    const goreEs = /\b(gore|górico|górica|víscera|vísceras|tripas|entrañas|desmembr|mutilad|mutilación|mutilacion)\b/gi;

    const sanitize = (text = '') =>
      text
        .replace(bloodEng, 'green liquid')
        .replace(bloodEs, 'green liquid')
        .replace(goreEng, 'pixels')
        .replace(goreEs, 'pixels');

    const safeDescription = sanitize(description || '');
    const safeCharacter = sanitize(characterVisualPrompt || '');

    // Construir prompt en inglés conciso, listo para generador pixel art
    let prompt = `16:9 pixel art scene: ${safeDescription.trim()}.`;
    if (includeCharacter && safeCharacter) {
      prompt += ` Character: ${safeCharacter.trim()}.`;
    }
    prompt += ` 8-bit retro palette, clear silhouette, readable shapes, low-res blocky pixels. No realistic gore — use "green liquid" or "pixels" instead of blood/gore. Keep description short and specific (<=200 words).`;

    return prompt;
  },
};

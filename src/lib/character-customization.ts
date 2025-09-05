// Character customization options for avatar generation

export interface ClothingSet {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'casual' | 'military' | 'medical' | 'tactical' | 'survivor' | 'professional';
}

export interface GameItem {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'weapon' | 'tool' | 'medical' | 'survival' | 'communication' | 'protection';
  rarity: 'common' | 'uncommon' | 'rare';
}

export const CLOTHING_SETS: ClothingSet[] = [
  {
    id: 'casual_jeans',
    name: 'Ropa Casual',
    description: 'Jeans azules y camiseta cómoda blanca',
    prompt: 'wearing blue jeans and a casual white t-shirt',
    category: 'casual'
  },
  {
    id: 'military_fatigues',
    name: 'Uniforme Militar',
    description: 'Camuflaje militar completo',
    prompt: 'wearing military camouflage fatigues and combat boots',
    category: 'military'
  },
  {
    id: 'medical_scrubs',
    name: 'Bata Médica',
    description: 'Uniforme médico profesional',
    prompt: 'wearing medical scrubs and a white lab coat',
    category: 'medical'
  },
  {
    id: 'tactical_gear',
    name: 'Equipo Táctico',
    description: 'Chaleco táctico y pantalones cargo',
    prompt: 'wearing black tactical vest with cargo pants and utility belt',
    category: 'tactical'
  },
  {
    id: 'survivor_outfit',
    name: 'Ropa de Superviviente',
    description: 'Ropa resistente y práctica',
    prompt: 'wearing worn leather jacket, dark pants, and sturdy boots',
    category: 'survivor'
  },
  {
    id: 'business_attire',
    name: 'Traje Formal',
    description: 'Ropa de oficina elegante',
    prompt: 'wearing a business suit with dress shirt and tie',
    category: 'professional'
  },
  {
    id: 'mechanic_overalls',
    name: 'Overol de Mecánico',
    description: 'Ropa de trabajo industrial',
    prompt: 'wearing blue mechanic overalls with work boots',
    category: 'professional'
  },
  {
    id: 'hoodie_casual',
    name: 'Sudadera con Capucha',
    description: 'Estilo urbano relajado',
    prompt: 'wearing a dark hoodie with jeans and sneakers',
    category: 'casual'
  },
  {
    id: 'nurse_uniform',
    name: 'Traje de Enfermera',
    description: 'Uniforme médico de enfermería',
    prompt: 'wearing a white nurse uniform with comfortable shoes and a nurse cap',
    category: 'medical'
  },
  {
    id: 'clown_outfit',
    name: 'Traje de Payaso',
    description: 'Colorido traje de payaso',
    prompt: 'wearing a colorful clown costume with oversized shoes, red nose, and bright makeup',
    category: 'casual'
  },
  {
    id: 'farmer_clothes',
    name: 'Ropa de Granjero',
    description: 'Ropa de trabajo agrícola',
    prompt: 'wearing farmer overalls with a plaid shirt, work boots, and a straw hat',
    category: 'professional'
  }
];

export const GAME_ITEMS: GameItem[] = [
  // Weapons
  {
    id: 'baseball_bat',
    name: 'Bate de Béisbol',
    description: 'Arma cuerpo a cuerpo confiable',
    prompt: 'holding a wooden baseball bat',
    category: 'weapon',
    rarity: 'common'
  },
  {
    id: 'kitchen_knife',
    name: 'Cuchillo de Cocina',
    description: 'Cuchillo afilado multiusos',
    prompt: 'carrying a large kitchen knife',
    category: 'weapon',
    rarity: 'common'
  },
  {
    id: 'crowbar',
    name: 'Palanca',
    description: 'Herramienta y arma versátil',
    prompt: 'holding a red crowbar',
    category: 'weapon',
    rarity: 'uncommon'
  },
  {
    id: 'pistol',
    name: 'Pistola',
    description: 'Arma de fuego compacta',
    prompt: 'carrying a pistol in holster',
    category: 'weapon',
    rarity: 'rare'
  },
  
  // Tools
  {
    id: 'flashlight',
    name: 'Linterna',
    description: 'Iluminación en la oscuridad',
    prompt: 'carrying a tactical flashlight',
    category: 'tool',
    rarity: 'common'
  },
  {
    id: 'rope',
    name: 'Cuerda',
    description: 'Cuerda resistente de 10 metros',
    prompt: 'carrying coiled rope over shoulder',
    category: 'tool',
    rarity: 'common'
  },
  {
    id: 'multi_tool',
    name: 'Multiherramienta',
    description: 'Herramienta con múltiples funciones',
    prompt: 'carrying a multi-tool on belt',
    category: 'tool',
    rarity: 'uncommon'
  },
  {
    id: 'duct_tape',
    name: 'Cinta Adhesiva',
    description: 'Cinta resistente para reparaciones',
    prompt: 'carrying a roll of duct tape',
    category: 'tool',
    rarity: 'common'
  },
  
  // Medical
  {
    id: 'first_aid_kit',
    name: 'Botiquín de Primeros Auxilios',
    description: 'Kit médico básico',
    prompt: 'carrying a red first aid kit',
    category: 'medical',
    rarity: 'uncommon'
  },
  {
    id: 'bandages',
    name: 'Vendas',
    description: 'Vendas médicas estériles',
    prompt: 'carrying medical bandages',
    category: 'medical',
    rarity: 'common'
  },
  {
    id: 'antibiotics',
    name: 'Antibióticos',
    description: 'Medicamentos contra infecciones',
    prompt: 'carrying antibiotic pills',
    category: 'medical',
    rarity: 'rare'
  },
  
  // Survival
  {
    id: 'backpack',
    name: 'Mochila',
    description: 'Mochila grande para suministros',
    prompt: 'wearing a large survival backpack',
    category: 'survival',
    rarity: 'common'
  },
  {
    id: 'water_bottle',
    name: 'Botella de Agua',
    description: 'Botella reutilizable de agua',
    prompt: 'carrying a water bottle',
    category: 'survival',
    rarity: 'common'
  },
  {
    id: 'canned_food',
    name: 'Comida Enlatada',
    description: 'Alimentos no perecederos',
    prompt: 'carrying canned food supplies',
    category: 'survival',
    rarity: 'common'
  },
  {
    id: 'sleeping_bag',
    name: 'Saco de Dormir',
    description: 'Saco para descansar',
    prompt: 'carrying a rolled sleeping bag',
    category: 'survival',
    rarity: 'uncommon'
  },
  
  // Communication
  {
    id: 'walkie_talkie',
    name: 'Radio Portátil',
    description: 'Comunicación de corto alcance',
    prompt: 'carrying a walkie-talkie radio',
    category: 'communication',
    rarity: 'uncommon'
  },
  {
    id: 'smartphone',
    name: 'Teléfono Móvil',
    description: 'Dispositivo de comunicación',
    prompt: 'carrying a smartphone',
    category: 'communication',
    rarity: 'common'
  },
  
  // Protection
  {
    id: 'helmet',
    name: 'Casco',
    description: 'Protección para la cabeza',
    prompt: 'wearing a protective helmet',
    category: 'protection',
    rarity: 'uncommon'
  },
  {
    id: 'knee_pads',
    name: 'Rodilleras',
    description: 'Protección para las rodillas',
    prompt: 'wearing protective knee pads',
    category: 'protection',
    rarity: 'common'
  },
  {
    id: 'gas_mask',
    name: 'Máscara Antigás',
    description: 'Protección respiratoria',
    prompt: 'wearing a gas mask',
    category: 'protection',
    rarity: 'rare'
  }
];

// Helper functions
export function getClothingSetById(id: string): ClothingSet | undefined {
  return CLOTHING_SETS.find(set => set.id === id);
}

export function getGameItemById(id: string): GameItem | undefined {
  return GAME_ITEMS.find(item => item.id === id);
}

export function getClothingSetsByCategory(category: ClothingSet['category']): ClothingSet[] {
  return CLOTHING_SETS.filter(set => set.category === category);
}

export function getGameItemsByCategory(category: GameItem['category']): GameItem[] {
  return GAME_ITEMS.filter(item => item.category === category);
}

export function generateCharacterVisualPrompt(
  characterDescription: string,
  clothingSetId?: string,
  selectedItemIds: string[] = [],
  characterSpecialty?: string
): string {
  // Start with base character description
  let prompt = characterDescription || 'A survivor in a zombie apocalypse';
  
  // Add detailed specialty context with physical and personality traits
  if (characterSpecialty) {
    const specialtyDescriptions: Record<string, string> = {
      'survivor': 'hardened survivor with a determined expression, weathered face showing resilience, strong build from constant physical challenges, alert posture ready for danger',
      'medic': 'medical professional with a caring but focused demeanor, gentle hands skilled in healing, compassionate eyes that have seen suffering, clean and organized appearance despite harsh conditions',
      'engineer': 'technical expert with an analytical and resourceful appearance, intelligent eyes that assess problems methodically, practical clothing with tool marks, confident stance of someone who builds solutions',
      'scout': 'agile scout with alert eyes and a lean build, quick reflexes evident in posture, keen observational skills, lightweight gear for mobility, cautious but confident movement',
      'leader': 'natural leader with a confident and commanding presence, strong shoulders that carry responsibility, authoritative voice, inspiring demeanor that others follow, strategic mind evident in thoughtful expression',
      'scavenger': 'resourceful scavenger with keen eyes for valuable items, nimble fingers skilled at finding hidden treasures, practical mindset, adaptive clothing with many pockets, opportunistic but careful nature'
    };
    
    const specialtyDesc = specialtyDescriptions[characterSpecialty];
    if (specialtyDesc) {
      prompt += `. Character specialty: ${specialtyDesc}`;
    }
  }
  
  // Add detailed clothing description
  if (clothingSetId) {
    const clothingSet = getClothingSetById(clothingSetId);
    if (clothingSet) {
      prompt += `. Clothing and appearance: ${clothingSet.prompt}, clothing shows signs of wear appropriate for survival conditions`;
    }
  }
  
  // Add comprehensive items description (limit to 5 items)
  const itemsToAdd = selectedItemIds.slice(0, 5);
  if (itemsToAdd.length > 0) {
    const itemPrompts = itemsToAdd
      .map(id => getGameItemById(id))
      .filter(Boolean)
      .map(item => item!.prompt);
    
    if (itemPrompts.length > 0) {
      prompt += `. Equipment and items: ${itemPrompts.join(', ')}, all items show practical use and are well-maintained for survival`;
    }
  }
  
  // Add environmental and artistic context
  prompt += '. Setting: Post-apocalyptic zombie survival environment. Art style: Detailed character portrait with realistic proportions, dramatic lighting that emphasizes the harsh survival conditions, muted color palette with earth tones, high detail on facial features and equipment, professional digital art quality suitable for a survival game character.';
  
  return prompt;
}

export function buildAvatarPrompt(
  characterVisualPrompt: string
): string {
  // El characterVisualPrompt ya contiene toda la información necesaria
  // (descripción del personaje, especialidad, vestimenta e ítems)
  // Solo necesitamos añadir las instrucciones específicas para la generación de imagen
  let prompt = `Generate a pixel art style character avatar image with the following description: ${characterVisualPrompt}.`;
  
  prompt += ' The image should be 512x512 pixels, pixel art style, suitable for a zombie apocalypse survival game.';
  
  return prompt;
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { CharacterRedirectWrapper } from "@/components/auth/CharacterRedirectWrapper";
import { CLOTHING_SETS, GAME_ITEMS, generateCharacterVisualPrompt } from "@/lib/character-customization";

function CreateCharacterContent() {
  const [characterName, setCharacterName] = useState("");
  const [characterLastName, setCharacterLastName] = useState("");
  const [characterDescription, setCharacterDescription] = useState("");
  const [characterOriginLocation, setCharacterOriginLocation] = useState("");
  const [characterCurrentLocation, setCharacterCurrentLocation] = useState("");
  const [characterVisualPrompt, setCharacterVisualPrompt] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedClothingSet, setSelectedClothingSet] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else if (prev.length < 5) {
        return [...prev, itemId];
      }
      return prev;
    });
  };

  // Generar characterVisualPrompt automáticamente cuando cambien los datos del personaje
  useEffect(() => {
    if (characterDescription || selectedClothingSet || selectedItems.length > 0 || selectedSpecialty) {
      const updatedPrompt = generateCharacterVisualPrompt(
        characterDescription,
        selectedClothingSet,
        selectedItems,
        selectedSpecialty
      );
      
      setCharacterVisualPrompt(updatedPrompt);
    }
  }, [characterDescription, selectedClothingSet, selectedItems, selectedSpecialty]);

  const handleCreateCharacter = async () => {
    // Validate specialty selection
    if (!selectedSpecialty) {
      toast.error('Por favor selecciona una especialidad para tu personaje.');
      return;
    }
    
    setLoading(true);

    try {
      // Step 1: Generate the final visual prompt if not already generated
      let finalVisualPrompt = characterVisualPrompt;
      if (!finalVisualPrompt.trim()) {
        finalVisualPrompt = generateCharacterVisualPrompt(
          characterDescription,
          selectedClothingSet,
          selectedItems,
          selectedSpecialty
        );
      }

      // Step 2: Generate avatar using the visual prompt
      let avatarUrl = null;
      if (finalVisualPrompt.trim()) {
        const avatarResponse = await fetch('/api/generate-avatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            characterVisualPrompt: finalVisualPrompt,
            characterName: characterName,
            clothingSetId: selectedClothingSet,
            selectedItemIds: selectedItems,
            characterSpecialty: selectedSpecialty
          }),
        });

        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          avatarUrl = avatarData.avatarUrl; // Use Cloudinary URL for database storage
        } else {
          console.error('Error generating avatar:', await avatarResponse.text());
          // Continue without avatar if generation fails
        }
      }

      // Step 3: Update user character data
      const updateResponse = await fetch('/api/update-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterName,
          characterLastName,
          characterDescription,
          characterOriginLocation,
          characterCurrentLocation,
          characterSpecialty: selectedSpecialty,
          characterVisualPrompt: finalVisualPrompt,
          characterImageUrl: avatarUrl,
          characterClothingSet: selectedClothingSet,
          characterSelectedItems: selectedItems
        }),
      });

      if (updateResponse.ok) {
        const selectedTrait = characterTraits.find(t => t.id === selectedSpecialty);
        toast.success(`¡Personaje creado exitosamente! ${characterName} ${characterLastName} (${selectedTrait?.name}) está listo para sobrevivir al apocalipsis.${avatarUrl ? ' ¡Avatar generado con IA!' : ''}`);
        
        // Force page reload to refresh session data
        window.location.href = '/dashboard';
      } else {
        const errorData = await updateResponse.json();
        toast.error(`Error al crear el personaje: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error creating character:', error);
      toast.error('Error al crear el personaje. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const characterTraits = [
    { id: 'survivor', name: 'Superviviente Nato', description: 'Resistente y adaptable' },
    { id: 'medic', name: 'Médico de Campo', description: 'Especialista en curación' },
    { id: 'engineer', name: 'Ingeniero', description: 'Experto en construcción y reparaciones' },
    { id: 'scout', name: 'Explorador', description: 'Rápido y sigiloso' },
    { id: 'leader', name: 'Líder', description: 'Inspira y organiza grupos' },
    { id: 'scavenger', name: 'Recolector', description: 'Encuentra recursos valiosos' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black text-white font-mono p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-green-400 pixel-text hover:text-green-300">
            🧟‍♂️ ZOMBIE STORY
          </Link>
          <h1 className="text-4xl font-bold mt-4 mb-2 text-red-500 pixel-text">
            CREA TU SUPERVIVIENTE
          </h1>
          <p className="text-gray-400 text-lg">
            Define tu identidad en el mundo post-apocalíptico
          </p>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-800 border border-gray-600 rounded-lg p-1">
            <button
              onClick={() => setCurrentStep(1)}
              className={`px-6 py-3 rounded-md font-bold transition-colors ${
                currentStep === 1
                  ? 'bg-green-400 text-black'
                  : 'text-green-400 hover:bg-gray-700'
              }`}
            >
              📝 Paso 1: Información Básica
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className={`px-6 py-3 rounded-md font-bold transition-colors ${
                currentStep === 2
                  ? 'bg-blue-400 text-black'
                  : 'text-blue-400 hover:bg-gray-700'
              }`}
            >
              🎨 Paso 2: Personalización
            </button>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Character Form */}
            <div className="bg-black border-4 border-green-400 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-green-400 mb-6">📝 INFORMACIÓN BÁSICA</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-green-400 text-sm font-bold mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded focus:border-green-400 focus:outline-none pixel-input"
                    placeholder="Ej: Marcus"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-green-400 text-sm font-bold mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={characterLastName}
                    onChange={(e) => setCharacterLastName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded focus:border-green-400 focus:outline-none pixel-input"
                    placeholder="Ej: Rodriguez"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-green-400 text-sm font-bold mb-2">
                    Descripción del Personaje
                  </label>
                  <textarea
                    value={characterDescription}
                    onChange={(e) => setCharacterDescription(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded focus:border-green-400 focus:outline-none pixel-input h-20 resize-none"
                    placeholder="Ej: Hombre de 35 años, barba, cicatriz en la mejilla, ojos verdes..."
                    maxLength={200}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {characterDescription.length}/200 caracteres
                  </div>
                </div>

                <div>
                  <label className="block text-green-400 text-sm font-bold mb-2">
                    Lugar de Procedencia
                  </label>
                  <input
                    type="text"
                    value={characterOriginLocation}
                    onChange={(e) => setCharacterOriginLocation(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded focus:border-green-400 focus:outline-none pixel-input"
                    placeholder="Ej: Madrid, España / Nueva York / Ciudad Ficticia"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-green-400 text-sm font-bold mb-2">
                    Ubicación Actual
                  </label>
                  <input
                    type="text"
                    value={characterCurrentLocation}
                    onChange={(e) => setCharacterCurrentLocation(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded focus:border-green-400 focus:outline-none pixel-input"
                    placeholder="Ej: Barcelona, España / Los Ángeles / Refugio Subterráneo"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-green-400 text-sm font-bold mb-2">
                    Prompt para generar avatar (generado automáticamente)
                  </label>
                  <textarea
                    value={characterVisualPrompt}
                    readOnly
                    className="w-full bg-gray-700 border border-gray-500 text-gray-300 px-3 py-2 rounded pixel-input h-20 resize-none cursor-not-allowed"
                    placeholder="El prompt se generará automáticamente basado en la descripción, especialidad, vestimenta e ítems seleccionados..."
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Generado automáticamente • {characterVisualPrompt.length} caracteres
                  </div>
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div className="bg-black border-4 border-yellow-400 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">⚡ ESPECIALIDADES</h2>
              <p className="text-gray-400 mb-4 text-sm">
                Elige tu especialidad de supervivencia:
              </p>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {characterTraits.map((trait) => (
                  <div
                    key={trait.id}
                    onClick={() => setSelectedSpecialty(trait.id)}
                    className={`bg-gray-800 border p-4 rounded hover:border-yellow-400 transition-colors cursor-pointer ${
                      selectedSpecialty === trait.id 
                        ? 'border-yellow-400 bg-yellow-900/30' 
                        : 'border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white">{trait.name}</h3>
                        <p className="text-gray-400 text-sm">{trait.description}</p>
                      </div>
                      {selectedSpecialty === trait.id && (
                        <span className="text-yellow-400 text-xl">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Customization */}
        {currentStep === 2 && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Clothing Selection */}
            <div className="bg-black border-4 border-blue-400 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-blue-400 mb-6">👕 VESTIMENTA</h2>
              <p className="text-gray-400 mb-4 text-sm">
                Elige tu conjunto de ropa:
              </p>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {CLOTHING_SETS.map((clothingSet) => (
                  <div
                    key={clothingSet.id}
                    onClick={() => setSelectedClothingSet(clothingSet.id)}
                    className={`bg-gray-800 border p-3 rounded hover:border-blue-400 transition-colors cursor-pointer ${
                      selectedClothingSet === clothingSet.id 
                        ? 'border-blue-400 bg-blue-900/30' 
                        : 'border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white text-sm">{clothingSet.name}</h3>
                        <p className="text-gray-400 text-xs">{clothingSet.description}</p>
                      </div>
                      {selectedClothingSet === clothingSet.id && (
                        <span className="text-blue-400 text-lg">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items Selection */}
            <div className="bg-black border-4 border-purple-400 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-purple-400 mb-6">🎒 OBJETOS</h2>
              <p className="text-gray-400 mb-4 text-sm">
                Selecciona hasta 5 objetos ({selectedItems.length}/5):
              </p>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {GAME_ITEMS.map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  const canSelect = selectedItems.length < 5 || isSelected;
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => canSelect && handleItemToggle(item.id)}
                      className={`bg-gray-800 border p-3 rounded transition-colors ${
                        !canSelect 
                          ? 'opacity-50 cursor-not-allowed border-gray-600'
                          : isSelected
                          ? 'border-purple-400 bg-purple-900/30 cursor-pointer hover:border-purple-300'
                          : 'border-gray-600 cursor-pointer hover:border-purple-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">{item.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded ${
                              item.rarity === 'common' ? 'bg-gray-600 text-gray-300' :
                              item.rarity === 'uncommon' ? 'bg-green-600 text-green-200' :
                              'bg-yellow-600 text-yellow-200'
                            }`}>
                              {item.rarity === 'common' ? 'Común' : 
                               item.rarity === 'uncommon' ? 'Poco común' : 'Raro'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs mt-1">{item.description}</p>
                          <p className="text-gray-500 text-xs">{item.category}</p>
                        </div>
                        {isSelected && (
                          <span className="text-purple-400 text-lg ml-2">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(1)}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              currentStep === 1
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            ← Anterior
          </button>
          
          {currentStep === 1 ? (
            <button
              onClick={() => setCurrentStep(2)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={handleCreateCharacter}
              disabled={loading || !characterName.trim() || !selectedSpecialty}
              className={`px-8 py-3 rounded-lg font-bold transition-colors ${
                loading || !characterName.trim() || !selectedSpecialty
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {loading ? '🔄 Creando...' : '🎮 Crear Personaje'}
            </button>
          )}
        </div>

        {/* Game Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>🎮 Tu personaje será único • 🤖 IA generará tu historia • 🎨 Arte personalizado</p>
          <p className="mt-2">
            Una vez creado, tu superviviente estará listo para enfrentar el apocalipsis
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

export default function CreateCharacterPage() {
  return (
    <AuthWrapper>
      <CharacterRedirectWrapper requiresCharacter={false}>
        <CreateCharacterContent />
      </CharacterRedirectWrapper>
    </AuthWrapper>
  );
}
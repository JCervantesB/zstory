"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import type { User as DbUser } from "@/db/schema";
import { CLOTHING_SETS, GAME_ITEMS, generateCharacterVisualPrompt } from "@/lib/character-customization";

interface EditCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: DbUser;
  onSave: (updatedData: Partial<DbUser>) => Promise<void>;
}

const characterTraits = [
  { id: 'survivor', name: 'Superviviente Nato', description: 'Resistente y adaptable' },
  { id: 'medic', name: 'Médico de Campo', description: 'Especialista en curación' },
  { id: 'engineer', name: 'Ingeniero', description: 'Experto en construcción y reparaciones' },
  { id: 'scout', name: 'Explorador', description: 'Rápido y sigiloso' },
  { id: 'leader', name: 'Líder', description: 'Inspira y organiza grupos' },
  { id: 'scavenger', name: 'Recolector', description: 'Encuentra recursos valiosos' }
];

export function EditCharacterModal({ isOpen, onClose, user, onSave }: EditCharacterModalProps) {
  const [formData, setFormData] = useState({
    characterName: user.characterName || "",
    characterLastName: user.characterLastName || "",
    characterDescription: user.characterDescription || "",
    characterVisualPrompt: user.characterVisualPrompt || "",
    characterSpecialty: user.characterSpecialty || "",
    characterOriginLocation: user.characterOriginLocation || "",
    characterCurrentLocation: user.characterCurrentLocation || "",
  });
  const [selectedClothingSet, setSelectedClothingSet] = useState(user.characterClothingSet || '');
  const [selectedItems, setSelectedItems] = useState<string[]>(() => {
    try {
      return user.characterSelectedItems ? JSON.parse(user.characterSelectedItems) : [];
    } catch (error) {
      console.error('Error parsing initial characterSelectedItems:', error);
      return [];
    }
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null);

  // Actualizar estados cuando cambie el usuario
  useEffect(() => {
    setFormData({
      characterName: user.characterName || "",
      characterLastName: user.characterLastName || "",
      characterDescription: user.characterDescription || "",
      characterVisualPrompt: user.characterVisualPrompt || "",
      characterSpecialty: user.characterSpecialty || "",
      characterOriginLocation: user.characterOriginLocation || "",
      characterCurrentLocation: user.characterCurrentLocation || "",
    });
    setSelectedClothingSet(user.characterClothingSet || '');
    
    // Manejar parsing seguro de selectedItems
    try {
      setSelectedItems(
        user.characterSelectedItems ? JSON.parse(user.characterSelectedItems) : []
      );
    } catch (error) {
      console.error('Error parsing characterSelectedItems:', error);
      setSelectedItems([]);
    }
    
    setNewAvatarUrl(null);
    setCurrentStep(1);
  }, [user]);

  // Actualizar characterVisualPrompt automáticamente cuando cambien vestimenta, objetos o especialidad
  useEffect(() => {
    if (formData.characterDescription || selectedClothingSet || selectedItems.length > 0 || formData.characterSpecialty) {
      const updatedPrompt = generateCharacterVisualPrompt(
        formData.characterDescription,
        selectedClothingSet,
        selectedItems,
        formData.characterSpecialty
      );
      
      setFormData(prev => ({
        ...prev,
        characterVisualPrompt: updatedPrompt
      }));
    }
  }, [formData.characterDescription, selectedClothingSet, selectedItems, formData.characterSpecialty]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const handleGenerateAvatar = async () => {
    if (!formData.characterVisualPrompt.trim()) {
      toast.error('Por favor, proporciona una descripción visual para generar el avatar.');
      return;
    }

    setIsGeneratingAvatar(true);
    try {
      const response = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterVisualPrompt: formData.characterVisualPrompt,
          characterName: formData.characterName,
          clothingSetId: selectedClothingSet,
          selectedItemIds: selectedItems,
          characterSpecialty: formData.characterSpecialty
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewAvatarUrl(data.avatarUrl);
        toast.success('Avatar generado exitosamente');
      } else {
        toast.error(data.error || 'Error al generar el avatar');
      }
    } catch (error) {
      console.error('Error generating avatar:', error);
      toast.error('Error al generar el avatar');
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!formData.characterName.trim()) {
      toast.error('El nombre del personaje es obligatorio.');
      return;
    }

    if (!formData.characterSpecialty) {
      toast.error('Por favor selecciona una especialidad.');
      return;
    }

    setIsSaving(true);
    try {
      // Generar el prompt actualizado antes de guardar
      const updatedPrompt = generateCharacterVisualPrompt(
        formData.characterDescription,
        selectedClothingSet,
        selectedItems,
        formData.characterSpecialty
      );

      // Actualizar el estado local con el nuevo prompt
      setFormData(prev => ({
        ...prev,
        characterVisualPrompt: updatedPrompt
      }));

      const updatedData: Partial<DbUser> = {
        characterName: formData.characterName,
        characterLastName: formData.characterLastName,
        characterDescription: formData.characterDescription,
        characterVisualPrompt: updatedPrompt,
        characterSpecialty: formData.characterSpecialty,
        characterClothingSet: selectedClothingSet,
        characterSelectedItems: JSON.stringify(selectedItems),
        characterOriginLocation: formData.characterOriginLocation,
        characterCurrentLocation: formData.characterCurrentLocation
      };

      // Si se generó un nuevo avatar, incluirlo en los datos
      if (newAvatarUrl) {
        updatedData.characterImageUrl = newAvatarUrl;
      }

      await onSave(updatedData);
      toast.success('Personaje actualizado exitosamente');
      onClose();
    } catch (error) {
      console.error('Error saving character:', error);
      toast.error('Error al guardar los cambios del personaje');
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatarUrl = newAvatarUrl || user.characterImageUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[calc(100%-1rem)] sm:max-w-[900px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 scrollbar-hide mx-2 sm:mx-auto">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-red-500 text-lg sm:text-xl font-bold text-center sm:text-left">
            🧟‍♂️ Editar Personaje
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm text-center sm:text-left">
            Modifica la información de tu superviviente y personaliza su equipamiento.
          </DialogDescription>
        </DialogHeader>

        {/* Step Navigation */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="flex bg-gray-800 border border-gray-600 rounded-lg p-1 w-full sm:w-auto">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-md font-bold transition-colors text-xs sm:text-sm ${
                currentStep === 1
                  ? 'bg-green-400 text-black'
                  : 'text-green-400 hover:bg-gray-700'
              }`}
            >
              <span className="hidden sm:inline">📝 Información Básica</span>
              <span className="sm:hidden">📝 Info</span>
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-md font-bold transition-colors text-xs sm:text-sm ${
                currentStep === 2
                  ? 'bg-blue-400 text-black'
                  : 'text-blue-400 hover:bg-gray-700'
              }`}
            >
              <span className="hidden sm:inline">🎨 Personalización</span>
              <span className="sm:hidden">🎨 Custom</span>
            </button>
          </div>
        </div>

        <div className="py-4">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24 border-2 border-red-500">
                  <AvatarImage src={currentAvatarUrl || undefined} />
                  <AvatarFallback className="bg-gray-800 text-red-500 text-2xl">
                    {formData.characterName.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  onClick={handleGenerateAvatar}
                  disabled={isGeneratingAvatar || !formData.characterVisualPrompt.trim()}
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  {isGeneratingAvatar ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerar Avatar
                    </>
                  )}
                </Button>
                <p className="text-gray-400 text-xs">No es necesario guardar cambios</p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="characterName" className="text-gray-300 text-sm">
                    Nombre *
                  </Label>
                  <Input
                    id="characterName"
                    value={formData.characterName}
                    onChange={(e) => handleInputChange('characterName', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-sm"
                    placeholder="Nombre del personaje"
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="characterLastName" className="text-gray-300 text-sm">
                    Apellido
                  </Label>
                  <Input
                    id="characterLastName"
                    value={formData.characterLastName}
                    onChange={(e) => handleInputChange('characterLastName', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-sm"
                    placeholder="Apellido del personaje"
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="characterDescription" className="text-gray-300 text-sm">
                  Descripción del Personaje
                </Label>
                <Textarea
                  id="characterDescription"
                  value={formData.characterDescription}
                  onChange={(e) => handleInputChange('characterDescription', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white min-h-[60px] sm:min-h-[80px] resize-none text-sm"
                  placeholder="Ej: Hombre de 35 años, barba, cicatriz en la mejilla, ojos verdes..."
                  maxLength={200}
                />
                <div className="text-xs text-gray-500">
                  {formData.characterDescription.length}/200 caracteres
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="characterOriginLocation" className="text-gray-300 text-sm">
                    Lugar de Procedencia
                  </Label>
                  <Input
                    id="characterOriginLocation"
                    value={formData.characterOriginLocation}
                    onChange={(e) => handleInputChange('characterOriginLocation', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-sm"
                    placeholder="Ej: Madrid, España"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="characterCurrentLocation" className="text-gray-300 text-sm">
                    Ubicación Actual
                  </Label>
                  <Input
                    id="characterCurrentLocation"
                    value={formData.characterCurrentLocation}
                    onChange={(e) => handleInputChange('characterCurrentLocation', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-sm"
                    placeholder="Ej: Barcelona, España"
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Campo de prompt de avatar oculto - se genera automáticamente pero necesario para guardar en BD */}
              <div className="hidden">
                <Textarea
                  id="characterVisualPrompt"
                  value={formData.characterVisualPrompt}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-gray-300 min-h-[60px] sm:min-h-[80px] resize-none cursor-not-allowed text-sm"
                  placeholder="Este prompt se genera automáticamente basado en la descripción, especialidad, vestimenta e ítems seleccionados..."
                />
              </div>

              {/* Specialties */}
              <div className="space-y-2">
                <Label className="text-gray-300">
                  Especialidad *
                </Label>
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
                  {characterTraits.map((trait) => (
                    <div
                      key={trait.id}
                      onClick={() => handleInputChange('characterSpecialty', trait.id)}
                      className={`bg-gray-800 border p-3 rounded hover:border-yellow-400 transition-colors cursor-pointer ${
                        formData.characterSpecialty === trait.id 
                          ? 'border-yellow-400 bg-yellow-900/30' 
                          : 'border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-white text-sm">{trait.name}</h3>
                          <p className="text-gray-400 text-xs">{trait.description}</p>
                        </div>
                        {formData.characterSpecialty === trait.id && (
                          <span className="text-yellow-400 text-lg">✓</span>
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
            <div className="grid md:grid-cols-2 gap-6">
              {/* Clothing Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-400">👕 VESTIMENTA</h3>
                <p className="text-gray-400 text-sm">
                  Elige tu conjunto de ropa:
                </p>
                
                <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
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
                          <h4 className="font-bold text-white text-sm">{clothingSet.name}</h4>
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
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-purple-400">🎒 OBJETOS</h3>
                <p className="text-gray-400 text-sm">
                  Selecciona hasta 5 objetos ({selectedItems.length}/5):
                </p>
                
                <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
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
                              <h4 className="font-bold text-white text-sm">{item.name}</h4>
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
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row gap-2 order-2 sm:order-1">
            <Button
              onClick={() => setCurrentStep(1)}
              disabled={currentStep === 1}
              variant="outline"
              className={`border-gray-600 text-gray-300 hover:bg-gray-700 text-sm px-3 py-2 ${
                currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Anterior</span>
              <span className="sm:hidden">Atrás</span>
            </Button>
            
            {currentStep === 1 ? (
              <Button
                onClick={() => setCurrentStep(2)}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <span className="sm:hidden">Continuar</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 text-sm px-3 py-2"
              >
                Cancelar
              </Button>
            )}
          </div>
          
          {currentStep === 2 && (
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.characterName.trim() || !formData.characterSpecialty}
              className={`bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 order-1 sm:order-2 ${
                isSaving || !formData.characterName.trim() || !formData.characterSpecialty
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Guardando...</span>
                  <span className="sm:hidden">Guardando</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">💾 Guardar Cambios</span>
                  <span className="sm:hidden">💾 Guardar</span>
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
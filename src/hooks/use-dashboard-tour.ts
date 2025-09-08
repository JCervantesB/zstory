'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: 'left' | 'right' | 'top' | 'bottom';
    align?: 'start' | 'center' | 'end';
  };
}

const TOUR_STORAGE_KEY = 'zombie-story-dashboard-tour-completed';

export function useDashboardTour(setActiveTab?: (tab: string) => void) {
  const [isTourCompleted, setIsTourCompleted] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Verificar si es la primera visita al dashboard
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    const isFirst = !tourCompleted;
    
    setIsTourCompleted(!!tourCompleted);
    setIsFirstVisit(isFirst);
  }, []);

  // Pasos específicos para la pestaña de personaje
  const characterTabSteps: TourStep[] = [
    {
      element: '[data-tour="tabs-list"]',
      popover: {
        title: '🎮 Pestañas del Dashboard',
        description: 'Aquí puedes navegar entre la información de tu personaje y tus aventuras zombie. Cada pestaña te muestra diferentes aspectos de tu experiencia de supervivencia.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '[data-testid="edit-character-button"]',
      popover: {
        title: '✏️ Editar Personaje',
        description: 'Aquí puedes modificar los detalles de tu personaje como nombre, descripción y especialidad.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: 'button:has(.lucide-globe)',
      popover: {
        title: '🌍 Galería Pública',
        description: 'Aquí podrás explorar las historias públicas de otros jugadores y descubrir diferentes estrategias de supervivencia zombie.',
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '[data-testid="view-adventures-button"]',
      popover: {
        title: '🎮 Ver Aventuras',
        description: 'Este botón te lleva directamente a la pestaña de aventuras donde puedes gestionar todas tus historias de supervivencia.',
        side: 'left',
        align: 'start'
      }
    }
  ];

  // Pasos específicos para la pestaña de aventuras
  const adventuresTabSteps: TourStep[] = [
    {
      element: '[data-tour="new-adventure-button"]',
      popover: {
        title: '🚀 Crear Nueva Aventura',
        description: 'Haz clic aquí para comenzar una nueva historia de supervivencia zombie. Cada aventura es única y se adapta a las decisiones que tomes.',
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '[data-tour="session-history"]',
      popover: {
        title: '📚 Tus Aventuras',
        description: 'En esta sección encontrarás todas las historias que has generado. Puedes continuar aventuras en progreso o revisar las completadas.',
        side: 'top',
        align: 'center'
      }
    }
  ];

  // Pasos condicionales para aventuras (solo si existen historias)
  const adventureActionSteps: TourStep[] = [
    {
      element: '[data-tour="edit-title-button"]',
      popover: {
        title: '✏️ Editar Título',
        description: 'Presiona este botón para cambiar el título de cualquiera de tus historias y personalizarlas como prefieras.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="continue-story-button"]',
      popover: {
        title: '▶️ Continuar Historia',
        description: 'Usa este botón para continuar una aventura en progreso o revisar una historia completada.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="toggle-visibility-button"]',
      popover: {
        title: '🌍 Cambiar Visibilidad',
        description: 'Aquí puedes cambiar tu historia de pública a privada y viceversa. Las historias públicas aparecen en la galería para que otros las lean.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="share-button"]',
      popover: {
        title: '🔗 Compartir Enlace',
        description: 'Cuando tu historia sea pública, podrás copiar un enlace directo para compartirla con amigos y que puedan leerla en la galería.',
        side: 'top',
        align: 'center'
      }
    }
  ];

  const getAvailableSteps = (): TourStep[] => {
    const steps: TourStep[] = [];
    
    // Siempre empezar con los pasos de la pestaña de personaje
    steps.push(...characterTabSteps);
    
    // Agregar pasos de aventuras
    steps.push(...adventuresTabSteps);
    
    // Solo agregar pasos de acciones si hay historias disponibles
    const hasStories = document.querySelector('[data-tour="session-history"] .space-y-4 > div');
    if (hasStories) {
      // Filtrar solo los pasos cuyos elementos están disponibles
      adventureActionSteps.forEach(step => {
        if (document.querySelector(step.element)) {
          steps.push(step);
        }
      });
    } else {
      // Si no hay historias, agregar el paso para crear la primera
      const firstStoryButton = document.querySelector('[data-tour="start-first-story-button"]');
      if (firstStoryButton) {
        steps.push(...noStoriesSteps);
      }
    }
    
    return steps;
  };

  // Pasos adicionales para cuando no hay historias
  const noStoriesSteps: TourStep[] = [
    {
      element: '[data-tour="start-first-story-button"]',
      popover: {
        title: '🎯 Primera Historia',
        description: 'Si aún no tienes historias, puedes comenzar tu primera aventura desde aquí. ¡Es el momento perfecto para empezar!',
        side: 'top',
        align: 'center'
      }
    }
  ];

  const startTour = () => {
    // Activar la pestaña de personaje antes de iniciar el tour
    const characterTab = document.querySelector('button[value="character"]') as HTMLElement;
    if (characterTab) {
      characterTab.click();
      // Esperar un momento para que se renderice el contenido
      setTimeout(() => {
        startTourWithSteps();
      }, 100);
    } else {
      startTourWithSteps();
    }
  };

  const startTourWithSteps = () => {
    // Primero asegurarse de estar en la pestaña de personaje
    if (setActiveTab) {
      setActiveTab('character');
    }
    
    setTimeout(() => {
      const steps = getAvailableSteps();
      
      const driverObj = driver({
        showProgress: true,
        steps: steps.map((step, index) => ({
          element: step.element,
          popover: {
            ...step.popover,
            onNextClick: () => {
              // Si estamos en el último paso de la pestaña de personaje (índice 3),
              // cambiar a la pestaña de aventuras
              if (index === 3 && setActiveTab) {
                setActiveTab('adventures');
                setTimeout(() => {
                  driverObj.moveNext();
                }, 300);
              } else {
                driverObj.moveNext();
              }
            }
          }
        })),
        nextBtnText: 'Siguiente →',
        prevBtnText: '← Anterior',
        doneBtnText: '¡Listo! 🎉',
        overlayColor: 'rgba(0, 0, 0, 0.75)',
        popoverClass: 'zombie-tour-popover',
        progressText: 'Paso {{current}} de {{total}}',
        onDestroyed: () => {
          // Marcar el tour como completado
          localStorage.setItem(TOUR_STORAGE_KEY, 'true');
          setIsTourCompleted(true);
          setIsFirstVisit(false);
        },
        onDeselected: () => {
          // También marcar como completado si se cierra el tour
          localStorage.setItem(TOUR_STORAGE_KEY, 'true');
          setIsTourCompleted(true);
          setIsFirstVisit(false);
        }
      });
      
      driverObj.drive();
    }, 200);
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setIsTourCompleted(false);
    setIsFirstVisit(true);
  };

  return {
    isFirstVisit,
    isTourCompleted,
    startTour,
    resetTour
  };
}
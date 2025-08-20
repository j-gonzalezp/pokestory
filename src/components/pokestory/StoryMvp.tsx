"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Loader2, Play, RotateCcw, BookOpen } from 'lucide-react';
import { PokeStoryElement, getFourDistinctPureTypePokemon, getRandomStoryElements, GENERATIONS, Generation } from '../../services/pokeapi';
import { PokeStoryState, generateNextStoryStep, StoryStepResult, testGeminiConnection } from '../../services/gemini';
import { APP_ICON_MAP } from '@/lib/app-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PokeGrid from '../pokedex/PokeGrid';
import { PokedexDetail } from '../pokedex/PokedexDetail';
import { useFavorites } from '@/hooks/useFavorites';
import { PokeCard } from '../pokedex/PokeCard';

interface MapNode {
  step: number;
  iconName: string;
  position: { x: number; y: number };
  title: string;
  storyText: string;
  completed: boolean;
}

const getIconByName = (iconName: string): React.ComponentType<any> => {
  return APP_ICON_MAP[iconName as keyof typeof APP_ICON_MAP] || APP_ICON_MAP.MapPin;
};

const translations = {
  es: {
    welcomeTitle: "Bienvenido a PokeStory",
    welcomeDescription: "Configura tu aventura épica generada por IA.",
    loadingProtagonists: "Cargando protagonistas...",
    selectGenerations: "Selecciona Generaciones:",
    selectAll: "Todas",
    language: "Idioma:",
    spanish: "Español",
    english: "Inglés",
    startJourney: "Iniciar Viaje",
    chooseProtagonist: "Elige tu Protagonista",
    chooseProtagonistDesc: "Selecciona el Pokémon que te acompañará en esta aventura.",
    step: "Paso",
    generatingChapter: "Generando el siguiente capítulo de tu aventura...",
    adventureEnd: "Fin de la Aventura",
    storyOf: "La historia de",
    hasEnded: "ha concluido.",
    playAgain: "Jugar de Nuevo",
    error: "Error",
    unexpectedError: "Ocurrió un error inesperado.",
    restart: "Reiniciar",
    failedConnection: "Error al conectar con la API de Gemini. Por favor verifica tu clave API y conexión de red.",
    backToSettings: "Volver a Configuración",
    journeyMap: "Mapa del Viaje",
    currentElements: "Pokemones Actuales",
    whatDoYouDecide: "¿Qué decides hacer?",
    startPokedex: "Iniciar Pokedex",
    backToPresent: "Volver al Presente",
    completeStory: "Historia Completa",
    viewing: "Viendo",
    current: "Actual",
    nextStep: "Siguiente Paso"
  },
  en: {
    welcomeTitle: "Welcome to PokeStory",
    welcomeDescription: "Configure your epic AI-generated adventure.",
    loadingProtagonists: "Loading protagonists...",
    selectGenerations: "Select Generations:",
    selectAll: "All",
    language: "Language:",
    spanish: "Spanish",
    english: "English",
    startJourney: "Start Journey",
    chooseProtagonist: "Choose your Protagonist",
    chooseProtagonistDesc: "Select the Pokémon that will accompany you on this adventure.",
    step: "Step",
    generatingChapter: "Generating the next chapter of your adventure...",
    adventureEnd: "Adventure's End",
    storyOf: "The story of",
    hasEnded: "has concluded.",
    playAgain: "Play Again",
    error: "Error",
    unexpectedError: "An unexpected error occurred.",
    restart: "Restart",
    failedConnection: "Failed to connect to Gemini API. Please check your API key and network connection.",
    backToSettings: "Back to Settings",
    journeyMap: "Journey Map",
    currentElements: "Current Pokemon",
    whatDoYouDecide: "What do you decide to do?",
    startPokedex: "Start Pokedex",
    backToPresent: "Back to Present",
    completeStory: "Complete Story",
    viewing: "Viewing",
    current: "Current",
    nextStep: "Next Step"
  }
};

interface SettingsScreenProps {
  onStartJourney: () => void;
  selectedGenerations: number[];
  onGenerationChange: (generations: number[]) => void;
  language: 'es' | 'en';
  onLanguageChange: (lang: 'es' | 'en') => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onStartJourney,
  selectedGenerations,
  onGenerationChange,
  language,
  onLanguageChange
}) => {
  const t = translations[language];

  const handleGenerationToggle = (genId: number) => {
    if (selectedGenerations.includes(genId)) {
      onGenerationChange(selectedGenerations.filter(id => id !== genId));
    } else {
      onGenerationChange([...selectedGenerations, genId]);
    }
  };

  const handleSelectAllGenerations = () => {
    if (selectedGenerations.length === GENERATIONS.length) {
      onGenerationChange([]);
    } else {
      onGenerationChange(GENERATIONS.map(g => g.id));
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-slate-800 mb-2">
              {t.welcomeTitle}
            </CardTitle>
            <CardDescription className="text-lg text-slate-600">
              {t.welcomeDescription}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {APP_ICON_MAP.Languages && <APP_ICON_MAP.Languages className="h-5 w-5" />}
                {t.language}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  variant={language === 'es' ? 'default' : 'outline'}
                  onClick={() => onLanguageChange('es')}
                  className="flex-1"
                >
                  {t.spanish}
                </Button>
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  onClick={() => onLanguageChange('en')}
                  className="flex-1"
                >
                  {t.english}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {APP_ICON_MAP.Globe && <APP_ICON_MAP.Globe className="h-5 w-5" />}
                {t.selectGenerations}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant={selectedGenerations.length === GENERATIONS.length ? 'default' : 'outline'}
                  onClick={handleSelectAllGenerations}
                  className="w-full"
                >
                  {t.selectAll}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  {GENERATIONS.map(gen => (
                    <Button
                      key={gen.id}
                      variant={selectedGenerations.includes(gen.id) ? 'default' : 'outline'}
                      onClick={() => handleGenerationToggle(gen.id)}
                      size="sm"
                    >
                      {gen.displayName}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button
            onClick={onStartJourney}
            disabled={selectedGenerations.length === 0}
            size="lg"
            className="px-8 py-6 text-lg"
          >
            <Play className="h-5 w-5 mr-2" />
            {t.startJourney}
          </Button>
          {selectedGenerations.length === 0 && (
            <p className="text-red-500 text-sm mt-2">
              {language === 'es' ? 'Selecciona al menos una generación para continuar' : 'Select at least one generation to continue'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface ProtagonistSelectionProps {
  onStart: (protagonist: PokeStoryElement) => void;
  onBack: () => void;
  loading: boolean;
  protagonists: PokeStoryElement[];
  language: 'es' | 'en';
}

const ProtagonistSelection: React.FC<ProtagonistSelectionProps> = ({
  onStart,
  onBack,
  loading,
  protagonists,
  language
}) => {
  const t = translations[language];

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.backToSettings}
        </Button>

        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-slate-800">
              {t.chooseProtagonist}
            </CardTitle>
            <CardDescription className="text-lg">
              {t.chooseProtagonistDesc}
            </CardDescription>
          </CardHeader>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>{t.loadingProtagonists}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {protagonists.map(p => (
              <Card
                key={p.name}
                className="cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
                onClick={() => onStart(p)}
              >
                <CardContent className="p-6 text-center">
                  {p.spriteUrl && (
                    <img
                      src={p.spriteUrl}
                      alt={p.name}
                      className="w-24 h-24 mx-auto mb-4 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <h3 className="font-semibold capitalize">
                    {p.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface StoryScreenProps {
  storyText: string;
  options: string[];
  onSelectOption: (optionIndex: number) => void;
  step: number;
  storyElements: PokeStoryElement[];
  language: 'es' | 'en';
  mapNodes: MapNode[];
  onMapNodeClick: (step: number) => void;
  viewingHistoryStep?: number;
  onOpenPokedex: () => void;
  setStoryPokemonForCard: (element: PokeStoryElement) => void;
}

const StoryScreen: React.FC<StoryScreenProps> = ({
  storyText,
  options,
  onSelectOption,
  step,
  storyElements,
  language,
  mapNodes,
  onMapNodeClick,
  viewingHistoryStep,
  onOpenPokedex,
  setStoryPokemonForCard
}) => {
  const t = translations[language];
  const isViewingHistory = viewingHistoryStep !== undefined;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-end">
            <Button onClick={onOpenPokedex}>
                <BookOpen className="h-4 w-4 mr-2" />
                {t.startPokedex}
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-center">{t.journeyMap}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full overflow-hidden">
              <div className="flex items-center justify-between gap-2 py-4 min-w-0">
                {Array.from({ length: 10 }, (_, index) => {
                  const currentMapStep = index + 1;
                  const node = mapNodes.find(n => n.step === currentMapStep);
                  const IconComponent = node ? getIconByName(node.iconName) : APP_ICON_MAP.MapPin;
                  const isActive = currentMapStep === (viewingHistoryStep || step);
                  const isCompleted = node?.completed || false;
                  const isClickable = isCompleted;

                  return (
                    <div key={currentMapStep} className="flex flex-col items-center space-y-1 flex-1 min-w-0">
                      <div
                        className={`
                          relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all
                          ${isActive
                            ? 'bg-blue-500 border-blue-500 shadow-lg scale-110'
                            : isCompleted
                              ? 'bg-green-500 border-green-500 hover:scale-105'
                              : 'bg-gray-200 border-gray-300'
                          }
                          ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}
                        `}
                        onClick={() => isClickable && onMapNodeClick(currentMapStep)}
                      >
                        <IconComponent
                          className={`h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 ${
                            isActive || isCompleted ? 'text-white' : 'text-gray-400'
                          }`}
                        />

                        {isActive && (
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full border border-white"></div>
                        )}
                      </div>

                      <span className={`text-xs font-medium truncate w-full text-center ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {currentMapStep}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {storyElements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-center">{t.currentElements}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 justify-center overflow-x-auto pb-2">
                {storyElements.slice(-3).map((element, index) => (
                  element.spriteUrl && (
                    <button key={`${element.name}-${index}`} className="flex-shrink-0 text-center" onClick={() => element.type === 'pokemon' && setStoryPokemonForCard(element)}>
                      <img
                        src={element.spriteUrl}
                        alt={element.name}
                        className="w-16 h-16 mx-auto mb-2 object-contain bg-white rounded-lg shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="text-xs text-slate-600 capitalize">
                        {element.name}
                      </span>
                    </button>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-slate max-w-none mt-4">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {storyText}
              </p>
            </div>
          </CardContent>
        </Card>

        {!isViewingHistory && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.whatDoYouDecide}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 text-left justify-start whitespace-normal"
                    onClick={() => onSelectOption(index)}
                  >
                    <span className="mr-3 text-sm text-slate-500 self-start pt-1">
                      {index + 1}.
                    </span>
                    <span>{option}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isViewingHistory && (
          <Button
            onClick={() => onMapNodeClick(step)}
            className="w-full"
          >
            {t.backToPresent}
          </Button>
        )}
      </div>
    </div>
  );
};

const LoadingScreen: React.FC<{ language: 'es' | 'en' }> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-96">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mb-6 text-indigo-600" />
          <p className="text-lg text-center">{t.generatingChapter}</p>
        </CardContent>
      </Card>
    </div>
  );
};

interface EndScreenProps {
  storyHistory: string[];
  protagonist: PokeStoryElement | null;
  onRestart: () => void;
  language: 'es' | 'en';
  mapNodes: MapNode[];
}

const EndScreen: React.FC<EndScreenProps> = ({
  storyHistory,
  protagonist,
  onRestart,
  language,
  mapNodes
}) => {
  const t = translations[language];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-slate-800 mb-2">
              {t.adventureEnd}
            </CardTitle>
            <CardDescription className="text-xl">
              {t.storyOf} {protagonist?.name} {t.hasEnded}
            </CardDescription>
            {protagonist?.spriteUrl && (
              <img
                src={protagonist.spriteUrl}
                alt={protagonist.name}
                className="w-32 h-32 mx-auto mt-6 object-contain"
              />
            )}
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t.completeStory}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {storyHistory.map((text, index) => (
                  <div key={index} className="border-l-4 border-indigo-200 pl-4">
                    <Badge variant="outline" className="mb-2">
                      {t.step} {index + 1}
                    </Badge>
                    <p className="text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button onClick={onRestart} size="lg" className="px-8 py-6">
            <RotateCcw className="h-5 w-5 mr-2" />
            {t.playAgain}
          </Button>
        </div>
      </div>
    </div>
  );
};

const StoryMvp: React.FC = () => {
  const [gameState, setGameState] = useState<'settings' | 'protagonistSelection' | 'story' | 'loading' | 'end' | 'error'>('settings');
  const [protagonists, setProtagonists] = useState<PokeStoryElement[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>(GENERATIONS.map(g => g.id));
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [storyState, setStoryState] = useState<PokeStoryState>({
    currentStep: 1,
    protagonist: null,
    accumulatedElements: [],
    storyHistory: [],
  });
  const [currentStory, setCurrentStory] = useState<StoryStepResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [protagonistLoading, setProtagonistLoading] = useState<boolean>(false);
  const [mapNodes, setMapNodes] = useState<MapNode[]>([]);
  const [viewingHistoryStep, setViewingHistoryStep] = useState<number | undefined>();
  const [isPokedexModalOpen, setIsPokedexModalOpen] = useState(false);
  const [selectedPokemonForDetail, setSelectedPokemonForDetail] = useState<string | null>(null);
  const { favorites, toggleFavorite } = useFavorites();
  const [storyPokemonForCard, setStoryPokemonForCard] = useState<PokeStoryElement | null>(null);

  const handlePokemonSelectInModal = (pokemonName: string) => {
    setSelectedPokemonForDetail(pokemonName);
  };

  const handleBackToGridInModal = () => {
    setSelectedPokemonForDetail(null);
  };

  const generateMapPosition = (step: number): { x: number; y: number } => {
    const totalSteps = 10;
    const viewWidth = 1000;
    const padding = 50;
    const contentWidth = viewWidth - (padding * 2);
    const stepWidth = contentWidth / (totalSteps - 1);

    const x = padding + (step - 1) * stepWidth;

    const baseY = 75;
    const yOffset = 20;
    const y = baseY + ((step % 2 === 0) ? -yOffset : yOffset);

    return { x, y };
  };

  const loadProtagonists = useCallback(async () => {
    setProtagonistLoading(true);
    try {
      const initialProtagonists = await getFourDistinctPureTypePokemon(selectedGenerations);
      setProtagonists(initialProtagonists);
    } catch (error) {
      console.error('Error loading protagonists:', error);
      setProtagonists([]);
    } finally {
      setProtagonistLoading(false);
    }
  }, [selectedGenerations]);

  useEffect(() => {
    const initializeGame = async () => {
      const isGeminiConnected = await testGeminiConnection();
      if (!isGeminiConnected) {
        setErrorMessage(translations[language].failedConnection);
        setGameState('error');
      }
    };

    initializeGame();
  }, [language]);

  const handleStartJourney = useCallback(async () => {
    if (selectedGenerations.length === 0) return;
    setGameState('protagonistSelection');
    await loadProtagonists();
  }, [selectedGenerations, loadProtagonists]);

  const handleBackToSettings = () => {
    setGameState('settings');
    setProtagonists([]);
  };

  const handleStartStory = useCallback(async (protagonist: PokeStoryElement) => {
    setGameState('loading');

    const initialState: PokeStoryState = {
      currentStep: 1,
      protagonist: protagonist,
      accumulatedElements: [protagonist],
      storyHistory: [],
    };
    setStoryState(initialState);

    try {
      const newElements = await getRandomStoryElements(2, selectedGenerations);
      const result = await generateNextStoryStep(initialState, newElements, language);

      setCurrentStory(result);
      setStoryState(prev => ({
          ...prev,
          accumulatedElements: [...prev.accumulatedElements, ...newElements]
      }));

      const firstNode: MapNode = {
        step: 1,
        iconName: result.iconName || 'Home',
        position: generateMapPosition(1),
        title: "Inicio",
        storyText: result.storyText,
        completed: true
      };

      setMapNodes([firstNode]);
      setGameState('story');
    } catch (error) {
      console.error('Error starting story:', error);
      setErrorMessage(translations[language].unexpectedError);
      setGameState('error');
    }
  }, [selectedGenerations, language]);

  const handleNextStep = useCallback(async (optionIndex: number) => {
    if (!currentStory) return;
    setGameState('loading');

    const nextStep = storyState.currentStep + 1;
    const updatedHistory = [...storyState.storyHistory, currentStory.storyText];

    if (nextStep > 10) {
        setMapNodes(prev => prev.map(n => ({...n, completed: true})));
        setStoryState(prev => ({...prev, storyHistory: updatedHistory}));
        setGameState('end');
        return;
    }

    const updatedState: PokeStoryState = {
      ...storyState,
      currentStep: nextStep,
      storyHistory: updatedHistory,
    };
    setStoryState(updatedState);

    try {
      const newElements = await getRandomStoryElements(2, selectedGenerations);
      const result = await generateNextStoryStep(updatedState, newElements, language);

      setCurrentStory(result);
      setStoryState(prev => ({
          ...prev,
          accumulatedElements: [...prev.accumulatedElements, ...newElements]
      }));

      const newNode: MapNode = {
        step: nextStep,
        iconName: result.iconName || 'MapPin',
        position: generateMapPosition(nextStep),
        title: `${translations[language].step} ${nextStep}`,
        storyText: result.storyText,
        completed: true
      };

      setMapNodes(prev => [...prev.map(n => ({...n, completed: true})), newNode]);
      setViewingHistoryStep(undefined);
      setGameState('story');
    } catch (error) {
      console.error('Error generating next step:', error);
      setErrorMessage(translations[language].unexpectedError);
      setGameState('error');
    }
  }, [storyState, currentStory, selectedGenerations, language]);

  const handleMapNodeClick = useCallback((step: number) => {
    if (step === storyState.currentStep) {
      setViewingHistoryStep(undefined);
      return;
    }
    setViewingHistoryStep(step);
  }, [storyState.currentStep]);

  const handleRestart = () => {
    setStoryState({
        currentStep: 1,
        protagonist: null,
        accumulatedElements: [],
        storyHistory: [],
    });
    setCurrentStory(null);
    setErrorMessage(null);
    setProtagonists([]);
    setMapNodes([]);
    setViewingHistoryStep(undefined);
    setGameState('settings');
  };

  const handleGenerationChange = (generations: number[]) => {
    setSelectedGenerations(generations);
  };

  const handleLanguageChange = (lang: 'es' | 'en') => {
    setLanguage(lang);
  };

  const getHistoryStoryText = (step: number): string => {
    const node = mapNodes.find(n => n.step === step);
    return node?.storyText || "";
  };

  const renderGameState = () => {
    const t = translations[language];

    switch (gameState) {
      case 'loading':
        return <LoadingScreen language={language} />;

      case 'protagonistSelection':
        return (
          <ProtagonistSelection
            onStart={handleStartStory}
            onBack={handleBackToSettings}
            loading={protagonistLoading}
            protagonists={protagonists}
            language={language}
          />
        );

      case 'story':
        const displayStoryText = viewingHistoryStep
          ? getHistoryStoryText(viewingHistoryStep)
          : currentStory?.storyText || "";

        return currentStory && (
          <StoryScreen
            storyText={displayStoryText}
            options={currentStory.options}
            onSelectOption={handleNextStep}
            step={storyState.currentStep}
            storyElements={storyState.accumulatedElements}
            language={language}
            mapNodes={mapNodes}
            onMapNodeClick={handleMapNodeClick}
            viewingHistoryStep={viewingHistoryStep}
            onOpenPokedex={() => setIsPokedexModalOpen(true)}
            setStoryPokemonForCard={setStoryPokemonForCard}
          />
        );

      case 'end':
        return (
          <EndScreen
            storyHistory={[...storyState.storyHistory, currentStory?.storyText || '']}
            protagonist={storyState.protagonist}
            onRestart={handleRestart}
            language={language}
            mapNodes={mapNodes}
          />
        );

      case 'error':
        return (
          <div className="min-h-screen flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-red-600">
                  {t.error}
                </CardTitle>
                <CardDescription className="text-red-500">
                  {errorMessage || t.unexpectedError}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button onClick={handleRestart} className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t.restart}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'settings':
      default:
        return (
          <SettingsScreen
            onStartJourney={handleStartJourney}
            selectedGenerations={selectedGenerations}
            onGenerationChange={handleGenerationChange}
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        );
    }
  };

  return (
    <div className="font-sans">
      {renderGameState()}
      <Dialog open={isPokedexModalOpen} onOpenChange={setIsPokedexModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Pokedex</DialogTitle>
          </DialogHeader>
          {selectedPokemonForDetail ? (
            <PokedexDetail pokemonName={selectedPokemonForDetail} onBack={handleBackToGridInModal} />
          ) : (
            <PokeGrid onPokemonSelect={handlePokemonSelectInModal} />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={storyPokemonForCard !== null} onOpenChange={() => setStoryPokemonForCard(null)}>
        <DialogContent className="w-auto">
          {storyPokemonForCard && (
            <PokeCard
              pokemonName={storyPokemonForCard.name}
              onSelect={() => setStoryPokemonForCard(null)}
              isFavorite={favorites.includes(storyPokemonForCard.id)}
              onToggleFavorite={() => toggleFavorite(storyPokemonForCard.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoryMvp;
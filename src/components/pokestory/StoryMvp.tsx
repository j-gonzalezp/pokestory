"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Play, RotateCcw, Save, LucideIcon } from 'lucide-react';
import { PokeStoryElement, getFourDistinctPureTypePokemon, getRandomStoryElements, GENERATIONS } from '../../services/pokeapi';
import { PokeStoryState, generateNextStoryStep, StoryStepResult, testGeminiConnection } from '../../services/gemini';
import { APP_ICON_MAP } from '@/lib/app-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PokeGrid from '../pokedex/PokeGrid';
import { PokedexDetail } from '../pokedex/PokedexDetail';
import { useFavorites } from '@/hooks/useFavorites';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Image from 'next/image';

import { motion, AnimatePresence } from 'framer-motion';
import TypewriterText from '@/components/animations/TypewriterText';


interface MapNode {
  step: number;
  iconName: string;
  position: { x: number; y: number };
  title: string;
  storyText: string;
  completed: boolean;
}

interface SavedStory {
  id: string;
  title: string;
  protagonist: PokeStoryElement;
  storyHistory: string[];
  mapNodes: MapNode[];
  allElements: PokeStoryElement[];
  timestamp: number;
}


const getIconByName = (iconName: string): LucideIcon => {
  return APP_ICON_MAP[iconName as keyof typeof APP_ICON_MAP] as LucideIcon || APP_ICON_MAP.MapPin as LucideIcon;
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
    startPokedex: "Pokédex",
    backToPresent: "Volver al Presente",
    completeStory: "Historia Completa",
    viewing: "Viendo",
    current: "Actual",
    nextStep: "Siguiente Paso",
    saveStory: "Guardar Historia",
    storyTitlePlaceholder: "Dale un título a tu épica aventura...",
    storySaved: "¡Historia Guardada!",
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
    startPokedex: "Pokédex",
    backToPresent: "Back to Present",
    completeStory: "Complete Story",
    viewing: "Viewing",
    current: "Current",
    nextStep: "Next Step",
    saveStory: "Save Story",
    storyTitlePlaceholder: "Give your epic adventure a title...",
    storySaved: "Story Saved!",
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {APP_ICON_MAP.Languages && <APP_ICON_MAP.Languages className="h-5 w-5" />}
                {t.language}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  {language === 'es' ? 'Elige el idioma para tu viaje:' : 'Choose your journey language:'}
                </p>
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
              </div>


              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={onStartJourney}
                  disabled={selectedGenerations.length === 0}
                  size="lg"
                  className="w-full px-8 py-6 text-lg "
                >
                  <Play className="h-5 w-5 mr-2" />
                  {t.startJourney}
                </Button>
                {selectedGenerations.length === 0 && (
                  <p className="text-red-500 text-sm mt-2 text-center">
                    {language === 'es' ? 'Selecciona al menos una generación para continuar' : 'Select at least one generation to continue'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

    
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

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
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {protagonists.map(p => (
              <motion.div
                key={p.name}
                variants={itemVariants}
                className="cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
                onClick={() => onStart(p)}
              >
                <Card>
                  <CardContent className="p-6 text-center">
                    {p.spriteUrl && (
                      <Image
                        src={p.spriteUrl}
                        alt={p.name}
                        width={96}
                        height={96}
                        className="mx-auto mb-4"
                        style={{ objectFit: 'contain' }}
                      />
                    )}
                    <h3 className="font-semibold capitalize">
                      {p.name}
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
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
  onPokemonCardClick: (element: PokeStoryElement) => void;
  onRestart: () => void;
  isGeneratingStep: boolean;
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
  onPokemonCardClick,
  onRestart,
  isGeneratingStep
}) => {
  const t = translations[language];
  const isViewingHistory = viewingHistoryStep !== undefined;

  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    setIsTypingComplete(false);
  }, [storyText]);

  const pokemonContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const pokemonItemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const totalStorySteps = 10;
  const readingProgress = (step / totalStorySteps) * 100;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          onClick={onRestart}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.backToSettings}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-center">{t.journeyMap}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full overflow-x-auto pb-4">
              <div className="flex items-center gap-x-6 py-4 px-4 min-w-max">
                {Array.from({ length: 10 }, (_, index) => {
                  const currentMapStep = index + 1;
                  const node = mapNodes.find(n => n.step === currentMapStep);
                  const IconComponent = node ? getIconByName(node.iconName) : APP_ICON_MAP.MapPin;
                  const isActive = currentMapStep === (viewingHistoryStep || step);
                  const isCompleted = node?.completed || false;
                  const isClickable = isCompleted || currentMapStep === step;
                  const prevNodeCompleted = mapNodes.some(n => n.step === currentMapStep - 1 && n.completed);
                  const isLineActive = prevNodeCompleted && isCompleted;

                  return (
                    <React.Fragment key={currentMapStep}>
                      {currentMapStep > 1 && (
                        <div
                          className={`
                            flex-shrink-0 w-16 h-1 rounded-full transition-colors duration-500 ease-in-out
                            ${isLineActive ? 'bg-green-500' : 'bg-gray-300'}
                          `}
                        />
                      )}
                      <div
                        className={`
                          flex-shrink-0 relative w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all
                          ${isActive
                            ? 'bg-blue-500 border-blue-500 shadow-lg scale-110 animate-pulse'
                            : isCompleted
                              ? 'bg-green-500 border-green-500 hover:scale-105'
                              : 'bg-gray-200 border-gray-300'
                          }
                          ${isClickable
                            ? 'cursor-pointer hover:shadow-md'
                            : 'cursor-default'
                          }
                        `}
                        onClick={() => isClickable && onMapNodeClick(currentMapStep)}
                      >
                        <IconComponent
                          className={`h-7 w-7 ${isActive || isCompleted ? 'text-white' : 'text-gray-400'
                            }`}
                        />

                        {isActive && (
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full border border-white"></div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
        {storyElements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center">{t.currentElements}</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                className="flex gap-6 justify-center overflow-x-auto pb-4 px-4"
                variants={pokemonContainerVariants}
                initial="hidden"
                animate="show"
              >
                {storyElements.map((element, index) => (
                  element.spriteUrl && (
                    <motion.div
                      key={`${element.name}-${index}`}
                      variants={pokemonItemVariants}
                      className="flex flex-col items-center transform hover:scale-105 transition-transform duration-200 cursor-pointer flex-shrink-0 p-2"
                      onClick={() => onPokemonCardClick(element)}
                    >
                      <div className="relative w-32 h-32 bg-white rounded-full p-2 shadow-lg border-2 border-gray-200 hover:border-blue-400 transition-colors">
                        <Image
                          src={element.spriteUrl}
                          alt={element.name}
                          fill
                          style={{ objectFit: 'contain' }}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <span className="mt-2 text-sm font-medium text-gray-800 capitalize">
                        {element.name}
                      </span>
                      {element.types && element.types.length > 0 ? (
                        <div className="flex gap-1 mt-1">
                          {element.types.map((type, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      ) : (element.type && (
                        <div className="flex gap-1 mt-1">
                          <span
                            key={element.name}
                            className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
                          >
                            {element.type}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )
                ))}
              </motion.div>
            </CardContent>
          </Card>
        )}

        <Card className="relative">
          <div className="h-1 bg-blue-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${readingProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <CardContent className="pt-6">
            <div className="prose prose-slate max-w-none mt-4">
              {isGeneratingStep && !isViewingHistory ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
                  <p className="text-lg text-center">{t.generatingChapter}</p>
                </div>
              ) : (
                <TypewriterText
                  text={storyText}
                  speed={30}
                  onComplete={() => setIsTypingComplete(true)}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {!isViewingHistory && isTypingComplete && !isGeneratingStep && (
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
                    disabled={isGeneratingStep}
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

interface EndScreenProps {
  storyHistory: string[];
  protagonist: PokeStoryElement | null;
  onRestart: () => void;
  language: 'es' | 'en';
  mapNodes: MapNode[];
  onSaveStory: (title: string) => void;
}

const EndScreen: React.FC<EndScreenProps> = ({
  storyHistory,
  protagonist,
  onRestart,
  language,
  onSaveStory,
}) => {
  const t = translations[language];
  const [title, setTitle] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveClick = () => {
    onSaveStory(title);
    setIsSaved(true);
  };


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
              <Image
                src={protagonist.spriteUrl}
                alt={protagonist.name}
                width={128}
                height={128}
                className="mx-auto mt-6"
                style={{ objectFit: 'contain' }}
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
              <div className="space-y-6 max-h-96 overflow-y-auto pr-4">
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

        <Card className="mb-8">
          <CardContent className="p-6 space-y-4">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.storyTitlePlaceholder}
              className="text-lg"
              disabled={isSaved}
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleSaveClick} size="lg" className="flex-1" disabled={isSaved}>
                <Save className="h-5 w-5 mr-2" />
                {isSaved ? t.storySaved : t.saveStory}
              </Button>
              <Button onClick={onRestart} size="lg" variant="outline" className="flex-1">
                <RotateCcw className="h-5 w-5 mr-2" />
                {t.playAgain}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StoryMvp: React.FC = () => {
  const [gameState, setGameState] = useState<'settings' | 'protagonistSelection' | 'story' | 'end' | 'error'>('settings');
  const [protagonists, setProtagonists] = useState<PokeStoryElement[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>(GENERATIONS.map(g => g.id));
  const [language, setLanguage] = useState<'es' | 'en'>('en');
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
  const { } = useFavorites();
  const [storyPokemonForDetail, setStoryPokemonForDetail] = useState<string | null>(null);
  const [isGeneratingStep, setIsGeneratingStep] = useState(false);
  const [currentStepElements, setCurrentStepElements] = useState<PokeStoryElement[]>([]);

  const t = translations[language];

  const handlePokemonSelectInModal = (pokemonName: string) => {
    setSelectedPokemonForDetail(pokemonName);
  };

  const handleBackToGridInModal = () => {
    setSelectedPokemonForDetail(null);
  };

  const handlePokemonCardClick = (element: PokeStoryElement) => {
    if (element.type === 'pokemon') {
      setStoryPokemonForDetail(element.name);
    }
  };

  const handleBackFromStoryPokemonDetail = () => {
    setStoryPokemonForDetail(null);
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
    setIsGeneratingStep(true);
    setGameState('story');

    const initialState: PokeStoryState = {
      currentStep: 1,
      protagonist: protagonist,
      accumulatedElements: [],
      storyHistory: [],
    };
    setStoryState(initialState);

    try {
      const newElements = await getRandomStoryElements(2, selectedGenerations);
      const result = await generateNextStoryStep(initialState, newElements, language);

      setCurrentStory(result);
      const elementsForThisStep = [protagonist, ...newElements];
      setCurrentStepElements(elementsForThisStep);
      setStoryState(prev => ({
        ...prev,
        accumulatedElements: elementsForThisStep
      }));

      const firstNode: MapNode = {
        step: 1,
        iconName: result.iconName || 'Home',
        position: generateMapPosition(1),
        title: translations[language].step + " 1",
        storyText: result.storyText,
        completed: true
      };

      setMapNodes([firstNode]);
    } catch (error) {
      console.error('Error starting story:', error);
      setErrorMessage(translations[language].unexpectedError);
      setGameState('error');
    } finally {
      setIsGeneratingStep(false);
    }
  }, [selectedGenerations, language]);

  const handleNextStep = useCallback(async () => {
    if (!currentStory) return;
    setIsGeneratingStep(true);

    const nextStep = storyState.currentStep + 1;
    const updatedHistory = [...storyState.storyHistory, currentStory.storyText];

    if (nextStep > 10) {
      setMapNodes(prev => prev.map(n => ({ ...n, completed: true })));
      setStoryState(prev => ({ ...prev, storyHistory: updatedHistory }));
      setGameState('end');
      setIsGeneratingStep(false);
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
      const elementsForThisStep = [storyState.protagonist!, ...newElements];
      setCurrentStepElements(elementsForThisStep);
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

      setMapNodes(prev => [...prev.map(n => ({ ...n, completed: true })), newNode]);
      setViewingHistoryStep(undefined);
    } catch (error) {
      console.error('Error generating next step:', error);
      setErrorMessage(translations[language].unexpectedError);
      setGameState('error');
    } finally {
      setIsGeneratingStep(false);
    }
  }, [storyState, currentStory, selectedGenerations, language]);

  const handleMapNodeClick = useCallback((step: number) => {
    if (step === storyState.currentStep) {
      setViewingHistoryStep(undefined);
      return;
    }
    setViewingHistoryStep(step);
  }, [storyState.currentStep]);

  const handleSaveStory = (title: string) => {
    if (!storyState.protagonist) return;

    const finalTitle = title.trim() === ''
      ? `${t.storyOf} ${storyState.protagonist.name}`
      : title;

    const fullStoryHistory = [...storyState.storyHistory, currentStory?.storyText || ''];

    const newStory: SavedStory = {
      id: new Date().toISOString(),
      title: finalTitle,
      protagonist: storyState.protagonist,
      storyHistory: fullStoryHistory,
      mapNodes: mapNodes,
      allElements: storyState.accumulatedElements,
      timestamp: Date.now()
    };

    try {
      const savedStoriesRaw = localStorage.getItem('pokeStories');
      const savedStories: SavedStory[] = savedStoriesRaw ? JSON.parse(savedStoriesRaw) : [];
      savedStories.push(newStory);
      localStorage.setItem('pokeStories', JSON.stringify(savedStories));
      console.log('Story saved successfully!', newStory);
    } catch (error) {
      console.error('Failed to save story to local storage:', error);

    }
  };


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
    setStoryPokemonForDetail(null);
    setIsGeneratingStep(false);
    setCurrentStepElements([]);
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

    switch (gameState) {
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
            storyElements={currentStepElements}
            language={language}
            mapNodes={mapNodes}
            onMapNodeClick={handleMapNodeClick}
            viewingHistoryStep={viewingHistoryStep}
            onPokemonCardClick={handlePokemonCardClick}
            onRestart={handleRestart}
            isGeneratingStep={isGeneratingStep}
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
            onSaveStory={handleSaveStory}
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
      <AnimatePresence mode="wait">
        <motion.div
          key={gameState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full"
        >
          {renderGameState()}
        </motion.div>
      </AnimatePresence>


      <Dialog open={isPokedexModalOpen} onOpenChange={setIsPokedexModalOpen}>
        <DialogContent
          className="max-w-4xl h-[80vh] flex flex-col
                     data-[state=open]:animate-in data-[state=closed]:animate-out
                     data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
                     data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95
                     duration-500 ease-in-out"
        >
          <DialogTitle asChild>
            <VisuallyHidden>
              {selectedPokemonForDetail ? 'Pokémon Details' : 'Pokedex'}
            </VisuallyHidden>
          </DialogTitle>
          <div className="flex-1 overflow-hidden">
            {selectedPokemonForDetail ? (
              <PokedexDetail pokemonName={selectedPokemonForDetail} onBack={handleBackToGridInModal} />
            ) : (
              <div className="h-full">
                <PokeGrid onPokemonSelect={handlePokemonSelectInModal} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>


      <Dialog open={storyPokemonForDetail !== null} onOpenChange={() => setStoryPokemonForDetail(null)}>
        <DialogContent
          className="max-w-4xl h-[90vh]
                     data-[state=open]:animate-in data-[state=closed]:animate-out
                     data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
                     data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95
                     duration-500 ease-in-out"
        >
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>
                {storyPokemonForDetail}
              </DialogTitle>
            </DialogHeader>
          </VisuallyHidden>
          {storyPokemonForDetail && (
            <PokedexDetail pokemonName={storyPokemonForDetail} onBack={handleBackFromStoryPokemonDetail} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoryMvp;
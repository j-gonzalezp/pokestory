"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@radix-ui/react-progress';
import { ArrowLeft, Loader2, Play, RotateCcw, Save, LucideIcon, Heart, Smile, Star, Shield, Dices, PlusCircle, XCircle } from 'lucide-react';
import { PokeStoryElement, getFourDistinctPureTypePokemon, getRandomStoryElements, GENERATIONS } from '../../services/pokeapi';
import { PokeStoryState, generateNextStoryStep, StoryStepResult, testGeminiConnection, StoryOption } from '../../services/gemini';
import { PlayerData, PlayerPokemon, getPlayerData, adoptNewPokemon, updatePokemon, releasePokemon } from '../../services/persistence';
import { createInitialPokemon, applyEffects } from '../../services/gameLogic';
import { APP_ICON_MAP } from '@/lib/app-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import PokeGrid from '../pokedex/PokeGrid';
import { PokedexDetail } from '../pokedex/PokedexDetail';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import TypewriterText from '@/components/animations/TypewriterText';
import { AnimatedNumber } from '@/components/animations/AnimatedNumber';

const MotionButton = motion(Button);

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
  protagonist: PlayerPokemon;
  storyHistory: string[];
  mapNodes: MapNode[];
  allElements: PokeStoryElement[];
  timestamp: number;
}

interface SettingsScreenProps {
  onStartJourney: () => void;
  selectedGenerations: number[];
  onGenerationChange: (generations: number[]) => void;
  language: 'es' | 'en';
  onLanguageChange: (lang: 'es' | 'en') => void;
}

interface StoryScreenProps {
  storyText: string;
  options: StoryOption[];
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
  activePokemon: PlayerPokemon;
}

interface EndScreenProps {
  storyHistory: string[];
  protagonist: PlayerPokemon | null;
  onRestart: () => void;
  language: 'es' | 'en';
  mapNodes: MapNode[];
  allElements: PokeStoryElement[];
  onSaveStory: (title: string) => void;
}

const getIconByName = (iconName: string): LucideIcon => {
  return APP_ICON_MAP[iconName as keyof typeof APP_ICON_MAP] as LucideIcon || APP_ICON_MAP.MapPin as LucideIcon;
};

const translations = {
  es: {
    welcomeTitle: "Bienvenido a PokeStory RPG",
    welcomeDescription: "Configura tu aventura épica generada por IA.",
    loadingProtagonists: "Cargando compañeros...",
    selectGenerations: "Selecciona Generaciones:",
    selectAll: "Todas",
    language: "Idioma:",
    spanish: "Español",
    english: "Inglés",
    startJourney: "Iniciar Viaje",
    chooseYourCompanion: "Elige tu Compañero",
    chooseYourCompanionDesc: "Comienza una nueva aventura o continúa con un amigo leal.",
    yourPokemon: "Tus Pokémon",
    startWith: "Empezar con",
    adoptNew: "Adoptar Nuevo",
    teamFull: "Equipo Lleno (Máx. 3)",
    giveNickname: "Dale un apodo a tu nuevo amigo:",
    confirmAdoption: "Confirmar Adopción",
    step: "Paso",
    generatingChapter: "Generando el siguiente capítulo de tu aventura...",
    adventureEnd: "Fin del Capítulo",
    storyOf: "La aventura de",
    hasEnded: "ha concluido por ahora.",
    playAgain: "Jugar de Nuevo",
    error: "Error",
    unexpectedError: "Ocurrió un error inesperado.",
    restart: "Reiniciar",
    failedConnection: "Error al conectar con la API de Gemini. Por favor verifica tu clave API y conexión de red.",
    backToSettings: "Volver a Configuración",
    backToTeamSelection: "Volver a Selección de Equipo",
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
    level: "Nivel",
    hp: "Vida",
    morale: "Moral",
    traits: "Rasgos",
    noTraits: "Aún sin rasgos especiales.",
    releasePokemon: "Liberar Pokémon",
    confirmRelease: "¿Estás seguro de que quieres liberar a",
    releaseWarning: "Esta acción es irreversible y eliminará a este Pokémon de tu equipo.",
    yesRelease: "Sí, Liberar",
    cancel: "Cancelar",
    pokemonReleased: "¡Pokémon Liberado!",
    pokemonDied: "Tu Pokémon ha sido derrotado...",
    deathMessage: "La aventura de {nickname} ha llegado a un trágico final. Pero su espíritu vivirá en tus recuerdos.",
    startNewAdventure: "Empezar Nueva Aventura",
  },
  en: {
    welcomeTitle: "Welcome to PokeStory RPG",
    welcomeDescription: "Configure your epic AI-generated adventure.",
    loadingProtagonists: "Loading companions...",
    selectGenerations: "Select Generations:",
    selectAll: "All",
    language: "Language:",
    spanish: "Spanish",
    english: "English",
    startJourney: "Start Journey",
    chooseYourCompanion: "Choose your Companion",
    chooseYourCompanionDesc: "Start a new adventure or continue with a loyal friend.",
    yourPokemon: "Your Pokémon",
    startWith: "Start with",
    adoptNew: "Adopt New",
    teamFull: "Team Full (Max 3)",
    giveNickname: "Give your new friend a nickname:",
    confirmAdoption: "Confirm Adoption",
    step: "Step",
    generatingChapter: "Generating the next chapter of your adventure...",
    adventureEnd: "Chapter's End",
    storyOf: "The adventure of",
    hasEnded: "has concluded for now.",
    playAgain: "Play Again",
    error: "Error",
    unexpectedError: "An unexpected error occurred.",
    restart: "Restart",
    failedConnection: "Failed to connect to Gemini API. Please check your API key and network connection.",
    backToSettings: "Back to Settings",
    backToTeamSelection: "Back to Team Selection",
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
    level: "Level",
    hp: "HP",
    morale: "Morale",
    traits: "Traits",
    noTraits: "No special traits yet.",
    releasePokemon: "Release Pokemon",
    confirmRelease: "Are you sure you want to release",
    releaseWarning: "This action is irreversible and will remove this Pokemon from your team.",
    yesRelease: "Yes, Release",
    cancel: "Cancel",
    pokemonReleased: "Pokemon Released!",
    pokemonDied: "Your Pokemon has been defeated...",
    deathMessage: "The adventure of {nickname} has come to a tragic end. But their spirit will live on in your memories.",
    startNewAdventure: "Start New Adventure",
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 20,
      mass: 0.5,
    },
  },
};

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
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-6 md:mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold text-slate-800 mb-2">
                {t.welcomeTitle}
              </CardTitle>
              <CardDescription className="text-lg text-slate-600">
                {t.welcomeDescription}
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {APP_ICON_MAP.Globe && <APP_ICON_MAP.Globe className="h-5 w-5" />}
                  {t.selectGenerations}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <MotionButton
                    variant={selectedGenerations.length === GENERATIONS.length ? 'default' : 'outline'}
                    onClick={handleSelectAllGenerations}
                    className="w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t.selectAll}
                  </MotionButton>
                  <div className="grid grid-cols-2 gap-2">
                    {GENERATIONS.map(gen => (
                      <MotionButton
                        key={gen.id}
                        variant={selectedGenerations.includes(gen.id) ? 'default' : 'outline'}
                        onClick={() => handleGenerationToggle(gen.id)}
                        size="sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {gen.displayName}
                      </MotionButton>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {APP_ICON_MAP.Languages && <APP_ICON_MAP.Languages className="h-5 w-5" />}
                  {t.language}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    {language === 'es' ? 'Elige el idioma para tu viaje:' : 'Choose your journey language:'}
                  </p>
                  <div className="flex gap-3">
                    <MotionButton
                      variant={language === 'es' ? 'default' : 'outline'}
                      onClick={() => onLanguageChange('es')}
                      className="flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t.spanish}
                    </MotionButton>
                    <MotionButton
                      variant={language === 'en' ? 'default' : 'outline'}
                      onClick={() => onLanguageChange('en')}
                      className="flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t.english}
                    </MotionButton>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <MotionButton
                    onClick={onStartJourney}
                    disabled={selectedGenerations.length === 0}
                    size="lg"
                    className="w-full px-8 py-6 text-lg "
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {t.startJourney}
                  </MotionButton>
                  {selectedGenerations.length === 0 && (
                    <p className="text-red-500 text-sm mt-2 text-center">
                      {language === 'es' ? 'Selecciona al menos una generación para continuar' : 'Select at least one generation to continue'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

interface CompanionSelectionProps {
  onStartWithExisting: (pokemon: PlayerPokemon) => void;
  onStartWithNew: (pokemon: PokeStoryElement) => void;
  onBack: () => void;
  loading: boolean;
  potentialProtagonists: PokeStoryElement[];
  playerData: PlayerData;
  language: 'es' | 'en';
  onReleasePokemon: (pokemonId: string) => void;
}

const CompanionSelection: React.FC<CompanionSelectionProps> = ({
  onStartWithExisting,
  onStartWithNew,
  onBack,
  loading,
  potentialProtagonists,
  playerData,
  language,
  onReleasePokemon
}) => {
  const t = translations[language];
  const isTeamFull = playerData.adoptedPokemon.length >= 3;
  const [releaseConfirmOpen, setReleaseConfirmOpen] = useState(false);
  const [pokemonToRelease, setPokemonToRelease] = useState<PlayerPokemon | null>(null);

  const handleReleaseClick = (pokemon: PlayerPokemon, e: React.MouseEvent) => {
    e.stopPropagation();
    setPokemonToRelease(pokemon);
    setReleaseConfirmOpen(true);
  };

  const confirmRelease = () => {
    if (pokemonToRelease) {
      onReleasePokemon(pokemonToRelease.id);
      setReleaseConfirmOpen(false);
      setPokemonToRelease(null);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MotionButton onClick={onBack} variant="outline" className="mb-4" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToSettings}
          </MotionButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">{t.chooseYourCompanion}</CardTitle>
              <CardDescription>{t.chooseYourCompanionDesc}</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> {t.yourPokemon}</CardTitle>
            </CardHeader>
            <CardContent>
              {playerData.adoptedPokemon.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {playerData.adoptedPokemon.map(p => (
                    <motion.div
                      key={p.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className="relative cursor-pointer hover:border-blue-500 transition-colors h-full flex flex-col" onClick={() => onStartWithExisting(p)}>
                        <MotionButton
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700"
                          onClick={(e) => handleReleaseClick(p, e as any)}
                          title={t.releasePokemon}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <XCircle className="h-5 w-5" />
                        </MotionButton>
                        <CardHeader className="flex-row items-center gap-4">
                          <Image src={p.spriteUrl} alt={p.nickname} width={48} height={48} />
                          <div>
                            <p className="font-bold">{p.nickname}</p>
                            <p className="text-sm text-slate-500">{t.level} {p.level}</p>
                          </div>
                        </CardHeader>
                        <CardFooter className="mt-auto">
                          <MotionButton className="w-full" variant="outline" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{t.startWith} {p.nickname}</MotionButton>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <p className="text-center text-slate-500 py-4">No tienes Pokémon adoptados todavía.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Dices className="h-5 w-5" /> {t.adoptNew}</CardTitle>
              {isTeamFull && <CardDescription className="text-red-500">{t.teamFull}</CardDescription>}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
              ) : (
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {potentialProtagonists.map(p => (
                    <motion.div
                      key={p.name}
                      variants={itemVariants}
                      whileHover={!isTeamFull ? { scale: 1.05 } : {}}
                      whileTap={!isTeamFull ? { scale: 0.98 } : {}}
                    >
                      <Card
                        className={`cursor-pointer transition-transform ${isTeamFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isTeamFull && onStartWithNew(p)}
                      >
                        <CardContent className="p-4 text-center">
                          <Image src={p.spriteUrl!} alt={p.name} width={96} height={96} className="mx-auto mb-2" />
                          <h3 className="font-semibold capitalize">{p.name}</h3>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Dialog open={releaseConfirmOpen} onOpenChange={setReleaseConfirmOpen}>
          <DialogContent
            data-state={releaseConfirmOpen ? "open" : "closed"}
            className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-300"
          >
            <DialogHeader>
              <DialogTitle>{t.confirmRelease} {pokemonToRelease?.nickname}?</DialogTitle>
              <DialogDescription>
                {t.releaseWarning}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReleaseConfirmOpen(false)}>
                {t.cancel}
              </Button>
              <Button variant="destructive" onClick={confirmRelease}>
                {t.yesRelease}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

interface PokemonStatusCardProps {
  pokemon: PlayerPokemon;
  language: 'es' | 'en';
}

const PokemonStatusCard: React.FC<PokemonStatusCardProps> = ({ pokemon, language }) => {
  const t = translations[language];
  const hpPercentage = (pokemon.stats.currentHP / pokemon.stats.maxHP) * 100;
  const moralePercentage = (pokemon.stats.currentMorale / pokemon.stats.maxMorale) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
          {pokemon.spriteUrl && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <Image src={pokemon.spriteUrl} alt={pokemon.nickname} width={64} height={64} />
            </motion.div>
          )}
          <div className="flex-1">
            <CardTitle className="text-2xl">{pokemon.nickname}</CardTitle>
            <CardDescription>{`${t.level} ${pokemon.level} ${pokemon.speciesName}`}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-medium flex items-center gap-1"><Heart className="h-4 w-4 text-red-500" /> {t.hp}</span>
                <span><AnimatedNumber value={pokemon.stats.currentHP} /> / <AnimatedNumber value={pokemon.stats.maxHP} /></span>
              </div>
              <Progress value={hpPercentage} className="h-2 [&>div]:bg-red-500" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-medium flex items-center gap-1"><Smile className="h-4 w-4 text-blue-500" /> {t.morale}</span>
                <span><AnimatedNumber value={pokemon.stats.currentMorale} /> / <AnimatedNumber value={pokemon.stats.maxMorale} /></span>
              </div>
              <Progress value={moralePercentage} className="h-2" />
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /> {t.traits}</h4>
              {pokemon.traits.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {pokemon.traits.map(trait => <Badge key={trait} variant="secondary">{trait}</Badge>)}
                </div>
              ) : (
                <p className="text-sm text-slate-500">{t.noTraits}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

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
  isGeneratingStep,
  activePokemon
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

  const optionsContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const optionItemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const totalStorySteps = 10;
  const readingProgress = (step / totalStorySteps) * 100;

  return (
    <div className="min-h-screen p-2 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MotionButton
            onClick={onRestart}
            variant="outline"
            className="mb-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToTeamSelection}
          </MotionButton>
        </motion.div>

        {activePokemon && <PokemonStatusCard pokemon={activePokemon} language={language} />}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-center">{t.journeyMap}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="w-full overflow-x-auto pb-4">
                <div className="flex items-center gap-x-4 sm:gap-x-6 py-4 px-4 min-w-max">
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
                          <motion.div
                            className={`
                              flex-shrink-0 w-16 h-1 rounded-full
                              ${isLineActive ? 'bg-green-500' : 'bg-gray-300'}
                            `}
                            initial={{ width: 0 }}
                            animate={{ width: '4rem' }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          />
                        )}
                        <motion.div
                          className={`
                            flex-shrink-0 relative w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all
                            ${isActive
                              ? 'bg-blue-500 border-blue-500 shadow-lg scale-110'
                              : isCompleted
                                ? 'bg-green-500 border-green-500'
                                : 'bg-gray-200 border-gray-300'
                            }
                            ${isClickable
                              ? 'cursor-pointer hover:shadow-md'
                              : 'cursor-default'
                            }
                          `}
                          onClick={() => isClickable && onMapNodeClick(currentMapStep)}
                          whileHover={isClickable ? { scale: 1.15 } : {}}
                          whileTap={isClickable ? { scale: 0.95 } : {}}
                          animate={isActive ? { scale: [1.1, 1.15, 1.1] } : {}}
                          transition={isActive ? { duration: 1.5, repeat: Infinity, repeatType: "reverse" } : {}}
                        >
                          <IconComponent
                            className={`h-7 w-7 ${isActive || isCompleted ? 'text-white' : 'text-gray-400'
                              }`}
                          />

                          {isActive && (
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full border border-white"></div>
                          )}
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {storyElements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-center">{t.currentElements}</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="flex gap-4 justify-center overflow-x-auto pb-4 px-4"
                  variants={pokemonContainerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {storyElements.map((element, index) => (
                    element.spriteUrl && (
                      <motion.div
                        key={`${element.name}-${index}`}
                        variants={pokemonItemVariants}
                        className="flex flex-col items-center transition-transform duration-200 cursor-pointer flex-shrink-0 p-2"
                        onClick={() => onPokemonCardClick(element)}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
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
                        {element.type && (
                          <div className="flex gap-1 mt-1">
                            <span
                              className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
                            >
                              {element.type}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
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
                    wordDelay={0.05}
                    onComplete={() => setIsTypingComplete(true)}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isViewingHistory && isTypingComplete && !isGeneratingStep && (
            <motion.div
              key="options"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={optionsContainerVariants}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.whatDoYouDecide}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {options.map((option, index) => (
                      <motion.div key={index} variants={optionItemVariants}>
                        <MotionButton
                          variant="outline"
                          className="h-auto p-4 text-left justify-start whitespace-normal w-full"
                          onClick={() => onSelectOption(index)}
                          disabled={isGeneratingStep}
                          whileHover={{ scale: 1.01, x: 5 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <span className="mr-3 text-sm text-slate-500 self-start pt-1">
                            {index + 1}.
                          </span>
                          <span>{option.text}</span>
                        </MotionButton>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isViewingHistory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <MotionButton
              onClick={() => onMapNodeClick(step)}
              className="w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t.backToPresent}
            </MotionButton>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const EndScreen: React.FC<EndScreenProps> = ({
  storyHistory,
  protagonist,
  onRestart,
  language,
  onSaveStory
}) => {
  const t = translations[language];
  const [storyTitle, setStoryTitle] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const handleSaveStory = () => {
    if (storyTitle.trim()) {
      onSaveStory(storyTitle.trim());
      setSavedMessage(t.storySaved);
      setTimeout(() => setSavedMessage(''), 3000);
      setStoryTitle('');
    }
  };

  const deathMessage = t.deathMessage.replace('{nickname}', protagonist?.nickname || t.storyOf);

  const storyItemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-6 md:mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold text-slate-800 mb-2">
                {protagonist && protagonist.stats.currentHP <= 0 ? t.pokemonDied : t.adventureEnd}
              </CardTitle>
              <CardDescription className="text-xl">
                {protagonist && protagonist.stats.currentHP <= 0 ? deathMessage : `${t.storyOf} ${protagonist?.nickname || ''} ${t.hasEnded}`}
              </CardDescription>
              {protagonist?.spriteUrl && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    filter: protagonist.stats.currentHP <= 0 ? 'grayscale(100%)' : 'grayscale(0%)'
                  }}
                  transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 100 }}
                  className="mx-auto mt-6"
                >
                  <Image
                    src={protagonist.spriteUrl}
                    alt={protagonist.nickname}
                    width={128}
                    height={128}
                    style={{ objectFit: 'contain' }}
                  />
                </motion.div>
              )}
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-6 md:mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                {t.saveStory}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder={t.storyTitlePlaceholder}
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  className="flex-1"
                  maxLength={50}
                />
                <MotionButton
                  onClick={handleSaveStory}
                  disabled={!storyTitle.trim()}
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="h-4 w-4" />
                  {t.saveStory}
                </MotionButton>
              </div>
              {savedMessage && (
                <p className="text-green-600 mt-2 font-medium">{savedMessage}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="lg:col-span-2 mb-6 md:mb-8">
            <CardHeader>
              <CardTitle>{t.completeStory}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                {storyHistory.map((text, index) => (
                  <motion.div
                    key={index}
                    className="border-l-4 border-indigo-200 pl-4"
                    variants={storyItemVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.5 }}
                  >
                    <Badge variant="outline" className="mb-2">
                      {t.step} {index + 1}
                    </Badge>
                    <p className="text-sm leading-relaxed">{text}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <MotionButton onClick={onRestart} size="lg" className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <RotateCcw className="h-5 w-5 mr-2" />
                {t.startNewAdventure}
              </MotionButton>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

const StoryMvp: React.FC = () => {
  const [gameState, setGameState] = useState<'settings' | 'companionSelection' | 'story' | 'end' | 'error'>('settings');
  const [potentialProtagonists, setPotentialProtagonists] = useState<PokeStoryElement[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>(GENERATIONS.map(g => g.id));
  const [language, setLanguage] = useState<'es' | 'en'>('en');

  const [playerData, setPlayerData] = useState<PlayerData>({ adoptedPokemon: [] });
  const [activePokemon, setActivePokemon] = useState<PlayerPokemon | null>(null);
  const [isAdoptionModalOpen, setAdoptionModalOpen] = useState(false);
  const [pokemonToAdopt, setPokemonToAdopt] = useState<PokeStoryElement | null>(null);
  const [newNickname, setNewNickname] = useState("");

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
  const [storyPokemonForDetail, setStoryPokemonForDetail] = useState<string | null>(null);
  const [isGeneratingStep, setIsGeneratingStep] = useState(false);
  const [currentStepElements, setCurrentStepElements] = useState<PokeStoryElement[]>([]);

  const t = translations[language];

  useEffect(() => {
    setPlayerData(getPlayerData());
  }, []);

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

  const handleSaveStory = (title: string) => {
    if (!activePokemon || storyState.storyHistory.length === 0) return;

    const savedStory: SavedStory = {
      id: Date.now().toString(),
      title,
      protagonist: activePokemon,
      storyHistory: [...storyState.storyHistory, currentStory?.storyText || ''],
      mapNodes,
      allElements: storyState.accumulatedElements,
      timestamp: Date.now()
    };

    try {
      const existingStories = localStorage.getItem('pokeStories');
      const stories: SavedStory[] = existingStories ? JSON.parse(existingStories) : [];
      stories.push(savedStory);
      localStorage.setItem('pokeStories', JSON.stringify(stories));
    } catch (error) {
      console.error('Error saving story:', error);
    }
  };

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
    return { x: step * 100, y: 50 };
  };

  const loadProtagonists = useCallback(async () => {
    setProtagonistLoading(true);
    try {
      const initialProtagonists = await getFourDistinctPureTypePokemon(selectedGenerations);
      setPotentialProtagonists(initialProtagonists);
    } catch (error) {
      console.error('Error loading protagonists:', error);
      setPotentialProtagonists([]);
    } finally {
      setProtagonistLoading(false);
    }
  }, [selectedGenerations]);

  const handleStartJourney = useCallback(async () => {
    if (selectedGenerations.length === 0) return;
    setGameState('companionSelection');
    await loadProtagonists();
  }, [selectedGenerations, loadProtagonists]);

  const handleBackToSettings = () => {
    setGameState('settings');
    setPotentialProtagonists([]);
  };

  const handleSelectNewCompanion = (pokemon: PokeStoryElement) => {
    setPokemonToAdopt(pokemon);
    setNewNickname(pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1));
    setAdoptionModalOpen(true);
  };

  const handleConfirmAdoption = () => {
    if (!pokemonToAdopt || !newNickname.trim()) return;
    const newPlayerPokemon = createInitialPokemon(pokemonToAdopt, newNickname.trim());
    const success = adoptNewPokemon(newPlayerPokemon);
    if (success) {
      setPlayerData(getPlayerData());
      startStory(newPlayerPokemon);
    } else {
      setErrorMessage(t.teamFull);
      setGameState('error');
    }
    setAdoptionModalOpen(false);
    setPokemonToAdopt(null);
    setNewNickname("");
  };

  const handleReleasePokemon = (pokemonId: string) => {
    releasePokemon(pokemonId);
    setPlayerData(getPlayerData());
  };

  const startStory = useCallback(async (protagonist: PlayerPokemon) => {
    setIsGeneratingStep(true);
    setGameState('story');
    setActivePokemon(protagonist);

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
      const protagonistElement: PokeStoryElement = {
        name: protagonist.speciesName,
        type: 'pokemon',
        spriteUrl: protagonist.spriteUrl,
        internalUrl: ''
      };
      const elementsForThisStep = [protagonistElement, ...newElements];
      setCurrentStepElements(elementsForThisStep);
      setStoryState(prev => ({
        ...prev,
        accumulatedElements: elementsForThisStep
      }));

      const firstNode: MapNode = {
        step: 1,
        iconName: result.iconName || 'Home',
        position: generateMapPosition(1),
        title: `${t.step} 1`,
        storyText: result.storyText,
        completed: true
      };
      setMapNodes([firstNode]);

    } catch (error) {
      console.error('Error starting story:', error);
      setErrorMessage(t.unexpectedError);
      setGameState('error');
    } finally {
      setIsGeneratingStep(false);
    }
  }, [selectedGenerations, language, t]);

  const handleNextStep = useCallback(async (optionIndex: number) => {
    if (!currentStory || !activePokemon) return;
    setIsGeneratingStep(true);

    const chosenOption = currentStory.options[optionIndex];
    const updatedPokemon = applyEffects(activePokemon, chosenOption.effects);

    updatePokemon(updatedPokemon);
    setActivePokemon(updatedPokemon);

    if (updatedPokemon.stats.currentHP <= 0) {
      setStoryState(prev => ({ ...prev, storyHistory: [...prev.storyHistory, currentStory.storyText] }));
      setGameState('end');
      setIsGeneratingStep(false);
      return;
    }

    const nextStep = storyState.currentStep + 1;
    const updatedHistory = [...storyState.storyHistory, currentStory.storyText];

    if (nextStep > 10) {
      setMapNodes(prev => prev.map(n => ({ ...n, completed: true })));
      setStoryState(prev => ({ ...prev, storyHistory: updatedHistory }));
      setGameState('end');
      setIsGeneratingStep(false);
      return;
    }

    const updatedStoryState: PokeStoryState = {
      ...storyState,
      currentStep: nextStep,
      protagonist: updatedPokemon,
      storyHistory: updatedHistory,
    };
    setStoryState(updatedStoryState);

    try {
      const newElements = await getRandomStoryElements(2, selectedGenerations);
      const result = await generateNextStoryStep(updatedStoryState, newElements, language);

      setCurrentStory(result);
      const protagonistElement: PokeStoryElement = {
        name: updatedPokemon.speciesName,
        type: 'pokemon',
        spriteUrl: updatedPokemon.spriteUrl,
        internalUrl: ''
      };
      const elementsForThisStep = [protagonistElement, ...newElements];
      setCurrentStepElements(elementsForThisStep);
      setStoryState(prev => ({
        ...prev,
        accumulatedElements: [...prev.accumulatedElements, ...newElements]
      }));

      const newNode: MapNode = {
        step: nextStep,
        iconName: result.iconName || 'MapPin',
        position: generateMapPosition(nextStep),
        title: `${t.step} ${nextStep}`,
        storyText: result.storyText,
        completed: true
      };

      setMapNodes(prev => [...prev.map(n => ({ ...n, completed: true })), newNode]);
      setViewingHistoryStep(undefined);
    } catch (error) {
      console.error('Error generating next step:', error);
      setErrorMessage(t.unexpectedError);
      setGameState('error');
    } finally {
      setIsGeneratingStep(false);
    }
  }, [storyState, currentStory, activePokemon, selectedGenerations, language, t]);

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
    setPotentialProtagonists([]);
    setMapNodes([]);
    setViewingHistoryStep(undefined);
    setStoryPokemonForDetail(null);
    setIsGeneratingStep(false);
    setCurrentStepElements([]);
    setActivePokemon(null);
    setPlayerData(getPlayerData());
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
      case 'companionSelection':
        return (
          <CompanionSelection
            onStartWithExisting={startStory}
            onStartWithNew={handleSelectNewCompanion}
            onBack={handleBackToSettings}
            loading={protagonistLoading}
            potentialProtagonists={potentialProtagonists}
            playerData={playerData}
            language={language}
            onReleasePokemon={handleReleasePokemon}
          />
        );

      case 'story':
        const displayStoryText = viewingHistoryStep
          ? getHistoryStoryText(viewingHistoryStep)
          : currentStory?.storyText || "";

        return currentStory && activePokemon && (
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
            activePokemon={activePokemon}
          />
        );

      case 'end':
        return (
          <EndScreen
            storyHistory={[...storyState.storyHistory, currentStory?.storyText || '']}
            protagonist={activePokemon}
            onRestart={handleRestart}
            language={language}
            mapNodes={mapNodes}
            allElements={storyState.accumulatedElements}
            onSaveStory={handleSaveStory}
          />
        );

      case 'error':
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-full"
        >
          {renderGameState()}
        </motion.div>
      </AnimatePresence>

      <Dialog open={isAdoptionModalOpen} onOpenChange={setAdoptionModalOpen}>
        <DialogContent
          data-state={isAdoptionModalOpen ? "open" : "closed"}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-300"
        >
          <DialogHeader>
            <DialogTitle>{t.confirmAdoption}</DialogTitle>
            <DialogDescription asChild>
              <div>
                {pokemonToAdopt?.spriteUrl && (
                  <Image src={pokemonToAdopt.spriteUrl} alt={pokemonToAdopt.name} width={96} height={96} className="mx-auto my-4" />
                )}
                <p className="text-center text-lg font-semibold capitalize">{pokemonToAdopt?.name}</p>
                <p className="text-center text-sm text-slate-500">{t.giveNickname}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            placeholder={pokemonToAdopt?.name}
            className="text-center text-lg"
            maxLength={15}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdoptionModalOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleConfirmAdoption} disabled={!newNickname.trim()}>
              <PlusCircle className="h-4 w-4 mr-2" /> {t.confirmAdoption}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPokedexModalOpen} onOpenChange={setIsPokedexModalOpen}>
        <DialogContent
          className="max-w-4xl h-[80vh] flex flex-col
                     data-[state=open]:animate-in data-[state=closed]:animate-out
                     data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
                     data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95
                     duration-500 ease-in-out"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              {selectedPokemonForDetail ? 'Pokémon Details' : 'Pokedex'}
            </DialogTitle>
          </DialogHeader>
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
          <DialogHeader className="sr-only">
            <DialogTitle>
              {storyPokemonForDetail}
            </DialogTitle>
          </DialogHeader>
          {storyPokemonForDetail && (
            <PokedexDetail pokemonName={storyPokemonForDetail} onBack={handleBackFromStoryPokemonDetail} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoryMvp;
"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { PokeStoryElement, getFourDistinctPureTypePokemon, getRandomStoryElements, GENERATIONS, Generation } from './pokeapi';
import { PokeStoryState, generateNextStoryStep, StoryStepResult, testGeminiConnection } from './gemini';


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
    backToSettings: "Volver a Configuración"
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
    backToSettings: "Back to Settings"
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
    <div style={styles.container}>
      <h1 style={styles.title}>{t.welcomeTitle}</h1>
      <p style={styles.description}>{t.welcomeDescription}</p>
      
      {}
      <div style={styles.settingsSection}>
        <h3 style={styles.settingsTitle}>{t.language}</h3>
        <div style={styles.languageSelector}>
          <button 
            onClick={() => onLanguageChange('es')}
            style={{...styles.settingsButton, ...(language === 'es' ? styles.activeSettingsButton : {})}}
          >
            {t.spanish}
          </button>
          <button 
            onClick={() => onLanguageChange('en')}
            style={{...styles.settingsButton, ...(language === 'en' ? styles.activeSettingsButton : {})}}
          >
            {t.english}
          </button>
        </div>
      </div>

      {}
      <div style={styles.settingsSection}>
        <h3 style={styles.settingsTitle}>{t.selectGenerations}</h3>
        <div style={styles.generationControls}>
          <button 
            onClick={handleSelectAllGenerations}
            style={{...styles.settingsButton, ...(selectedGenerations.length === GENERATIONS.length ? styles.activeSettingsButton : {})}}
          >
            {t.selectAll}
          </button>
        </div>
        <div style={styles.generationGrid}>
          {GENERATIONS.map(gen => (
            <button
              key={gen.id}
              onClick={() => handleGenerationToggle(gen.id)}
              style={{
                ...styles.generationButton,
                ...(selectedGenerations.includes(gen.id) ? styles.activeGenerationButton : {})
              }}
            >
              {gen.displayName}
            </button>
          ))}
        </div>
      </div>

      {}
      <div style={styles.startJourneySection}>
        <button 
          onClick={onStartJourney} 
          style={styles.startJourneyButton}
          disabled={selectedGenerations.length === 0}
        >
          {t.startJourney}
        </button>
        {selectedGenerations.length === 0 && (
          <p style={styles.warningText}>Selecciona al menos una generación para continuar</p>
        )}
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
    <div style={styles.container}>
      <h1 style={styles.title}>{t.chooseProtagonist}</h1>
      <p style={styles.description}>{t.chooseProtagonistDesc}</p>
      
      <button onClick={onBack} style={styles.backButton}>
        {t.backToSettings}
      </button>

      {loading || protagonists.length === 0 ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>{t.loadingProtagonists}</p>
        </div>
      ) : (
        <div style={styles.protagonistSection}>
          <div style={styles.protagonistGrid}>
            {protagonists.map(p => (
              <div key={p.name} style={styles.protagonistCard}>
                {p.spriteUrl && (
                  <img 
                    src={p.spriteUrl} 
                    alt={p.name}
                    style={styles.protagonistImage}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <button 
                  onClick={() => onStart(p)} 
                  style={styles.protagonistButton}
                >
                  {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
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
}

const StoryScreen: React.FC<StoryScreenProps> = ({ 
  storyText, 
  options, 
  onSelectOption, 
  step, 
  storyElements, 
  language 
}) => {
  const t = translations[language];
  
  return (
    <div style={styles.container}>
      <p style={styles.stepIndicator}>{t.step} {step} / 10</p>
      
      {}
      {storyElements.length > 0 && (
        <div style={styles.elementsContainer}>
          {storyElements.slice(-3).map((element, index) => (
            element.spriteUrl && (
              <div key={`${element.name}-${index}`} style={styles.elementCard}>
                <img 
                  src={element.spriteUrl} 
                  alt={element.name}
                  style={styles.elementImage}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span style={styles.elementName}>
                  {element.name.charAt(0).toUpperCase() + element.name.slice(1)}
                </span>
              </div>
            )
          ))}
        </div>
      )}
      
      <div style={styles.storyContent}>
        <p style={styles.storyText}>{storyText}</p>
        <div style={styles.optionsGrid}>
          {options.map((option, index) => (
            <button key={index} onClick={() => onSelectOption(index)} style={styles.optionButton}>
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const LoadingScreen: React.FC<{ language: 'es' | 'en' }> = ({ language }) => {
  const t = translations[language];
  
  return (
    <div style={styles.container}>
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>{t.generatingChapter}</p>
      </div>
    </div>
  );
};

interface EndScreenProps {
  storyHistory: string[];
  protagonist: PokeStoryElement | null;
  onRestart: () => void;
  language: 'es' | 'en';
}
  
const EndScreen: React.FC<EndScreenProps> = ({ storyHistory, protagonist, onRestart, language }) => {
  const t = translations[language];
  
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{t.adventureEnd}</h1>
      <p style={styles.description}>
        {t.storyOf} {protagonist?.name} {t.hasEnded}
      </p>
      {protagonist?.spriteUrl && (
        <img 
          src={protagonist.spriteUrl} 
          alt={protagonist.name}
          style={styles.endScreenImage}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <div style={styles.fullStoryContainer}>
        {storyHistory.map((text, index) => (
          <p key={index} style={styles.storyText}>
            <strong>{t.step} {index + 1}:</strong> {text}
          </p>
        ))}
      </div>
      <button onClick={onRestart} style={styles.restartButton}>
        {t.playAgain}
      </button>
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
      setGameState('story');
    } catch (error) {
      console.error('Error generating next step:', error);
      setErrorMessage(translations[language].unexpectedError);
      setGameState('error');
    }
  }, [storyState, currentStory, selectedGenerations, language]);

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
    setGameState('settings');
  };

  const handleGenerationChange = (generations: number[]) => {
    setSelectedGenerations(generations);
  };

  const handleLanguageChange = (lang: 'es' | 'en') => {
    setLanguage(lang);
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
        return currentStory && (
          <StoryScreen
            storyText={currentStory.storyText}
            options={currentStory.options}
            onSelectOption={handleNextStep}
            step={storyState.currentStep}
            storyElements={storyState.accumulatedElements}
            language={language}
          />
        );
      case 'end':
        return (
          <EndScreen
            storyHistory={storyState.storyHistory}
            protagonist={storyState.protagonist}
            onRestart={handleRestart}
            language={language}
          />
        );
      case 'error':
        return (
          <div style={styles.container}>
            <h1 style={styles.title}>{t.error}</h1>
            <p style={styles.description}>{errorMessage || t.unexpectedError}</p>
            <button onClick={handleRestart} style={styles.restartButton}>{t.restart}</button>
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
    <div style={styles.appContainer}>
      {renderGameState()}
    </div>
  );
};



const styles: { [key: string]: React.CSSProperties } = {
    appContainer: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        maxWidth: '1000px',
        margin: '40px auto',
        padding: '20px',
        backgroundColor: '#f0f2f5',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        color: '#333'
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
    },
    title: {
        fontSize: '2.5rem',
        color: '#2c3e50',
        marginBottom: '10px'
    },
    description: {
        fontSize: '1.2rem',
        color: '#555',
        marginBottom: '30px'
    },
    
    
    settingsSection: {
        marginBottom: '30px',
        width: '100%',
        maxWidth: '800px'
    },
    settingsTitle: {
        fontSize: '1.4rem',
        color: '#2c3e50',
        marginBottom: '15px'
    },
    languageSelector: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        marginBottom: '20px'
    },
    settingsButton: {
        padding: '8px 16px',
        fontSize: '1rem',
        cursor: 'pointer',
        backgroundColor: '#ecf0f1',
        color: '#2c3e50',
        border: '2px solid #bdc3c7',
        borderRadius: '5px',
        transition: 'all 0.3s ease'
    },
    activeSettingsButton: {
        backgroundColor: '#3498db',
        color: 'white',
        borderColor: '#3498db'
    },
    
    
    generationControls: {
        marginBottom: '15px'
    },
    generationGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px',
        marginBottom: '20px'
    },
    generationButton: {
        padding: '10px 15px',
        fontSize: '0.9rem',
        cursor: 'pointer',
        backgroundColor: '#ecf0f1',
        color: '#2c3e50',
        border: '2px solid #bdc3c7',
        borderRadius: '5px',
        transition: 'all 0.3s ease'
    },
    activeGenerationButton: {
        backgroundColor: '#27ae60',
        color: 'white',
        borderColor: '#27ae60'
    },

    
    startJourneySection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
    },
    startJourneyButton: {
        padding: '15px 30px',
        fontSize: '1.2rem',
        cursor: 'pointer',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 8px rgba(231, 76, 60, 0.3)'
    },
    warningText: {
        color: '#e74c3c',
        fontSize: '0.9rem',
        fontStyle: 'italic'
    },

    
    backButton: {
        padding: '8px 16px',
        fontSize: '0.9rem',
        cursor: 'pointer',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        marginBottom: '20px',
        transition: 'background-color 0.3s ease'
    },

    
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '40px'
    },
    
    
    protagonistSection: {
        width: '100%'
    },
    protagonistGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '20px',
        justifyContent: 'center'
    },
    protagonistCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s ease'
    },
    protagonistImage: {
        width: '120px',
        height: '120px',
        objectFit: 'contain',
        marginBottom: '10px'
    },
    protagonistButton: {
        padding: '12px 24px',
        fontSize: '1rem',
        cursor: 'pointer',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        transition: 'background-color 0.3s ease',
        width: '100%'
    },
    
    
    elementsContainer: {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap'
    },
    elementCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        minWidth: '100px'
    },
    elementImage: {
        width: '60px',
        height: '60px',
        objectFit: 'contain',
        marginBottom: '5px'
    },
    elementName: {
        fontSize: '0.8rem',
        color: '#555',
        textAlign: 'center'
    },
    
    
    storyContent: {
        width: '100%'
    },
    stepIndicator: {
        alignSelf: 'flex-end',
        color: '#95a5a6',
        fontSize: '0.9rem',
        marginBottom: '10px'
    },
    storyText: {
        fontSize: '1.1rem',
        lineHeight: '1.6',
        textAlign: 'left',
        whiteSpace: 'pre-wrap',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '5px',
        borderLeft: '4px solid #3498db',
        marginBottom: '20px'
    },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
        width: '100%',
    },
    optionButton: {
        padding: '15px',
        fontSize: '1rem',
        cursor: 'pointer',
        backgroundColor: '#ecf0f1',
        color: '#2c3e50',
        border: '2px solid #bdc3c7',
        borderRadius: '5px',
        transition: 'all 0.3s ease',
        textAlign: 'center'
    },
    
    
    spinner: {
        border: '6px solid #f3f3f3',
        borderTop: '6px solid #3498db',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px',
    },
    
    
    endScreenImage: {
        width: '150px',
        height: '150px',
        objectFit: 'contain',
        marginBottom: '20px'
    },
    fullStoryContainer: {
        maxHeight: '400px',
        overflowY: 'auto',
        border: '1px solid #ddd',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '20px',
        width: '100%',
        backgroundColor: 'white'
    },
    restartButton: {
        padding: '12px 24px',
        fontSize: '1.1rem',
        cursor: 'pointer',
        backgroundColor: '#2ecc71',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        transition: 'background-color 0.3s ease'
    }
};

export default StoryMvp;
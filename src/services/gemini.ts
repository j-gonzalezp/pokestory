import { PokeStoryElement } from "./pokeapi";
import { PlayerPokemon } from "./persistence";
import { StoryChoiceEffects } from "./gameLogic";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { STORY_ICON_NAMES } from '@/lib/app-icons';

export interface PokeStoryState {
  currentStep: number;
  protagonist: PlayerPokemon | null;
  accumulatedElements: PokeStoryElement[];
  storyHistory: string[];
}

export interface StoryOption {
  text: string;
  effects: StoryChoiceEffects;
}

export interface StoryStepResult {
  storyText: string;
  options: StoryOption[];
  iconName?: string;
}

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not configured in environment variables");
  throw new Error("The GEMINI_API_KEY environment variable is not configured. Please set it in your .env file");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const AVAILABLE_ICONS = STORY_ICON_NAMES;

const NARRATIVE_FRAMEWORK = {
  es: [
    { step: 1, phase: "Fase I: El Tetraedro (Fuego)", title: "La Inquietud Latente", description: "El mundo está en aparente equilibrio, pero hay una tensión subyacente. Es la madera seca esperando la chispa. Presenta el escenario y la sensación de que algo está por suceder." },
    { step: 2, phase: "Fase I: El Tetraedro (Fuego)", title: "El Incidente Catalizador", description: "La chispa. Un evento súbito, agudo e ineludible rompe el equilibrio y enciende la trama. Este evento debe forzar al protagonista a actuar." },
    { step: 3, phase: "Fase II: El Cubo (Tierra)", title: "El Status Quo y sus Muros", description: "Describe el mundo 'normal' del protagonista, con sus reglas y limitaciones. Muestra la 'zona de confort' que, aunque segura, también es una prisión." },
    { step: 4, phase: "Fase II: El Cubo (Tierra)", title: "La Resistencia al Cambio", description: "El protagonista, consciente del incidente, trata de aferrarse a la solidez de su mundo. Busca excusas y se resiste a la llamada a la aventura." },
    { step: 5, phase: "Fase III: El Octaedro (Aire)", title: "El Cruce del Umbral", description: "El protagonista finalmente toma una decisión irrevocable. Deja atrás la seguridad y se aventura en lo desconocido, aceptando su viaje. Es el punto de no retorno." },
    { step: 6, phase: "Fase III: El Octaedro (Aire)", title: "Pruebas, Aliados y Nuevas Corrientes", description: "En este nuevo entorno, el protagonista aprende las nuevas reglas. Enfrenta pruebas iniciales, conoce aliados y enemigos, y comienza a entender la verdadera naturaleza del conflicto." },
    { step: 7, phase: "Fase IV: El Icosaedro (Agua)", title: "La Inmersión en Crisis", description: "La trama se vuelve exponencialmente más complicada. Múltiples peligros y revelaciones convergen. La situación se vuelve fluida, impredecible y abrumadora, como una corriente que no se puede controlar." },
    { step: 8, phase: "Fase IV: El Icosaedro (Agua)", title: "El Punto Más Profundo", description: "El protagonista toca fondo. Es el momento de máxima desesperación, la prueba definitiva de fe. Se enfrenta a su mayor miedo o a una traición. Debe dejar ir su antiguo yo para renacer." },
    { step: 9, phase: "Fase V: El Dodecaedro (Éter)", title: "La Epifanía y el Clímax", description: "Desde las profundidades de la crisis, el protagonista emerge con un nuevo entendimiento. Todas las piezas encajan en su lugar. Armado con esta revelación, enfrenta el clímax final con sabiduría." },
    { step: 10, phase: "Fase V: El Dodecaedro (Éter)", title: "El Nuevo Cosmos", description: "La resolución. El conflicto se resuelve y se establece un nuevo orden. El protagonista integra la lección aprendida y transforma su mundo. El final no es un regreso al inicio, sino la creación de un nuevo universo más completo." }
  ],
  en: [
    { step: 1, phase: "Phase I: The Tetrahedron (Fire)", title: "The Latent Restlessness", description: "The world is in apparent balance, but there is an underlying tension. It is the dry wood waiting for the spark. Introduce the setting and a sense that something is about to happen." },
    { step: 2, phase: "Phase I: The Tetrahedron (Fire)", title: "The Catalyzing Incident", description: "The spark. A sudden, sharp, and inescapable event breaks the balance and ignites the plot. This event must force the protagonist to act." },
    { step: 3, phase: "Phase II: The Cube (Earth)", title: "The Status Quo and its Walls", description: "Describe the protagonist's 'normal' world, with its rules and limitations. Show the 'comfort zone' that, although safe, is also a prison." },
    { step: 4, phase: "Phase II: The Cube (Earth)", title: "The Resistance to Change", description: "The protagonist, aware of the incident, tries to cling to the solidity of their world. They look for excuses and resist the call to adventure." },
    { step: 5, phase: "Phase III: The Octahedron (Air)", title: "The Crossing of the Threshold", description: "The protagonist finally makes an irrevocable decision. They leave behind safety and venture into the unknown, accepting their journey. This is the point of no return." },
    { step: 6, phase: "Phase III: The Octahedron (Air)", title: "Trials, Allies, and New Currents", description: "In this new environment, the protagonist learns the new rules. They face initial trials, meet allies and enemies, and begin to understand the true nature of the conflict." },
    { step: 7, phase: "Phase IV: The Icosahedron (Water)", title: "The Immersion in Crisis", description: "The plot becomes exponentially more complicated. Multiple dangers and revelations converge. The situation becomes fluid, unpredictable, and overwhelming, like a current that cannot be controlled." },
    { step: 8, phase: "Phase IV: The Icosahedron (Water)", title: "The Deepest Point", description: "The protagonist hits rock bottom. It is the moment of maximum despair, the ultimate test of faith. They face their greatest fear or a betrayal. They must let go of their old self in order to be reborn." },
    { step: 9, phase: "Phase V: The Dodecahedron (Aether)", title: "The Epiphany and the Climax", description: "From the depths of the crisis, the protagonist emerges with a new understanding. All the pieces fall into place. Armed with this revelation, they face the final climax with wisdom." },
    { step: 10, phase: "Phase V: The Dodecahedron (Aether)", title: "The New Cosmos", description: "The resolution. The conflict is resolved and a new order is established. The protagonist integrates the lesson learned and transforms their world. The end is not a return to the beginning, but the creation of a new, more complete universe." }
  ]
};

const buildPrompt = (
  currentState: PokeStoryState,
  newElements: PokeStoryElement[],
  narrativeGuide: { step: number; phase: string; title: string; description:string },
  language: 'es' | 'en' = 'es'
): string => {
  const { protagonist } = currentState;
  const storyContext = currentState.storyHistory.length > 0
    ? `\n\nPrevious story context:\n${currentState.storyHistory.join('\n\n')}`
    : '';

  const protagonistState = protagonist
    ? `
- Protagonist: ${protagonist.nickname} the ${protagonist.speciesName} (Level ${protagonist.level})
- Current State: ${protagonist.stats.currentHP}/${protagonist.stats.maxHP} HP, ${protagonist.stats.currentMorale}/${protagonist.stats.maxMorale} Morale
- Traits: ${protagonist.traits.join(', ') || "None"}
`
    : '- Protagonist: A brave trainer';

  const prompts = {
    es: `
Eres un Game Master para un RPG de Pokémon. Tu rol es crear una narrativa y las consecuencias de las decisiones del jugador.

**Paso Narrativo Actual:**
- Paso: ${narrativeGuide.step}/10
- Título: ${narrativeGuide.title}
- Objetivo: ${narrativeGuide.description}

**Estado del Protagonista:**
${protagonistState}

**Elementos de la Historia:**
- Nuevos elementos a incorporar: ${newElements.map(e => e.name).join(", ") || "Ninguno"}
${storyContext}

**Iconos Disponibles:** ${AVAILABLE_ICONS.join(', ')}

**REQUISITOS ESTRICTOS:**
1.  Escribe un segmento de historia (100-200 palabras) que siga el objetivo narrativo e incorpore los nuevos elementos.
2.  Crea EXACTAMENTE 4 opciones de decisión para el jugador.
3.  Para CADA opción, asigna un objeto \`effects\` con consecuencias numéricas:
    - \`xp\`: Experiencia ganada (0-100). Acciones valientes o inteligentes dan más XP.
    - \`hp\`: Cambio en la vida (ej: -10 por recibir daño, 0 si no hay riesgo, 5 por encontrar comida).
    - \`morale\`: Cambio en la moral (ej: -15 por un susto, 10 por una victoria).
    - \`newTrait\`: Un nuevo rasgo de personalidad (string) si la acción es definitoria (ej: "Estratega", "Temerario"). Si no hay rasgo, usa \`null\`.
4.  Selecciona UN icono de la lista que represente el momento.
5.  TODO el texto debe estar en ESPAÑOL.

**Formato de Respuesta - DEBE ser JSON VÁLIDO:**
{
  "storyText": "Tu texto de historia aquí...",
  "options": [
    { "text": "Descripción de la opción 1", "effects": { "xp": 50, "hp": -10, "morale": 5, "newTrait": null } },
    { "text": "Descripción de la opción 2", "effects": { "xp": 20, "hp": 0, "morale": -5, "newTrait": "Cauto" } },
    { "text": "Descripción de la opción 3", "effects": { "xp": 35, "hp": 0, "morale": 10, "newTrait": null } },
    { "text": "Descripción de la opción 4", "effects": { "xp": 10, "hp": 0, "morale": -10, "newTrait": null } }
  ],
  "iconName": "NombreDelIconoElegido"
}
`,
    en: `
You are a Game Master for a Pokémon RPG. Your role is to create a narrative and the consequences of the player's decisions.

**Current Narrative Step:**
- Step: ${narrativeGuide.step}/10
- Title: ${narrativeGuide.title}
- Objective: ${narrativeGuide.description}

**Protagonist's State:**
${protagonistState}

**Story Elements:**
- New elements to incorporate: ${newElements.map(e => e.name).join(", ") || "None"}
${storyContext}

**Available Icons:** ${AVAILABLE_ICONS.join(', ')}

**STRICT REQUIREMENTS:**
1.  Write a story segment (100-200 words) following the narrative objective and incorporating the new elements.
2.  Create EXACTLY 4 decision options for the player.
3.  For EACH option, assign an \`effects\` object with numerical consequences:
    - \`xp\`: Experience gained (0-100). Brave or clever actions grant more XP.
    - \`hp\`: Change in health (e.g., -10 for taking damage, 0 for no risk, 5 for finding food).
    - \`morale\`: Change in morale (e.g., -15 for a scare, 10 for a victory).
    - \`newTrait\`: A new personality trait (string) if the action is defining (e.g., "Strategist", "Reckless"). If no trait, use \`null\`.
4.  Select ONE icon from the list that represents the moment.
5.  ALL text must be in ENGLISH.

**Response Format - MUST be VALID JSON:**
{
  "storyText": "Your story text here...",
  "options": [
    { "text": "Description for option 1", "effects": { "xp": 50, "hp": -10, "morale": 5, "newTrait": null } },
    { "text": "Description for option 2", "effects": { "xp": 20, "hp": 0, "morale": -5, "newTrait": "Cautious" } },
    { "text": "Description for option 3", "effects": { "xp": 35, "hp": 0, "morale": 10, "newTrait": null } },
    { "text": "Description for option 4", "effects": { "xp": 10, "hp": 0, "morale": -10, "newTrait": null } }
  ],
  "iconName": "ChosenIconName"
}
`
  };

  return prompts[language].trim();
};

const validateStoryResponse = (response: unknown): response is StoryStepResult => {
  const res = response as Record<string, unknown>;
  if (typeof res !== 'object' || res === null || typeof res.storyText !== 'string' || !Array.isArray(res.options) || res.options.length !== 4) {
    return false;
  }
  return res.options.every((opt: StoryOption) =>
    typeof opt === 'object' &&
    opt !== null &&
    typeof opt.text === 'string' &&
    typeof opt.effects === 'object' &&
    opt.effects !== null &&
    typeof opt.effects.xp === 'number' &&
    typeof opt.effects.hp === 'number' &&
    typeof opt.effects.morale === 'number' &&
    (typeof opt.effects.newTrait === 'string' || opt.effects.newTrait === null)
  );
};

const cleanJsonResponse = (text: string): string => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text.trim();
};

const validateIconName = (iconName: string | undefined): string => {
  if (!iconName || !AVAILABLE_ICONS.includes(iconName)) {
    console.warn(`Invalid or missing icon name: ${iconName}. Using default MapPin.`);
    return 'MapPin';
  }
  return iconName;
};

export const generateNextStoryStep = async (
  currentState: PokeStoryState,
  newElements: PokeStoryElement[],
  language: 'es' | 'en' = 'es'
): Promise<StoryStepResult> => {
  try {
    if (currentState.currentStep < 1 || currentState.currentStep > 10) {
      throw new Error(`Invalid step: ${currentState.currentStep}.`);
    }
    const narrativeGuide = NARRATIVE_FRAMEWORK[language].find(f => f.step === currentState.currentStep);
    if (!narrativeGuide) {
      throw new Error(`No narrative guide found for step ${currentState.currentStep}`);
    }

    console.log(`Generating story for step ${currentState.currentStep}: ${narrativeGuide.title}`);
    const prompt = buildPrompt(currentState, newElements, narrativeGuide, language);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error("Empty response from Gemini.");
    }

    const cleanedResponse = cleanJsonResponse(responseText);
    const parsedResponse = JSON.parse(cleanedResponse);

    if (!validateStoryResponse(parsedResponse)) {
      console.error("Invalid response structure:", parsedResponse);
      throw new Error("Gemini's response does not have the expected RPG format.");
    }

    parsedResponse.iconName = validateIconName(parsedResponse.iconName);
    return parsedResponse as StoryStepResult;

  } catch (error) {
    console.error("Error in generateNextStoryStep:", error);
    const fallbackMessage = language === 'es' ? "Lo siento, hubo un problema generando la historia." : "Sorry, there was a problem generating the story.";
    return {
      storyText: `${fallbackMessage} ${error instanceof Error ? error.message : 'Unknown error'}`,
      options: [
        { text: language === 'es' ? "Intentar continuar" : "Try to continue", effects: { xp: 10, hp: 0, morale: 0, newTrait: null } },
        { text: language === 'es' ? "Explorar los alrededores" : "Explore surroundings", effects: { xp: 10, hp: 0, morale: 0, newTrait: null } },
        { text: language === 'es' ? "Revisar tu equipo" : "Check your gear", effects: { xp: 5, hp: 0, morale: 5, newTrait: null } },
        { text: language === 'es' ? "Tomar un descanso" : "Take a break", effects: { xp: 0, hp: 5, morale: 5, newTrait: null } },
      ],
      iconName: "AlertTriangle"
    };
  }
};

export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    const result = await model.generateContent("Respond with a simple 'OK' if you can read this message.");
    const responseText = result.response.text();
    return responseText?.includes('OK') || false;
  } catch (error) {
    console.error("Gemini connection error:", error);
    return false;
  }
};

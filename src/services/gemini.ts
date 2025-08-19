import { PokeStoryElement } from "./pokeapi"
import { GoogleGenAI } from "@google/genai"

export interface PokeStoryState {
  currentStep: number
  protagonist: PokeStoryElement | null
  accumulatedElements: PokeStoryElement[]
  storyHistory: string[]
}

export interface StoryStepResult {
  storyText: string
  options: string[]
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.error("⚠️  GEMINI_API_KEY is not configured in environment variables")
  throw new Error("The GEMINI_API_KEY environment variable is not configured. Please set it in your .env file")
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY
});

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
}

const buildPrompt = (
  currentState: PokeStoryState,
  newElements: PokeStoryElement[],
  narrativeGuide: { step: number; phase: string; title: string; description: string },
  language: 'es' | 'en' = 'es'
): string => {
  const storyContext = currentState.storyHistory.length > 0
    ? `\n\nPrevious story context:\n${currentState.storyHistory.join('\n\n')}`
    : ''

  const prompts = {
    es: `
Eres un maestro narrador creando una aventura inmersiva de Pokémon. Sigue estas pautas estrictamente:

**Paso Narrativo Actual:**
- Paso: ${narrativeGuide.step}/10
- Fase: ${narrativeGuide.phase}
- Título: ${narrativeGuide.title}
- Objetivo: ${narrativeGuide.description}

**Elementos de la Historia:**
- Protagonista: ${currentState.protagonist ? currentState.protagonist.name : "Un entrenador valiente"}
- Elementos actuales: ${currentState.accumulatedElements.map(e => e.name).join(", ") || "Ninguno todavía"}
- Nuevos elementos a incorporar: ${newElements.map(e => e.name).join(", ") || "Ninguno"}
${storyContext}

**Requisitos:**
1. Escribe un segmento de historia convincente (100-200 palabras)
2. Incorpora TODOS los nuevos elementos de manera natural en la narrativa
3. Sigue el tono emocional y objetivos de la fase actual
4. Crea exactamente 4 opciones significativas que hagan avanzar la historia
5. Mantén consistencia con eventos previos de la historia
6. Usa descripciones vívidas y diálogo atractivo
7. ESCRIBE TODO EL TEXTO EN ESPAÑOL

**Formato de Respuesta - DEBE ser JSON válido:**
{
  "storyText": "Tu texto de historia aquí...",
  "options": [
    "Descripción de la primera opción",
    "Descripción de la segunda opción",
    "Descripción de la tercera opción",
    "Descripción de la cuarta opción"
  ]
}

Escribe el segmento de historia ahora:
    `,
    en: `
You are a master storyteller creating an immersive Pokémon adventure story. Follow these guidelines strictly:

**Current Narrative Step:**
- Step: ${narrativeGuide.step}/10
- Phase: ${narrativeGuide.phase}
- Title: ${narrativeGuide.title}
- Objective: ${narrativeGuide.description}

**Story Elements:**
- Protagonist: ${currentState.protagonist ? currentState.protagonist.name : "A brave trainer"}
- Current elements: ${currentState.accumulatedElements.map(e => e.name).join(", ") || "None yet"}
- New elements to incorporate: ${newElements.map(e => e.name).join(", ") || "None"}
${storyContext}

**Requirements:**
1. Write a compelling story segment (100-200 words)
2. Incorporate ALL new elements naturally into the narrative
3. Follow the current phase's emotional tone and objectives
4. Create exactly 4 meaningful choices that advance the story
5. Maintain consistency with previous story events
6. Use vivid descriptions and engaging dialogue
7. WRITE ALL TEXT IN ENGLISH

**Response Format - MUST be valid JSON:**
{
  "storyText": "Your story text here...",
  "options": [
    "First choice description",
    "Second choice description",
    "Third choice description",
    "Fourth choice description"
  ]
}

Write the story segment now:
    `
  }

  return prompts[language].trim()
}

const validateStoryResponse = (response: any): response is StoryStepResult => {
  return (
    response &&
    typeof response === 'object' &&
    typeof response.storyText === 'string' &&
    Array.isArray(response.options) &&
    response.options.length === 4 &&
    response.options.every((option: any) => typeof option === 'string')
  )
}

const cleanJsonResponse = (text: string): string => {
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '')

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return jsonMatch[0]
  }

  return text.trim()
}

export const generateNextStoryStep = async (
  currentState: PokeStoryState,
  newElements: PokeStoryElement[],
  language: 'es' | 'en' = 'es'
): Promise<StoryStepResult> => {
  try {
    if (currentState.currentStep < 1 || currentState.currentStep > 10) {
      throw new Error(`Invalid step: ${currentState.currentStep}. Must be between 1 and 10.`)
    }

    const narrativeGuide = NARRATIVE_FRAMEWORK[language].find(f => f.step === currentState.currentStep)
    if (!narrativeGuide) {
      throw new Error(`No narrative guide found for step ${currentState.currentStep}`)
    }

    console.log(`🎮 Generating story for step ${currentState.currentStep}: ${narrativeGuide.title}`)

    const prompt = buildPrompt(currentState, newElements, narrativeGuide, language)

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
        thinkingConfig: {
          thinkingBudget: 0, 
        },
      }
    });

    const responseText = response.text;

    if (!responseText) {
      console.error("❌ Gemini returned an empty text response. Full response object:", response);
      throw new Error("Empty response from Gemini. Check your API configuration or prompt.");
    }

    console.log("📝 Raw Gemini response:", responseText.substring(0, 200) + "...")

    const cleanedResponse = cleanJsonResponse(responseText)

    let parsedResponse: any
    try {
      parsedResponse = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error("❌ Error parsing JSON:", parseError)
      console.error("Cleaned response:", cleanedResponse)
      throw new Error(`Error parsing JSON response: ${parseError}`)
    }

    if (!validateStoryResponse(parsedResponse)) {
      console.error("❌ Invalid response:", parsedResponse)
      throw new Error("Gemini's response does not have the expected format")
    }

    console.log("✅ Story successfully generated")

    return parsedResponse as StoryStepResult

  } catch (error) {
    console.error("❌ Error in generateNextStoryStep:", error)

    const fallbackMessages = {
      es: {
        storyText: `Lo siento, hubo un problema generando la historia en este momento. ${error instanceof Error ? error.message : 'Error desconocido'}`,
        options: [
          "Tratar de continuar la aventura",
          "Explorar los alrededores",
          "Revisar tu equipo",
          "Tomar un descanso"
        ]
      },
      en: {
        storyText: `Sorry, there was a problem generating the story at this moment. ${error instanceof Error ? error.message : 'Unknown error'}`,
        options: [
          "Try to continue the adventure",
          "Explore the surroundings",
          "Check your equipment",
          "Take a break"
        ]
      }
    }

    return fallbackMessages[language]
  }
}

export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Respond with a simple 'OK' if you can read this message.",
      config: {
        temperature: 0,
        maxOutputTokens: 10,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      }
    });

    const responseText = response.text;

    return responseText?.includes('OK') || false;
  } catch (error) {
    console.error("❌ Gemini connection error:", error);
    return false;
  }
}
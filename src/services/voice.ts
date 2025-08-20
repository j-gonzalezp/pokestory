import { GoogleGenAI } from "@google/genai"

export interface VoiceOptions {
  language: 'es' | 'en'
  voiceName?: string
  style?: string
}

export interface VoiceResult {
  audioData: Uint8Array
  success: boolean
  error?: string
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY2

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not configured in environment variables")
  throw new Error("The GEMINI_API_KEY environment variable is not configured. Please set it in your .env file")
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY
})

const STORYTELLING_VOICES = {
  es: {
    primary: 'Kore',
    alternative: 'Orus',
    dramatic: 'Fenrir',
    gentle: 'Vindemiatrix'
  },
  en: {
    primary: 'Zephyr',
    alternative: 'Charon',
    dramatic: 'Puck',
    gentle: 'Callirrhoe'
  }
} as const

type VoiceType = keyof typeof STORYTELLING_VOICES.es | keyof typeof STORYTELLING_VOICES.en

const getVoiceForLanguage = (language: 'es' | 'en', voiceType: VoiceType = 'primary'): string => {
  return STORYTELLING_VOICES[language][voiceType as keyof typeof STORYTELLING_VOICES[typeof language]]
}

const buildStorytellingPrompt = (text: string, language: 'es' | 'en', style?: string): string => {
  const styleInstructions = {
    es: {
      default: "Narra de manera cautivadora y envolvente, como un cuentacuentos experimentado. Usa un ritmo pausado y expresivo.",
      dramatic: "Narra con intensidad dramática, enfatizando los momentos de tensión y emoción.",
      gentle: "Narra de manera suave y tranquila, como contando un cuento antes de dormir.",
      excited: "Narra con entusiasmo y energía, transmitiendo la emoción de la aventura.",
      mysterious: "Narra con un tono misterioso e intrigante, creando atmósfera de suspense."
    },
    en: {
      default: "Narrate in a captivating and immersive way, like an experienced storyteller. Use a measured and expressive pace.",
      dramatic: "Narrate with dramatic intensity, emphasizing moments of tension and emotion.",
      gentle: "Narrate softly and calmly, like telling a bedtime story.",
      excited: "Narrate with enthusiasm and energy, conveying the excitement of adventure.",
      mysterious: "Narrate with a mysterious and intriguing tone, creating an atmosphere of suspense."
    }
  }

  const instruction = styleInstructions[language][style as keyof typeof styleInstructions[typeof language]] || 
                    styleInstructions[language].default

  return `${instruction}\n\n"${text}"`
}

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}


const ensureArrayBuffer = (buffer: ArrayBufferLike): ArrayBuffer => {
  if (buffer instanceof ArrayBuffer) {
    return buffer
  }

  const arrayBuffer = new ArrayBuffer(buffer.byteLength)
  new Uint8Array(arrayBuffer).set(new Uint8Array(buffer))
  return arrayBuffer
}

export const generateSpeech = async (
  text: string, 
  options: VoiceOptions = { language: 'es' }
): Promise<VoiceResult> => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for speech generation')
    }

    const voiceType = detectVoiceType(text)
    const voiceName = options.voiceName || getVoiceForLanguage(options.language, voiceType)
    
    console.log(`Generating speech with voice: ${voiceName} for language: ${options.language}`)

    const prompt = buildStorytellingPrompt(text, options.language, options.style)

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: prompt,
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName,
            }
          }
        }
      }
    })

    if (!response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      throw new Error("No audio data received from Gemini TTS")
    }

    const audioBase64 = response.candidates[0].content.parts[0].inlineData.data
    const audioData = base64ToUint8Array(audioBase64)

    console.log("Speech successfully generated")

    return {
      audioData,
      success: true
    }

  } catch (error) {
    console.error("Error in generateSpeech:", error)
    
    return {
      audioData: new Uint8Array(),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

const detectVoiceType = (text: string): VoiceType => {
  const lowerText = text.toLowerCase()
  
  const dramaticWords = ['peligro', 'battle', 'fight', 'danger', 'crisis', 'urgent', 'emergencia', 'lucha', 'combate']
  const gentleWords = ['peace', 'calm', 'quiet', 'gentle', 'soft', 'paz', 'tranquil', 'suave', 'descanso']
  const excitedWords = ['adventure', 'exciting', 'amazing', 'incredible', 'aventura', 'emocionante', 'increíble', 'fantástico']
  
  if (dramaticWords.some(word => lowerText.includes(word))) {
    return 'dramatic'
  }
  
  if (gentleWords.some(word => lowerText.includes(word))) {
    return 'gentle'
  }
  
  if (excitedWords.some(word => lowerText.includes(word))) {
    return 'dramatic'
  }
  
  return 'primary'
}

export const playAudio = (audioData: Uint8Array): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
   
      const originalBuffer = audioData.buffer.slice(
        audioData.byteOffset,
        audioData.byteOffset + audioData.byteLength
      )
      

      const safeBuffer = ensureArrayBuffer(originalBuffer)

      const audioBlob = new Blob([safeBuffer], { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        resolve()
      }

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl)
        reject(new Error('Failed to play audio'))
      }

      audio.play().catch(reject)
    } catch (error) {
      reject(error)
    }
  })
}

export const downloadAudio = (
  audioData: Uint8Array,
  filename: string = 'story_audio.wav'
): void => {
  try {
  
    const originalBuffer = audioData.buffer.slice(
      audioData.byteOffset,
      audioData.byteOffset + audioData.byteLength
    )
   
    const safeBuffer = ensureArrayBuffer(originalBuffer)

    const audioBlob = new Blob([safeBuffer], { type: 'audio/wav' })
    const url = URL.createObjectURL(audioBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading audio:', error)
  }
}

export const testTTSConnection = async (): Promise<boolean> => {
  try {
    const testResult = await generateSpeech("Test", { language: 'en' })
    return testResult.success
  } catch (error) {
    console.error("TTS connection test failed:", error)
    return false
  }
}

export const speakText = async (
  text: string, 
  options: VoiceOptions = { language: 'es' }
): Promise<boolean> => {
  try {
    const result = await generateSpeech(text, options)
    
    if (!result.success) {
      console.error("Speech generation failed:", result.error)
      return false
    }
    
    await playAudio(result.audioData)
    return true
    
  } catch (error) {
    console.error("Error in speakText:", error)
    return false
  }
}

export const AVAILABLE_VOICES = STORYTELLING_VOICES

export type { VoiceType }
import { PlayerPokemon } from './persistence'
import { PokeStoryElement } from './pokeapi'

export interface StoryChoiceEffects {
  xp: number
  hp: number
  morale: number
  newTrait: string | null
}

const BASE_HP = 50
const BASE_MORALE = 100
const XP_FOR_LEVEL_2 = 100
const XP_SCALING_FACTOR = 1.5

const HP_GAIN_PER_LEVEL = 10
const MORALE_GAIN_PER_LEVEL = 5

export const createInitialPokemon = (pokemonElement: PokeStoryElement, nickname: string): PlayerPokemon => {
  return {
    id: `${Date.now()}-${pokemonElement.name}`,
    speciesName: pokemonElement.name,
    nickname: nickname || pokemonElement.name,
    level: 1,
    xp: 0,
    xpToNextLevel: XP_FOR_LEVEL_2,
    stats: {
      maxHP: BASE_HP,
      currentHP: BASE_HP,
      maxMorale: BASE_MORALE,
      currentMorale: BASE_MORALE,
    },
    traits: [],
    spriteUrl: pokemonElement.spriteUrl || '',
  }
}

export const applyEffects = (pokemon: PlayerPokemon, effects: StoryChoiceEffects): PlayerPokemon => {
  let updatedPokemon = JSON.parse(JSON.stringify(pokemon)) as PlayerPokemon

  updatedPokemon.stats.currentHP = Math.max(0, Math.min(updatedPokemon.stats.maxHP, updatedPokemon.stats.currentHP + effects.hp))
  updatedPokemon.stats.currentMorale = Math.max(0, Math.min(updatedPokemon.stats.maxMorale, updatedPokemon.stats.currentMorale + effects.morale))

  if (effects.newTrait && !updatedPokemon.traits.includes(effects.newTrait)) {
    updatedPokemon.traits.push(effects.newTrait)
  }

  if (effects.xp > 0) {
    updatedPokemon = addXp(updatedPokemon, effects.xp)
  }

  return updatedPokemon
}

const addXp = (pokemon: PlayerPokemon, amount: number): PlayerPokemon => {
  let updatedPokemon = { ...pokemon }
  updatedPokemon.xp += amount

  while (updatedPokemon.xp >= updatedPokemon.xpToNextLevel) {
    updatedPokemon = levelUp(updatedPokemon)
  }

  return updatedPokemon
}

const levelUp = (pokemon: PlayerPokemon): PlayerPokemon => {
  const updatedPokemon = { ...pokemon }

  const remainingXp = updatedPokemon.xp - updatedPokemon.xpToNextLevel

  updatedPokemon.level += 1
  updatedPokemon.xp = remainingXp

  updatedPokemon.xpToNextLevel = Math.floor(updatedPokemon.xpToNextLevel * XP_SCALING_FACTOR)

  updatedPokemon.stats.maxHP += HP_GAIN_PER_LEVEL
  updatedPokemon.stats.maxMorale += MORALE_GAIN_PER_LEVEL

  updatedPokemon.stats.currentHP = updatedPokemon.stats.maxHP
  updatedPokemon.stats.currentMorale = updatedPokemon.stats.maxMorale

  console.log(`${updatedPokemon.nickname} subió al nivel ${updatedPokemon.level}!`)

  return updatedPokemon
}

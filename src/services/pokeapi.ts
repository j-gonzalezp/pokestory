export interface ApiListItem {
  name: string
  url: string
}

export interface PokemonDetails {
  id: number
  name: string
  types: string[]
  height: number
  weight: number
  spriteUrl: string
  cryUrl: string
  description: string
}

export interface PokeStoryElement {
  name: string
  internalUrl: string
  type: 'pokemon' | 'item' | 'location' | 'ability'
  spriteUrl?: string
  id: number
}

export interface Generation {
  id: number
  name: string
  displayName: string
  pokemonRange: { start: number, end: number }
}

export const GENERATIONS: Generation[] = [
  { id: 1, name: 'generation-i', displayName: 'Gen I (Kanto)', pokemonRange: { start: 1, end: 151 } },
  { id: 2, name: 'generation-ii', displayName: 'Gen II (Johto)', pokemonRange: { start: 152, end: 251 } },
  { id: 3, name: 'generation-iii', displayName: 'Gen III (Hoenn)', pokemonRange: { start: 252, end: 386 } },
  { id: 4, name: 'generation-iv', displayName: 'Gen IV (Sinnoh)', pokemonRange: { start: 387, end: 493 } },
  { id: 5, name: 'generation-v', displayName: 'Gen V (Unova)', pokemonRange: { start: 494, end: 649 } },
  { id: 6, name: 'generation-vi', displayName: 'Gen VI (Kalos)', pokemonRange: { start: 650, end: 721 } },
  { id: 7, name: 'generation-vii', displayName: 'Gen VII (Alola)', pokemonRange: { start: 722, end: 809 } },
  { id: 8, name: 'generation-viii', displayName: 'Gen VIII (Galar)', pokemonRange: { start: 810, end: 905 } },
  { id: 9, name: 'generation-ix', displayName: 'Gen IX (Paldea)', pokemonRange: { start: 906, end: 1025 } },
]

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'

const getRandomInt = (max: number): number => Math.floor(Math.random() * max) + 1

const getRandomIntInRange = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

export const getRegions = async (): Promise<ApiListItem[]> => {
  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/region`)
    if (!response.ok) throw new Error('Network response was not ok.')
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error("Error fetching regions:", error)
    return []
  }
}

export const getPokemonList = async (page: number, limit: number = 30): Promise<ApiListItem[]> => {
  const offset = (page - 1) * limit
  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`)
    if (!response.ok) throw new Error('Network response was not ok.')
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error("Error fetching Pokémon list:", error)
    return []
  }
}

export const getPokemonDetails = async (idOrName: string | number, language: string = 'en'): Promise<PokemonDetails> => {
  try {
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`${POKEAPI_BASE_URL}/pokemon/${idOrName}`),
      fetch(`${POKEAPI_BASE_URL}/pokemon-species/${idOrName}`)
    ])

    if (!pokemonRes.ok || !speciesRes.ok) {
      throw new Error(`Pokémon with id/name '${idOrName}' not found.`)
    }

    const pokemonData = await pokemonRes.json()
    const speciesData = await speciesRes.json()

    const languageCode = language === 'es' ? 'es' : 'en'
    const descriptionEntry = speciesData.flavor_text_entries.find(
      (entry: any) => entry.language.name === languageCode
    ) || speciesData.flavor_text_entries.find(
      (entry: any) => entry.language.name === 'en'
    )
    
    const description = descriptionEntry
      ? descriptionEntry.flavor_text.replace(/[\n\f]/g, ' ')
      : 'No description available for this Pokémon.'

    return {
      id: pokemonData.id,
      name: pokemonData.name,
      types: pokemonData.types.map((t: any) => t.type.name),
      height: pokemonData.height,
      weight: pokemonData.weight,
      spriteUrl: pokemonData.sprites.other?.['official-artwork']?.front_default || pokemonData.sprites.front_default,
      cryUrl: pokemonData.cries?.latest || pokemonData.cries?.legacy || '',
      description: description,
    }
  } catch (error) {
    console.error(`Error fetching details for Pokémon ${idOrName}:`, error)
    throw error
  }
}

export const getPokemonListByRegions = async (regionNames: string[]): Promise<ApiListItem[]> => {
  if (regionNames.length === 0) return []
  try {
    const regionPromises = regionNames.map(name => fetch(`${POKEAPI_BASE_URL}/region/${name}`))
    const regionResponses = await Promise.all(regionPromises)
    const regionJsonPromises = regionResponses.map(res => res.ok ? res.json() : null)
    const regionsData = await Promise.all(regionJsonPromises)

    const pokedexUrls = regionsData
      .filter(Boolean)
      .flatMap(region => region.pokedexes.map((pokedex: ApiListItem) => pokedex.url))
    
    const pokedexPromises = pokedexUrls.map(url => fetch(url))
    const pokedexResponses = await Promise.all(pokedexPromises)
    const pokedexJsonPromises = pokedexResponses.map(res => res.ok ? res.json() : null)
    const pokedexesData = await Promise.all(pokedexJsonPromises)

    const pokemonMap = new Map<string, ApiListItem>()
    pokedexesData.filter(Boolean).forEach(pokedex => {
      pokedex.pokemon_entries.forEach((entry: any) => {
        const species = entry.pokemon_species
        if (!pokemonMap.has(species.name)) {
          const pokemonUrl = species.url.replace('/pokemon-species/', '/pokemon/')
          pokemonMap.set(species.name, { name: species.name, url: pokemonUrl })
        }
      })
    })

    const uniquePokemonList = Array.from(pokemonMap.values())
    uniquePokemonList.sort((a, b) => a.name.localeCompare(b.name))
    
    return uniquePokemonList
  } catch (error) {
    console.error("Error fetching Pokémon by regions:", error)
    return []
  }
}

export const getLocationsByRegions = async (regionNames: string[]): Promise<ApiListItem[]> => {
  if (regionNames.length === 0) return []

  try {
    const regionPromises = regionNames.map(name => fetch(`${POKEAPI_BASE_URL}/region/${name}`))
    const regionResponses = await Promise.all(regionPromises)
    const regionJsonPromises = regionResponses.map(res => res.ok ? res.json() : null)
    const regionsData = await Promise.all(regionJsonPromises)

    const locationMap = new Map<string, ApiListItem>()
    regionsData.filter(Boolean).forEach(region => {
      region.locations.forEach((location: ApiListItem) => {
        if(!locationMap.has(location.name)) {
          locationMap.set(location.name, location)
        }
      })
    })

    const uniqueLocationList = Array.from(locationMap.values())
    uniqueLocationList.sort((a, b) => a.name.localeCompare(b.name))
    return uniqueLocationList
  } catch (error) {
    console.error("Error fetching locations by regions:", error)
    return []
  }
}

export const getFourDistinctPureTypePokemon = async (selectedGenerations: number[] = []): Promise<PokeStoryElement[]> => {
  const pureTypePokemons: PokeStoryElement[] = []
  const usedTypeIds = new Set<number>()
  const totalTypes = 18

  const generationsToUse = selectedGenerations.length > 0 ? selectedGenerations : GENERATIONS.map(g => g.id)
  
  const allowedRanges = generationsToUse.map(genId =>
    GENERATIONS.find(g => g.id === genId)?.pokemonRange
  ).filter(Boolean) as { start: number, end: number }[]

  const isPokemonInAllowedGenerations = (pokemonId: number): boolean => {
    return allowedRanges.some(range => pokemonId >= range.start && pokemonId <= range.end)
  }

  while (pureTypePokemons.length < 4 && usedTypeIds.size < totalTypes) {
    const randomTypeId = getRandomInt(totalTypes)
    if (usedTypeIds.has(randomTypeId)) continue

    try {
      const typeResponse = await fetch(`${POKEAPI_BASE_URL}/type/${randomTypeId}`)
      const typeData = await typeResponse.json()
      usedTypeIds.add(randomTypeId)

      const filteredPokemon = typeData.pokemon.filter((pokemonEntry: any) => {
        const urlParts = pokemonEntry.pokemon.url.split('/')
        const pokemonId = parseInt(urlParts[urlParts.length - 2])
        return isPokemonInAllowedGenerations(pokemonId)
      })

      if (filteredPokemon.length === 0) continue

      const shuffledPokemon = filteredPokemon.sort(() => 0.5 - Math.random())

      for (const pokemonEntry of shuffledPokemon) {
        const urlParts = pokemonEntry.pokemon.url.split('/')
        const pokemonId = parseInt(urlParts[urlParts.length - 2])
        
        try {
          const pokemonResponse = await fetch(`${POKEAPI_BASE_URL}/pokemon/${pokemonId}`)
          const pokemonData = await pokemonResponse.json()

          if (pokemonData.types.length === 1) {
            pureTypePokemons.push({
              name: pokemonData.name,
              internalUrl: `/pokemon/${pokemonData.name}`,
              type: 'pokemon',
              spriteUrl: pokemonData.sprites.other?.['official-artwork']?.front_default || pokemonData.sprites.front_default,
              id: pokemonData.id
            })
            break
          }
        } catch (pokemonError) {
          console.error(`Error fetching pokemon ${pokemonId}:`, pokemonError)
          continue
        }
      }
    } catch (error) {
      console.error(`Error processing type ID ${randomTypeId}:`, error)
    }
  }
  
  return pureTypePokemons
}

export const getRandomStoryElements = async (count: number = 3, selectedGenerations: number[] = []): Promise<PokeStoryElement[]> => {
  const elements: PokeStoryElement[] = []
  const totalLocations = 836
  
  const generationsToUse = selectedGenerations.length > 0 ? selectedGenerations : GENERATIONS.map(g => g.id)
  
  const allowedRanges = generationsToUse.map(genId =>
    GENERATIONS.find(g => g.id === genId)?.pokemonRange
  ).filter(Boolean) as { start: number, end: number }[]

  const getRandomPokemonFromGenerations = (): number => {
    const randomRange = allowedRanges[Math.floor(Math.random() * allowedRanges.length)]
    return getRandomIntInRange(randomRange.start, randomRange.end)
  }

  for (let i = 0; i < count; i++) {
    try {
      if (Math.random() > 0.5 && allowedRanges.length > 0) {
        const randomId = getRandomPokemonFromGenerations()
        const res = await fetch(`${POKEAPI_BASE_URL}/pokemon/${randomId}`)
        if (!res.ok) throw new Error(`Pokemon ${randomId} not found`)
        
        const data = await res.json()
        elements.push({
          name: data.name,
          internalUrl: `/pokemon/${data.name}`,
          type: 'pokemon',
          spriteUrl: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
          id: data.id
        })
      } else {
        const randomId = getRandomInt(totalLocations)
        const res = await fetch(`${POKEAPI_BASE_URL}/location/${randomId}`)
        if (!res.ok) throw new Error(`Location ${randomId} not found`)
        
        const data = await res.json()
        elements.push({
          name: data.name,
          internalUrl: `/locations/${data.name}`,
          type: 'location',
          id: -randomId
        })
      }
    } catch (error) {
      console.error("Error fetching a random story element:", error)
      i--
    }
  }
  
  return elements
}
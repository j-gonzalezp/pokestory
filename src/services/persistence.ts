export type PlayerPokemonTrait = string;


export interface PlayerPokemon {
  id: string; 
  speciesName: string; 
  nickname: string; 
  level: number;
  xp: number;
  xpToNextLevel: number;
  stats: {
    maxHP: number;
    currentHP: number;
    maxMorale: number; 
    currentMorale: number;
  };
  traits: PlayerPokemonTrait[]; 
  spriteUrl: string; 
}


export interface PlayerData {
  adoptedPokemon: PlayerPokemon[];
  
}




const LOCAL_STORAGE_KEY = 'pokeStoryPlayerData';
const MAX_ADOPTED_POKEMON = 3;





export const getPlayerData = (): PlayerData => {
  if (typeof window === 'undefined') {
    return { adoptedPokemon: [] }; 
  }

  try {
    const data = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as PlayerData;
    }
  } catch (error) {
    console.error("Error al leer los datos del jugador desde localStorage:", error);
    
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  
  return { adoptedPokemon: [] };
};


export const savePlayerData = (data: PlayerData): void => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error al guardar los datos del jugador en localStorage:", error);
  }
};


export const adoptNewPokemon = (newPokemon: PlayerPokemon): boolean => {
  const playerData = getPlayerData();

  if (playerData.adoptedPokemon.length >= MAX_ADOPTED_POKEMON) {
    console.warn(`No se puede adoptar a ${newPokemon.nickname}. El equipo está lleno.`);
    return false;
  }

  playerData.adoptedPokemon.push(newPokemon);
  savePlayerData(playerData);
  return true;
};


export const updatePokemon = (updatedPokemon: PlayerPokemon): boolean => {
  const playerData = getPlayerData();
  const pokemonIndex = playerData.adoptedPokemon.findIndex(p => p.id === updatedPokemon.id);

  if (pokemonIndex === -1) {
    console.error(`No se encontró al Pokémon con id ${updatedPokemon.id} para actualizar.`);
    return false;
  }

  playerData.adoptedPokemon[pokemonIndex] = updatedPokemon;
  savePlayerData(playerData);
  return true;
};


export const releasePokemon = (pokemonId: string): void => {
  const playerData = getPlayerData();
  playerData.adoptedPokemon = playerData.adoptedPokemon.filter(p => p.id !== pokemonId);
  savePlayerData(playerData);
};
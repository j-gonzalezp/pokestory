"use client"
import PokeGrid from '@/components/pokedex/PokeGrid'
import React from 'react'

const page = () => {
  const handlePokemonSelect = (pokemonName: string) => {
    console.log(`Selected Pokémon: ${pokemonName}`);
    
  };

  return (
    <div>
        <PokeGrid onPokemonSelect={handlePokemonSelect}/>
    </div>
  )
}

export default page
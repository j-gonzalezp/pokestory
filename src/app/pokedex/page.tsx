"use client"
import PokeGrid from '@/components/pokedex/PokeGrid'
import React from 'react'
import { useRouter } from 'next/navigation';
const PokedexPage = () => {
  const router = useRouter();

  const handlePokemonSelect = (pokemonName: string) => {
    router.push(`/pokedex/${pokemonName}`);
  };

  return (
    <div>
        <PokeGrid onPokemonSelect={handlePokemonSelect}/>
    </div>
  )
}

export default PokedexPage
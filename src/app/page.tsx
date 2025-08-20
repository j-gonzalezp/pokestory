"use client";
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import PokeGrid from '@/components/pokedex/PokeGrid';
import { PokedexDetail } from '@/components/pokedex/PokedexDetail';
import StoryMvp from '@/services/StoryMvp';

export default function Home() {
  const [view, setView] = useState<'landing' | 'grid' | 'detail' | 'story'>('landing');
  const [selectedPokemonName, setSelectedPokemonName] = useState<string | null>(null);

  const handleStartPokedex = () => { setView('grid'); };
  const handleStartStory = () => { setView('story'); };
  const handleSelectPokemon = (pokemonName: string) => { setSelectedPokemonName(pokemonName); setView('detail'); };
  const handleBackToGrid = () => { setView('grid'); setSelectedPokemonName(null); };
  const handleBackToLanding = () => { setView('landing'); };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {view === 'landing' && (
        <div className="flex flex-col items-center justify-center h-screen w-full">

          <Button onClick={handleStartPokedex} className="mt-8">START POKEDEX</Button>
          <Button onClick={handleStartStory} className="mt-4">START POKESTORY</Button>
        </div>
      )}

      {(view === 'grid' || view === 'detail') && (
        <div className="relative w-full max-w-7xl mx-auto">
          <PokeGrid onPokemonSelect={handleSelectPokemon} />
          {view === 'detail' && selectedPokemonName && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <button
                  onClick={handleBackToGrid}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                >
                  &times;
                </button>
                <PokedexDetail pokemonName={selectedPokemonName} onBack={handleBackToGrid} />
              </div>
            </div>
          )}
          <Button onClick={handleBackToLanding} className="mt-8">BACK TO LANDING</Button>
        </div>
      )}

      {view === 'story' && (
        <div className="w-full max-w-4xl mx-auto">
          <StoryMvp />
          <Button onClick={handleBackToLanding} className="mt-8">BACK TO LANDING</Button>
        </div>
      )}
    </main>
  );
}

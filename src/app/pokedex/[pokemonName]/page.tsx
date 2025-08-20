"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { PokedexDetail } from '@/components/pokedex/PokedexDetail';

interface PokedexDetailPageProps {
  params: {
    pokemonName: string;
  };
}

const PokedexDetailPage: React.FC<PokedexDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const { pokemonName } = params;

  const handleBack = () => {
    router.back();
  };

  return (
    <PokedexDetail pokemonName={pokemonName} onBack={handleBack} />
  );
};

export default PokedexDetailPage;
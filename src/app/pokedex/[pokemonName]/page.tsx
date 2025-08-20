"use client"

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { PokedexDetail } from '@/components/pokedex/PokedexDetail';


interface PageProps {
  params: Promise<{ pokemonName: string }>;
}

const PokedexDetailPage: React.FC<PageProps> = ({ params }) => {
  const router = useRouter();

  const { pokemonName } = use(params);

  const handleBack = () => {
    router.back();
  };

  return (
    <PokedexDetail pokemonName={pokemonName} onBack={handleBack} />
  );
};

export default PokedexDetailPage;
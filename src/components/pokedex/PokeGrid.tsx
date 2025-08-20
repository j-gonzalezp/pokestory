"use client"
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import ParallaxBackground from '../ui/ParallaxBackground';
import { ApiListItem } from '../../types';
import { getPokemonList } from '../../services/pokeapi';
import { extraerIdDeUrl } from '../../lib/utils';
import { useFavorites } from '../../hooks/useFavorites';

import { SearchBar } from './SearchBar';
import { FavoritesToggle } from './FavoritesToggle';
import { PokeCard } from './PokeCard';
import { Pagination } from './Pagination';
import { Skeleton } from '../ui/Skeleton';
import { ScrollArea } from '../ui/scroll-area';

interface PokeGridProps {
  onPokemonSelect: (pokemonName: string) => void;
}

const PokeGrid: React.FC<PokeGridProps> = ({ onPokemonSelect }) => {
  const [allPokemon, setAllPokemon] = useState<ApiListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const data = await getPokemonList(1, 151); 
        setAllPokemon(data);
      } catch (error) {
        console.error('Error fetching Pokémon list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemon();
  }, []); 

  const itemsPerPage = 30;

  const handleSearchChange = (newTerm: string) => {
    setIsTransitioning(true);
    setSearchTerm(newTerm);
    setCurrentPage(1);
   
    setTimeout(() => setIsTransitioning(false), 200);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleToggleFavoritesFilter = () => {
    setIsTransitioning(true);
    setShowFavoritesOnly(!showFavoritesOnly);
    setCurrentPage(1);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  const filteredPokemonBySearch = allPokemon.filter((pokemon: ApiListItem) =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPokemon = showFavoritesOnly
    ? filteredPokemonBySearch.filter((pokemon: ApiListItem) =>
        favorites.includes(extraerIdDeUrl(pokemon.url))
      )
    : filteredPokemonBySearch;

  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
  const currentPokemon = filteredPokemon.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

 
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 20,
        mass: 0.5,
      },
    },
  } as const;

 
  const skeletonRows = useMemo(() => {
    const rows = [];
    const itemsPerRow = 3;
    const skeletonCount = Math.ceil(itemsPerPage / itemsPerRow) * itemsPerRow;

    for (let i = 0; i < skeletonCount; i += itemsPerRow) {
      rows.push(
        <div
          key={`row-${i}`}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 w-full"
        >
          {Array.from({ length: itemsPerRow }).map((_, j) => (
            <Skeleton
              key={`skeleton-${i + j}`}
              className="h-64 w-full"
              wave={true}
              delay={i + j}
            />
          ))}
        </div>
      );
    }
    return rows;
  }, [itemsPerPage]);

  return (
    <ScrollArea className="h-full relative">
      <ParallaxBackground />
      <motion.div 
        className="container mx-auto p-4 relative z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <FavoritesToggle isFiltered={showFavoritesOnly} onToggle={handleToggleFavoritesFilter} />
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              className="space-y-4"
              exit={{
                opacity: 0,
                scale: 0.95,
                transition: { duration: 0.2, ease: "easeInOut" }
              }}
            >
              {skeletonRows}
            </motion.div>
          ) : (
            <motion.div
              key={`${searchTerm}-${showFavoritesOnly}-${currentPage}`}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ 
                opacity: 0, 
                scale: 0.95,
                transition: { duration: 0.15 }
              }}
        
              style={{ pointerEvents: isTransitioning ? 'none' : 'auto' }}
            >
              {currentPokemon.map((pokemon: ApiListItem, index: number) => {
                const isFavorite = favorites.includes(extraerIdDeUrl(pokemon.url));
                return (
                  <motion.div
                    key={pokemon.name}
                    variants={itemVariants}
                 
                    transition={{
                      delay: index * 0.02, 
                    }}
                  >
                    <PokeCard
                      pokemonName={pokemon.name}
                      onSelect={onPokemonSelect}
                      isFavorite={isFavorite}
                      onToggleFavorite={() => toggleFavorite(extraerIdDeUrl(pokemon.url))}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              type: 'spring' as const,
              stiffness: 100,
              damping: 15
            }}
            className="mt-8"
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </motion.div>
        )}
      </motion.div>
    </ScrollArea>
  );
};

export default PokeGrid;
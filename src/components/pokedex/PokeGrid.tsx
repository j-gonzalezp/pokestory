import React, { useState, useEffect } from 'react';
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
    setSearchTerm(newTerm);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleToggleFavoritesFilter = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    setCurrentPage(1);
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

  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
          <FavoritesToggle isFiltered={showFavoritesOnly} onToggle={handleToggleFavoritesFilter} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
              {currentPokemon.map((pokemon: ApiListItem) => (
                <PokeCard
                  key={pokemon.name}
                  pokemonName={pokemon.name}
                  onSelect={onPokemonSelect}
                  isFavorite={favorites.includes(extraerIdDeUrl(pokemon.url))}
                  onToggleFavorite={() => toggleFavorite(extraerIdDeUrl(pokemon.url))}
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </ScrollArea>
  );
};

export default PokeGrid;
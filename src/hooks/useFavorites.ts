import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('pokemon-favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const toggleFavorite = (pokemonId: number) => {
    let newFavorites: number[];
    if (favorites.includes(pokemonId)) {
      newFavorites = favorites.filter((id) => id !== pokemonId);
    } else {
      newFavorites = [...favorites, pokemonId];
    }
    setFavorites(newFavorites);
    localStorage.setItem('pokemon-favorites', JSON.stringify(newFavorites));
  };

  return { favorites, toggleFavorite };
}

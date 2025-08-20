import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PokeGrid from '../components/pokedex/PokeGrid';
import { getPokemonList, getPokemonDetails } from '../services/pokeapi';
import { useFavorites } from '../hooks/useFavorites';
import { ApiListItem } from '../types';

jest.mock('../services/pokeapi');
jest.mock('../hooks/useFavorites');

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const mockGetPokemonList = getPokemonList as jest.Mock;
const mockGetPokemonDetails = getPokemonDetails as jest.Mock;
const mockUseFavorites = useFavorites as jest.Mock;

const mockPokemonList: ApiListItem[] = Array.from({ length: 35 }, (_, i) => ({
  name: `pokemon${i + 1}`,
  url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
}));

describe('PokeGrid', () => {
  let mockToggleFavorite: jest.Mock;

  beforeEach(() => {
    mockToggleFavorite = jest.fn();

    mockUseFavorites.mockReturnValue({
      favorites: [],
      toggleFavorite: mockToggleFavorite,
    });

    mockGetPokemonDetails.mockImplementation((name: string) =>
      Promise.resolve({
        id: parseInt(name.replace('pokemon', '')),
        name,
        spriteUrl: `/${name}.png`,
        types: ['grass'],
        description: 'A mock Pokemon.',
        weight: 10,
        height: 1,
      })
    );

    mockGetPokemonList.mockClear();
    mockGetPokemonDetails.mockClear();
    mockToggleFavorite.mockClear();
  });

  test('muestra el estado de carga (skeletons) inicialmente', () => {
    mockGetPokemonList.mockReturnValue(new Promise(() => {}));

    render(<PokeGrid onPokemonSelect={() => {}} />);

    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBe(30);
  });

  test('muestra la lista de Pokémon después de la carga', async () => {
    mockGetPokemonList.mockResolvedValue(mockPokemonList.slice(0, 30));

    render(<PokeGrid onPokemonSelect={() => {}} />);

    expect(await screen.findByText(/pokemon1/i)).toBeInTheDocument();
    expect(screen.getByText(/pokemon30/i)).toBeInTheDocument();
  });

  test('filtra los Pokémon al usar la barra de búsqueda', async () => {
    mockGetPokemonList.mockResolvedValue(mockPokemonList);

    render(<PokeGrid onPokemonSelect={() => {}} />);

    await screen.findByText(/pokemon1/i);

    const searchInput = screen.getByPlaceholderText(/buscar pokémon/i);
    fireEvent.change(searchInput, { target: { value: 'pokemon1' } });

    expect(screen.getByText(/pokemon1/i)).toBeVisible();
    expect(screen.queryByText(/pokemon2/i)).not.toBeInTheDocument();
    expect(screen.getByText(/pokemon10/i)).toBeVisible();
  });

  test('la paginación funciona correctamente', async () => {
    mockGetPokemonList.mockResolvedValue(mockPokemonList);

    render(<PokeGrid onPokemonSelect={() => {}} />);

    await screen.findByText(/pokemon1/i);

    expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
    expect(screen.queryByText(/pokemon31/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(await screen.findByText(/pokemon31/i)).toBeInTheDocument();
    expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();
    expect(screen.queryByText(/pokemon1/i)).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled();
  });

  test('filtra por favoritos cuando se activa el interruptor', async () => {
    mockUseFavorites.mockReturnValue({
      favorites: [2, 5],
      toggleFavorite: mockToggleFavorite,
    });
    mockGetPokemonList.mockResolvedValue(mockPokemonList);

    render(<PokeGrid onPokemonSelect={() => {}} />);

    await screen.findByText(/pokemon1/i);

    const favoritesButton = screen.getByRole('button', { name: /show favorites/i });
    fireEvent.click(favoritesButton);

    expect(screen.getByText(/pokemon2/i)).toBeVisible();
    expect(screen.getByText(/pokemon5/i)).toBeVisible();
    expect(screen.queryByText(/pokemon1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/pokemon3/i)).not.toBeInTheDocument();

    const showAllButton = screen.getByRole('button', { name: /show all/i });
    fireEvent.click(showAllButton);
    expect(await screen.findByText(/pokemon1/i)).toBeVisible();
    expect(screen.getByText(/pokemon3/i)).toBeVisible();
  });

  test('llama a onPokemonSelect con el nombre correcto al hacer clic en una tarjeta', async () => {
    const handleSelect = jest.fn();
    mockGetPokemonList.mockResolvedValue(mockPokemonList.slice(0, 1));

    render(<PokeGrid onPokemonSelect={handleSelect} />);

    const card = await screen.findByText(/pokemon1/i);
    fireEvent.click(card.parentElement!);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith('pokemon1');
  });

  test('llama a toggleFavorite con el ID correcto al hacer clic en la estrella', async () => {
    mockGetPokemonList.mockResolvedValue(mockPokemonList.slice(0, 1));

    render(<PokeGrid onPokemonSelect={() => {}} />);

    await screen.findByText(/pokemon1/i);

    const favoriteButton = screen.getByRole('button', { name: '' });
    fireEvent.click(favoriteButton);

    expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
    expect(mockToggleFavorite).toHaveBeenCalledWith(1);
  });
});
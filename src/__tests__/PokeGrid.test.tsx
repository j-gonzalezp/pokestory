import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PokeGrid from '../components/pokedex/PokeGrid';
import { getPokemonList } from '../services/pokeapi';


jest.mock('../services/pokeapi', () => ({
  getPokemonList: jest.fn(),
}));

const mockGetPokemonList = getPokemonList as jest.Mock;

describe('PokeGrid', () => {

  test('renders a loading state initially', () => {
    mockGetPokemonList.mockReturnValueOnce(new Promise(() => {})); 
    render(<PokeGrid onPokemonSelect={() => {}} />);
    expect(screen.getByRole('status')).toBeInTheDocument(); 


  test('displays a list of Pokémon after loading', async () => {
    const mockPokemonList = [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
    ];
    mockGetPokemonList.mockResolvedValueOnce(mockPokemonList);

    render(<PokeGrid onPokemonSelect={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('charmander')).toBeInTheDocument();
    });
  });

 
  test('filters Pokémon correctly by search input', async () => {
    const mockPokemonList = [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
    ];
    mockGetPokemonList.mockResolvedValueOnce(mockPokemonList);

    render(<PokeGrid onPokemonSelect={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('charmander')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search pokemon/i); 
    fireEvent.change(searchInput, { target: { value: 'bulba' } });

    expect(screen.getByText('bulbasaur')).toBeVisible();
    expect(screen.queryByText('charmander')).not.toBeInTheDocument();
  });


  test('calls onPokemonSelect when a Pokémon card is clicked', async () => {
    const handleSelect = jest.fn();
    const mockPokemonList = [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    ];
    mockGetPokemonList.mockResolvedValueOnce(mockPokemonList);

    render(<PokeGrid onPokemonSelect={handleSelect} />);

    const bulbasaurCard = await screen.findByText('bulbasaur');
    fireEvent.click(bulbasaurCard);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith('bulbasaur');
  });
});}
,})
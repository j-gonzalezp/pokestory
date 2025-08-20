"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getPokemonDetails, PokemonDetails } from '@/services/pokeapi'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline'
import { capitalize } from '@/lib/utils'

interface PokeCardProps {
  pokemonName: string
  onSelect: (pokemonName: string) => void
  isFavorite: boolean
  onToggleFavorite: (pokemonId: number) => void
}

export function PokeCard({ pokemonName, onSelect, isFavorite, onToggleFavorite }: PokeCardProps) {
  const [details, setDetails] = useState<PokemonDetails | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true)
      try {
        const data = await getPokemonDetails(pokemonName)
        setDetails(data)
      } catch (error) {
        console.error(`Error fetching details for ${pokemonName}:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [pokemonName])

  if (isLoading) {
    return (
      <Skeleton className="w-[200px] h-[250px] rounded-lg" />
    )
  }

  if (!details) {
    return (
      <Card className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-md w-[200px] h-[250px]">
        <p>Error loading Pokémon details.</p>
      </Card>
    )
  }

  return (
    <Card
      className="flex flex-col items-center p-4 border rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200 relative w-[200px] h-[250px]"
      onClick={() => onSelect(pokemonName)}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          onToggleFavorite(details.id)
        }}
      >
        {isFavorite ? (
          <StarIcon className="h-6 w-6 text-yellow-400" />
        ) : (
          <StarIconOutline className="h-6 w-6 text-gray-400" />
        )}
      </Button>
      <div className="relative w-32 h-32 mb-2">
        <Image
          src={details.spriteUrl}
          alt={details.name}
          layout="fill"
          objectFit="contain"
        />
      </div>
      <h3 className="text-lg font-semibold text-center">
        {capitalize(details.name)}
      </h3>
      <p className="text-sm text-gray-500">#{String(details.id).padStart(3, '0')}</p>
    </Card>
  )
}
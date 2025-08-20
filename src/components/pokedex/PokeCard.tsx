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
      <div className="flex flex-col sm:flex-row items-center p-2 border rounded-lg shadow-md w-full sm:w-auto">
        <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full sm:rounded-lg mr-4" />
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
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
      className="flex flex-col items-center p-2 border rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200 relative w-full sm:w-auto overflow-hidden"
      onClick={() => onSelect(pokemonName)}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 sm:static sm:ml-auto"
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
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
        <Image
          src={details.spriteUrl}
          alt={details.name}
          layout="fill"
          objectFit="contain"
        />
      </div>
      <div className="flex-1 text-center min-w-0">
        <h3 className="text-lg font-semibold truncate">
          {capitalize(details.name)}
        </h3>
        <p className="text-sm text-gray-500">#{String(details.id).padStart(3, '0')}</p>
      </div>
    </Card>
  )
}
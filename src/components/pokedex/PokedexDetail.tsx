"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getPokemonDetails, PokemonDetails } from '@/services/pokeapi'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { capitalize } from '@/lib/utils'

interface PokedexDetailProps {
  pokemonName: string
  onBack: () => void
}

export function PokedexDetail({ pokemonName, onBack }: PokedexDetailProps) {
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
      <div className="flex flex-col items-center p-4">
        <Skeleton className="w-24 h-8 mb-4" /> 
        <Skeleton className="w-64 h-10 mb-6" />
        <Skeleton className="w-48 h-48 mb-6 rounded-full" /> 
        <div className="flex gap-2 mb-4">
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
        <Skeleton className="w-full h-24 mb-4" /> 
        <Skeleton className="w-32 h-6" />
      </div>
    )
  }

  if (!details) {
    return (
      <div className="flex flex-col items-center p-4">
        <Button onClick={onBack} className="mb-4">Volver</Button>
        <p>Error loading Pokémon details.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-4">
      <Button onClick={onBack} className="mb-4">Volver</Button>
      <h2 className="text-3xl font-bold mb-4">
        #{String(details.id).padStart(3, '0')} - {capitalize(details.name)}
      </h2>
      <div className="relative w-64 h-64 mb-6">
        <Image
          src={details.spriteUrl}
          alt={details.name}
          layout="fill"
          objectFit="contain"
        />
      </div>
      <div className="flex gap-2 mb-4">
        {details.types.map((type) => (
          <Badge key={type}>{capitalize(type)}</Badge>
        ))}
      </div>
      <p className="text-center mb-4 max-w-prose">{details.description}</p>
      <div className="flex gap-8 text-lg">
        <p><strong>WT:</strong> {details.weight / 10} kg</p>
        <p><strong>HT:</strong> {details.height / 10} m</p>
      </div>
    </div>
  )
}
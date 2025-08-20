"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { getPokemonDetails, PokemonDetails } from '@/services/pokeapi'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { capitalize } from '@/lib/utils'
import { AnimatedNumber } from '@/components/animations/AnimatedNumber'
import TypewriterText from '@/components/animations/TypewriterText'

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
        <div className="relative w-48 h-48 mb-6 rounded-full overflow-hidden">
          <Skeleton className="w-full h-full rounded-full" />
          <div className="animate-shimmer absolute inset-0"></div>
        </div>
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
        <Button onClick={onBack} className="mb-4">Back</Button>
        <p>Error loading Pokémon details.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-4">
      <motion.div
        className="self-start"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0 }}
      >
        <Button onClick={onBack} className="mb-4">Back</Button>
      </motion.div>
      <motion.h2
        className="text-3xl font-bold mb-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        #<AnimatedNumber value={details.id} format={(v) => String(Math.floor(v)).padStart(3, '0')} /> - {capitalize(details.name)}
      </motion.h2>
      <motion.div
        className="relative w-64 h-64 mb-6"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.1, 1],
          opacity: 1,
          transition: { delay: 0.2, duration: 0.5, ease: "easeOut" }
        }}
        whileInView={{
          scale: [1, 1.02, 1],
          transition: {
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }
        }}
      >
        <Image
          src={details.spriteUrl}
          alt={details.name}
          layout="fill"
          objectFit="contain"
        />
      </motion.div>
      <div className="flex gap-2 mb-4">
        {details.types.map((type, index) => (
          <motion.div
            key={type}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 120 }}
          >
            <Badge>{capitalize(type)}</Badge>
          </motion.div>
        ))}
      </div>
      <div className="text-center mb-4 max-w-prose">
        <TypewriterText text={details.description} delay={0.5} wordDelay={0.02} />
      </div>
      <motion.div
        className="flex gap-8 text-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p><strong>Weight:</strong> <AnimatedNumber value={details.weight / 10} format={(v) => v.toFixed(1)} /> kg</p>
        <p><strong>Height:</strong> <AnimatedNumber value={details.height / 10} format={(v) => v.toFixed(1)} /> m</p>
      </motion.div>
    </div>
  )
}
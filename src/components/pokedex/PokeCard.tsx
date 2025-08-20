"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { getPokemonDetails, PokemonDetails } from '@/services/pokeapi'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline'
import { capitalize, getPokemonTypeGlow } from '@/lib/utils'

interface PokeCardProps {
  pokemonName: string
  onSelect: (pokemonName: string) => void
  isFavorite: boolean
  onToggleFavorite: (pokemonId: number) => void
}

export function PokeCard({ pokemonName, onSelect, isFavorite, onToggleFavorite }: PokeCardProps) {

  const [details, setDetails] = useState<PokemonDetails | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [ripple, setRipple] = useState<{x: number, y: number, id: number} | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const rippleId = useRef(0)

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
      <motion.div 
        className="h-64 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="flex flex-col items-center p-4 border rounded-lg shadow-md w-full h-full bg-white">
          <div className="relative overflow-hidden mb-4 mt-2">
            <Skeleton className="w-24 h-24 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
          </div>
          <div className="flex-1 flex flex-col justify-center items-center w-full relative overflow-hidden">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-3" />
            <div className="flex gap-1">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
          </div>
        </Card>
      </motion.div>
    )
  }

  if (!details) {
    return (
      <Card className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-md h-64 w-full">
        <p className="text-sm text-gray-500">Error loading Pokémon details.</p>
      </Card>
    )
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setRipple({ x, y, id: rippleId.current++ })
      setTimeout(() => setRipple(null), 600)
    }
    
    onSelect(pokemonName)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onToggleFavorite(details.id)
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 1000)
  }

  return (
    <motion.div
      ref={cardRef}
      className="relative w-full sm:w-auto overflow-hidden"
    
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: 0
      }}
      whileHover={{
        scale: 1.02,
        y: -2,
        transition: { duration: 0.15 }
      }}
 
      style={{ 
        pointerEvents: 'auto',
        cursor: 'pointer'
      }}
      transition={{
        duration: 0.2,
        ease: "easeOut"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <Card className="flex flex-col items-center p-4 border rounded-lg shadow-md cursor-pointer relative overflow-hidden h-64 hover:shadow-lg transition-shadow duration-200">
       
        <AnimatePresence>
          {ripple && (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full bg-gray-200 opacity-40 pointer-events-none"
              style={{ 
                left: ripple.x, 
                top: ripple.y,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ width: 0, height: 0 }}
              animate={{
                width: 500,
                height: 500,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

      
        <motion.div
          className="absolute top-3 right-3 z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
          animate={{
            scale: isClicked ? 1.3 : 1,
            rotate: isClicked ? 360 : 0,
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white/90"
            onClick={handleFavoriteClick}
          >
            {isFavorite ? (
              <StarIcon className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarIconOutline className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </motion.div>

       
        <motion.div
          className="relative w-24 h-24 flex-shrink-0 mt-2 mb-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{ 
            scale: 1.1, 
            rotate: 2,
            transition: { duration: 0.2 }
          }}
        >
          <Image
            src={details.spriteUrl}
            alt={details.name}
            layout="fill"
            objectFit="contain"
            priority
          />
        </motion.div>

        
        <div className="flex-1 flex flex-col justify-between text-center min-w-0 w-full px-2">
         
          <div className="h-16 flex flex-col justify-center">
            <motion.h3
              className="text-base font-semibold truncate w-full leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{ textShadow: details.types && details.types.length > 0 ? getPokemonTypeGlow(details.types[0]) : 'none' }}
              title={capitalize(details.name)} 
            >
              {capitalize(details.name)}
            </motion.h3>
            <p className="text-sm text-gray-500 mt-1">#{String(details.id).padStart(3, '0')}</p>
          </div>
          
         
          <motion.div 
            className="h-8 flex justify-center items-center gap-1 mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {details.types && details.types.length > 0 && (
              <>
                {details.types.slice(0, 2).map((type, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 whitespace-nowrap"
                  >
                    {capitalize(type)}
                  </span>
                ))}
              </>
            )}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
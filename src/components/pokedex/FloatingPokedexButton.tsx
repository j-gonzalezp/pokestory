"use client"
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { BookOpen } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import PokeGrid from './PokeGrid'
import { PokedexDetail } from './PokedexDetail'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

const translations = {
    es: {
        startPokedex: "Start Pokédex"
    },
    en: {
        startPokedex: "Start Pokédex"
    }
}

const FloatingPokedexButton: React.FC = () => {
    const [isPokedexModalOpen, setIsPokedexModalOpen] = useState(false)
    const [selectedPokemonForDetail, setSelectedPokemonForDetail] = useState<string | null>(null)
    const [language] = useState<'es' | 'en'>('en')
    const [bottomPosition, setBottomPosition] = useState(24)

    const t = translations[language]

    useEffect(() => {
        const updatePosition = () => {
            const footer = document.querySelector('footer')
            if (!footer) return

            const footerRect = footer.getBoundingClientRect()
            const windowHeight = window.innerHeight

            if (footerRect.top < windowHeight) {
                const overlap = windowHeight - footerRect.top

                const newBottom = Math.max(24, overlap + 16)
                setBottomPosition(newBottom)
            } else {
                setBottomPosition(24)
            }
        }

        updatePosition()
        window.addEventListener('scroll', updatePosition)
        window.addEventListener('resize', updatePosition)

        return () => {
            window.removeEventListener('scroll', updatePosition)
            window.removeEventListener('resize', updatePosition)
        }
    }, [])

    const handlePokemonSelectInModal = (pokemonName: string) => {
        setSelectedPokemonForDetail(pokemonName)
    }

    const handleBackToGridInModal = () => {
        setSelectedPokemonForDetail(null)
    }

    const handleOpenPokedex = () => {
        setIsPokedexModalOpen(true)
    }

    return (
        <>
            <Button
                onClick={handleOpenPokedex}
                className="fixed right-6 h-14 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 z-10"
                style={{ bottom: `${bottomPosition}px` }}
                size="lg"
            >
                <BookOpen className="h-5 w-5 mr-2" />
                <span className="font-medium">{t.startPokedex}</span>
            </Button>

            <Dialog open={isPokedexModalOpen} onOpenChange={setIsPokedexModalOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogTitle asChild>
                        <VisuallyHidden>
                            {selectedPokemonForDetail ? 'Pokémon Details' : 'Pokedex'}
                        </VisuallyHidden>
                    </DialogTitle>
                    <div className="flex-1 overflow-hidden">
                        {selectedPokemonForDetail ? (
                            <PokedexDetail
                                pokemonName={selectedPokemonForDetail}
                                onBack={handleBackToGridInModal}
                            />
                        ) : (
                            <div className="h-full">
                                <PokeGrid onPokemonSelect={handlePokemonSelectInModal} />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default FloatingPokedexButton
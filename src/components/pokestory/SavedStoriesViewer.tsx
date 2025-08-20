"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, BookOpen, Trash2, Eye, LucideProps } from 'lucide-react';
import { PokeStoryElement } from '../../services/pokeapi';
import { APP_ICON_MAP } from '@/lib/app-icons';
import { motion, AnimatePresence } from 'framer-motion';

interface MapNode {
    step: number;
    iconName: string;
    storyText: string;
    completed: boolean;
}

interface SavedStory {
    id: string;
    title: string;
    protagonist: PokeStoryElement;
    storyHistory: string[];
    mapNodes: MapNode[];
    allElements: PokeStoryElement[];
    timestamp: number;
}

const getIconByName = (iconName: string): React.ComponentType<LucideProps> => {
    return APP_ICON_MAP[iconName as keyof typeof APP_ICON_MAP] || APP_ICON_MAP.MapPin;
};

const translations = {
    es: {
        savedStoriesTitle: "Mis Historias Guardadas",
        noStories: "Aún no has guardado ninguna aventura. ¡Juega una partida para guardar tu primera historia!",
        viewStory: "Ver Historia",
        deleteStory: "Eliminar",
        deleteConfirmation: "¿Estás seguro de que quieres eliminar esta historia? Esta acción no se puede deshacer.",
        storyDetails: "Detalles de la Historia",
        backToList: "Volver a la Lista",
        journeyMap: "Mapa del Viaje",
        allPokemonInStory: "Pokémon en esta Historia",
        completeStory: "Historia Completa",
        step: "Paso",
        storyOf: "La historia de",
        protagonist: "Protagonista",
        savedOn: "Guardado el",
    },
    en: {
        savedStoriesTitle: "My Saved Stories",
        noStories: "You haven't saved any adventures yet. Play a game to save your first story!",
        viewStory: "View Story",
        deleteStory: "Delete",
        deleteConfirmation: "Are you sure you want to delete this story? This action cannot be undone.",
        storyDetails: "Story Details",
        backToList: "Back to List",
        journeyMap: "Journey Map",
        allPokemonInStory: "Pokémon in this Story",
        completeStory: "Complete Story",
        step: "Step",
        storyOf: "The story of",
        protagonist: "Protagonist",
        savedOn: "Saved on",
    }
};

interface StoryDetailDisplayProps {
    story: SavedStory;
    onBack: () => void;
    language: 'es' | 'en';
}

const StoryDetailDisplay: React.FC<StoryDetailDisplayProps> = ({ story, onBack, language }) => {
    const t = translations[language];

    const pokemonContainerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const pokemonItemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Button onClick={onBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToList}
            </Button>

            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-slate-800 mb-2">{story.title}</CardTitle>
                    <CardDescription className="text-xl">
                        {t.protagonist}: {story.protagonist.name}
                    </CardDescription>
                    {story.protagonist.spriteUrl && (
                        <Image src={story.protagonist.spriteUrl} alt={story.protagonist.name} width={96} height={96} className="mx-auto mt-4" />
                    )}
                </CardHeader>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-lg text-center">{t.journeyMap}</CardTitle></CardHeader>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 py-4">
                        {story.mapNodes.map((node, index) => (
                            <React.Fragment key={node.step}>
                                {index > 0 && <div className="flex-1 h-1 rounded-full bg-green-500" />}
                                <div className="relative w-12 h-12 rounded-full flex items-center justify-center border-2 bg-green-500 border-green-500">
                                    {React.createElement(getIconByName(node.iconName), { className: "h-6 w-6 text-white" })}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-lg text-center">{t.allPokemonInStory}</CardTitle></CardHeader>
                <CardContent>
                    <motion.div className="flex gap-6 justify-center overflow-x-auto pb-4" variants={pokemonContainerVariants} initial="hidden" animate="show">
                        {story.allElements.map((element, index) => (
                            element.spriteUrl && (
                                <motion.div key={`${element.name}-${index}`} variants={pokemonItemVariants} className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full p-2 shadow-inner"><Image src={element.spriteUrl!} alt={element.name} width={96} height={96} className="w-full h-full object-contain" /></div>
                                    <span className="mt-2 text-sm font-medium capitalize">{element.name}</span>
                                </motion.div>
                            )))}
                    </motion.div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-lg text-center">{t.completeStory}</CardTitle></CardHeader>
                <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                    {story.storyHistory.map((text, index) => (
                        <div key={index} className="border-l-4 border-indigo-200 pl-4">
                            <Badge variant="outline" className="mb-2">{t.step} {index + 1}</Badge>
                            <p className="text-sm leading-relaxed">{text}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

const SavedStoriesViewer: React.FC = () => {
    const [stories, setStories] = useState<SavedStory[]>([]);
    const [selectedStory, setSelectedStory] = useState<SavedStory | null>(null);
    const [language] = useState<'es' | 'en'>('en');
    const t = translations[language];

    useEffect(() => {
        try {
            const savedStoriesRaw = localStorage.getItem('pokeStories');
            if (savedStoriesRaw) {
                const loadedStories = JSON.parse(savedStoriesRaw) as SavedStory[];
                loadedStories.sort((a, b) => b.timestamp - a.timestamp);
                setStories(loadedStories);
            }
        } catch (error) {
            console.error("Error loading stories from local storage:", error);
        }
    }, []);

    const handleDeleteStory = (storyId: string) => {
        if (window.confirm(t.deleteConfirmation)) {
            const updatedStories = stories.filter(s => s.id !== storyId);
            localStorage.setItem('pokeStories', JSON.stringify(updatedStories));
            setStories(updatedStories);
        }
    };

    const renderContent = () => {
        if (selectedStory) {
            return (
                <StoryDetailDisplay
                    story={selectedStory}
                    onBack={() => setSelectedStory(null)}
                    language={language}
                />
            );
        }

        return (
            <div className="max-w-4xl mx-auto">
                <Card className="mb-8">
                    <CardHeader className="text-center">
                        <CardTitle className="text-4xl font-bold text-slate-800 flex items-center justify-center gap-3">
                            <BookOpen className="h-8 w-8" /> {t.savedStoriesTitle}
                        </CardTitle>
                    </CardHeader>
                </Card>

                {stories.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center text-slate-600">
                            <p>{t.noStories}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stories.map(story => (
                            <Card key={story.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        {story.protagonist.spriteUrl && (
                                            <Image src={story.protagonist.spriteUrl} alt={story.protagonist.name} width={64} height={64} className="bg-slate-100 rounded-full p-1" />
                                        )}
                                        <div>
                                            <CardTitle className="text-lg leading-tight">{story.title}</CardTitle>
                                            <CardDescription className="capitalize">{t.storyOf} {story.protagonist.name}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-xs text-slate-500">
                                        {t.savedOn} {new Date(story.timestamp).toLocaleDateString()}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex flex-col sm:flex-row gap-2">
                                    <Button onClick={() => setSelectedStory(story)} className="w-full sm:w-auto flex-1">
                                        <Eye className="h-4 w-4 mr-2" />
                                        {t.viewStory}
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteStory(story.id)}
                                        variant="destructive"
                                        className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {t.deleteStory}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen p-6 font-sans">
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedStory ? selectedStory.id : 'list'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default SavedStoriesViewer;

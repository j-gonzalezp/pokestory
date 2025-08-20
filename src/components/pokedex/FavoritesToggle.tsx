"use client"

import { Button } from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RotateCcw } from "lucide-react";

interface FavoritesToggleProps {
  isFiltered: boolean;
  onToggle: () => void;
}

export function FavoritesToggle({ isFiltered, onToggle }: FavoritesToggleProps) {
  return (
    <motion.div
      animate={{
        backgroundColor: isFiltered ? "rgb(59, 130, 246)" : "rgb(255, 255, 255)",
        borderColor: isFiltered ? "rgb(59, 130, 246)" : "rgb(203, 213, 225)",
      }}
      transition={{ duration: 0, ease: "easeInOut" }} 
      className="inline-block"
    >
      <Button
        onClick={onToggle}
        variant={isFiltered ? "default" : "outline"}
        className="flex items-center gap-2 transition-all duration-0" 
      >
        <motion.div
          animate={{ rotate: isFiltered ? 180 : 0 }}
          transition={{ duration: 0, ease: "easeInOut" }} 
        >
          {isFiltered ? <RotateCcw size={16} /> : <Heart size={16} />}
        </motion.div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={isFiltered ? "show-all" : "show-favorites"}
              initial={{ y: isFiltered ? 20 : -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: isFiltered ? -20 : 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="inline-block"
            >
              {isFiltered ? "Show All" : "Show Favorites"}
            </motion.span>
          </AnimatePresence>
        </div>
      </Button>
    </motion.div>
  );
}
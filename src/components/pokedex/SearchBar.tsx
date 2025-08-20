"use client"

import { useState } from "react";
import { Input } from "../ui/input";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (newTerm: string) => void;
}

export function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 150);
  };

  const clearSearch = () => {
    onSearchChange("");
  };

  return (
    <div className="relative">
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "0 0 0 0px rgba(59, 130, 246, 0)",
        }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <Input
          type="text"
          placeholder="Buscar Pokémon..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`transition-all duration-200 pr-10 ${
            isTyping ? "border-blue-400" : ""
          }`}
        />
        {searchTerm && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
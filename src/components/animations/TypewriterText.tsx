"use client"

import React from 'react'
import { motion} from 'framer-motion'

interface TypewriterTextProps {
  text: string
  delay?: number
  wordDelay?: number
  onComplete?: () => void 
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 0,
  wordDelay = 0.05,
  onComplete, 
}) => {
  const words = text.split(' ')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: wordDelay,
        delayChildren: delay,
      },
    },
  }

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onAnimationComplete={() => {
       
        if (onComplete) {
          onComplete()
        }
      }}
      className="whitespace-pre-wrap"
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={wordVariants} className="inline-block mr-1">
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}

export default TypewriterText
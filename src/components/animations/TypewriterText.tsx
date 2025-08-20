"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface TypewriterTextProps {
  text: string
  delay?: number
  speed?: number
  onComplete?: () => void
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 0,
  speed = 30,
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTypingFinishedRef = useRef(false)

  useEffect(() => {
    setDisplayedText('')
    setCurrentIndex(0)
    isTypingFinishedRef.current = false
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length && !isTypingFinishedRef.current) {
      typingTimeoutRef.current = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed + (currentIndex === 0 ? delay : 0))

      return () => {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    } else if (currentIndex === text.length && !isTypingFinishedRef.current) {
      isTypingFinishedRef.current = true
      if (onComplete) {
        onComplete()
      }
    }
  }, [currentIndex, text, speed, delay, onComplete])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === ' ') && !isTypingFinishedRef.current) {
        event.preventDefault()
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        setDisplayedText(text)
        setCurrentIndex(text.length)
        isTypingFinishedRef.current = true
        if (onComplete) {
          onComplete()
        }
      }
    }

    if (!isTypingFinishedRef.current) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [text, onComplete])

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
      className="whitespace-pre-wrap"
    >
      {displayedText}
    </motion.span>
  )
}

export default TypewriterText

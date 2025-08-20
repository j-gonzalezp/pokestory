"use client"

import { useEffect, useState } from 'react'
import { animate } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  duration?: number
  format?: (value: number) => string
}

export function AnimatedNumber({ value, duration = 0.8, format = (v) => v.toFixed(0) }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      onUpdate: (latest) => {
        setDisplayValue(latest)
      },
    })
    return () => controls.stop()
  }, [value, duration])

  return <>{format(displayValue)}</>
}
import { easeInOut, easeOut } from 'motion/react'

type SpringTransition = {
  type: 'spring'
  stiffness: number
  damping: number
  mass: number
  delay: number
}

type LinkVariant = {
  opacity?: number
  y?: number
  scale?: number
  transition?: Record<string, unknown>
}

type LinkVariants = {
  initial: LinkVariant
  animate: (customDelay: number) => LinkVariant
  hover: LinkVariant
  active: LinkVariant
}

export const springTransition: SpringTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 55,
  mass: 1,
  delay: 0,
}

export const linkVariants: LinkVariants = {
  initial: { opacity: 0, y: 15 },
  animate: (customDelay: number): LinkVariant => ({
    opacity: 1,
    y: 0,
    transition: { ...springTransition, delay: customDelay },
  }),
  hover: {
    scale: 1.015,
    transition: { easeInOut, delay: 0.01, duration: 0.25 },
  },
  active: { scale: 0.99, transition: { easeOut, delay: 0.01, duration: 0.25 } },
}

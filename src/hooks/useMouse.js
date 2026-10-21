import { useEffect } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

// Posisi pointer ternormalisasi (-0.5 … 0.5), dihaluskan dengan spring.
export default function useMouse() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 50, damping: 20 })
  const sy = useSpring(y, { stiffness: 50, damping: 20 })

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX / window.innerWidth - 0.5)
      y.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [x, y])

  return { sx, sy }
}

import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Ganti tema terang/gelap"
      onClick={onToggle}
      className="relative flex h-12 w-24 items-center rounded-full bg-white/80 p-1 shadow-soft ring-1 ring-soft backdrop-blur transition-colors duration-500 dark:bg-white/10 dark:ring-white/10"
    >
      <motion.span
        className="absolute left-1 top-1 h-10 w-11 rounded-full bg-white shadow-md dark:bg-brand"
        animate={{ x: dark ? 44 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      />
      <span className="relative z-10 grid h-10 w-11 place-items-center">
        <Sun className={`h-5 w-5 transition-colors duration-500 ${dark ? 'text-slate-400' : 'text-brand'}`} />
      </span>
      <span className="relative z-10 grid h-10 w-11 place-items-center">
        <Moon className={`h-5 w-5 transition-colors duration-500 ${dark ? 'text-white' : 'text-slate-400'}`} />
      </span>
    </button>
  )
}

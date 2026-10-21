import { motion } from 'framer-motion'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { Link } from 'react-router-dom'

export default function Navbar({ dark, onToggle }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative z-20 mx-auto flex max-w-[1536px] items-center justify-between px-5 py-5 sm:px-8 lg:px-16 lg:py-7 2xl:px-20"
    >
      <Link to="/" aria-label="Beranda WarTech" className="flex items-center gap-3 sm:gap-4">
        <Logo size={52} />
        <span className="text-[26px] font-extrabold tracking-tight text-navy transition-colors duration-500 sm:text-[30px] dark:text-white">
          WarTech
        </span>
        <div className="ml-2 hidden items-center gap-3 border-l border-slate-300/80 pl-5 text-[15px] font-medium text-slate-600 md:flex dark:border-white/20 dark:text-slate-300">
          <span>Mudah</span>
          <i className="h-1 w-1 rounded-full bg-navy dark:bg-white" />
          <span>Cepat</span>
          <i className="h-1 w-1 rounded-full bg-navy dark:bg-white" />
          <span>Praktis</span>
        </div>
      </Link>
      <ThemeToggle dark={dark} onToggle={onToggle} />
    </motion.header>
  )
}

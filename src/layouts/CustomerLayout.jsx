import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Menu, Search, ShoppingCart, X } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import BackgroundDecorations from '../components/BackgroundDecorations'
import useMouse from '../hooks/useMouse'
import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { btn, btnGhost } from '../lib/ui'

const links = [['/', 'Beranda'], ['/menu', 'Menu'], ['/#cara', 'Cara Pemesanan'], ['/history', 'Lacak Pesanan']]
const navLink =
  'relative py-1 text-[15px] font-medium after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-brand after:transition-transform hover:text-brand hover:after:scale-x-100'

export default function CustomerLayout() {
  const { pathname } = useLocation()
  const { sx, sy } = useMouse()
  const { dark, toggle } = useTheme()
  const { count } = useCart()
  const { session, isStaff, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])

  const auth = session ? (
    <>
      {isStaff && <Link to="/admin" className={btnGhost}>Admin</Link>}
      <button type="button" onClick={signOut} className={btnGhost}>Keluar</button>
    </>
  ) : (
    <Link to="/login" className={btn}>Masuk</Link>
  )

  return (
    <div className="relative min-h-screen overflow-x-clip bg-mist transition-colors duration-500 dark:bg-[#0A1230]">
      <BackgroundDecorations sx={sx} sy={sy} />
      <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/80 shadow-soft backdrop-blur-xl dark:bg-[#0A1230]/80' : ''}`}>
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link to="/" aria-label="Beranda WarTech" className="flex items-center gap-3">
            <Logo size={40} />
            <span className="text-2xl font-extrabold tracking-tight text-navy dark:text-white">WarTech</span>
          </Link>
          <nav className="hidden items-center gap-7 text-slate-600 dark:text-slate-300 lg:flex">
            {links.map(([to, label]) => (
              <Link key={label} to={to} className={`${navLink} ${pathname === to ? 'text-brand' : ''}`}>{label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/menu#cari" aria-label="Cari menu" className="grid h-11 w-11 place-items-center rounded-full bg-white/80 text-navy ring-1 ring-soft transition hover:text-brand dark:bg-white/10 dark:text-white dark:ring-white/10">
              <Search className="h-5 w-5" />
            </Link>
            <Link to="/cart" aria-label={`Keranjang, ${count} item`} className="relative grid h-11 w-11 place-items-center rounded-full bg-white/80 text-navy ring-1 ring-soft transition hover:text-brand dark:bg-white/10 dark:text-white dark:ring-white/10">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <motion.span key={count} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }} className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                  {count}
                </motion.span>
              )}
            </Link>
            <div className="hidden items-center gap-3 lg:flex">
              <ThemeToggle dark={dark} onToggle={toggle} />
              {auth}
            </div>
            <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="grid h-11 w-11 place-items-center rounded-full bg-white/80 text-navy ring-1 ring-soft dark:bg-white/10 dark:text-white dark:ring-white/10 lg:hidden">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mx-4 mb-3 rounded-3xl bg-white p-4 shadow-soft dark:bg-[#0F1A45] lg:hidden">
              <nav className="flex flex-col gap-1">
                {links.map(([to, label]) => (
                  <Link key={label} to={to} className="rounded-xl px-3 py-3 font-semibold text-navy hover:bg-soft dark:text-white dark:hover:bg-white/10">{label}</Link>
                ))}
              </nav>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-soft pt-3 dark:border-white/10">
                <ThemeToggle dark={dark} onToggle={toggle} />
                <div className="flex gap-2">{auth}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <motion.main key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="relative z-10 mx-auto min-h-[70vh] max-w-[1280px] px-5 py-6 sm:px-8">
        <Outlet />
      </motion.main>

      <footer className="relative z-10 mt-12 border-t border-soft/80 py-8 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-5 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2"><Logo size={28} /><span className="font-bold text-navy dark:text-white">WarTech</span></div>
          <div className="flex gap-5">
            <Link to="/menu" className="hover:text-brand">Menu</Link>
            <Link to="/history" className="hover:text-brand">Lacak Pesanan</Link>
            <Link to="/#cara" className="hover:text-brand">Cara Pemesanan</Link>
          </div>
          <span>© {new Date().getFullYear()} WarTech</span>
        </div>
      </footer>
    </div>
  )
}

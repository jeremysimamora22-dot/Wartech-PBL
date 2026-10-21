import BackgroundDecorations from '../components/BackgroundDecorations'
import HeroSection from '../components/HeroSection'
import LoginCard from '../components/LoginCard'
import Navbar from '../components/Navbar'
import useMouse from '../hooks/useMouse'
import { useTheme } from '../context/ThemeContext'

// Halaman login WarTech yang sama seperti sebelumnya; kini memakai autentikasi sungguhan.
export default function LoginPage({ mode = 'login' }) {
  const { dark, toggle } = useTheme()
  const { sx, sy } = useMouse()
  return (
    <div className="relative min-h-screen overflow-x-clip bg-mist transition-colors duration-500 dark:bg-[#0A1230]">
      <BackgroundDecorations sx={sx} sy={sy} />
      <Navbar dark={dark} onToggle={toggle} />
      <main className="relative z-10 mx-auto grid max-w-[1536px] gap-8 px-5 pb-12 sm:px-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-10 lg:px-16 2xl:px-20">
        <HeroSection sx={sx} sy={sy} />
        <LoginCard mode={mode} />
      </main>
    </div>
  )
}

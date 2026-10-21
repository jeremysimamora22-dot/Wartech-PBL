import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Zap } from 'lucide-react'
import FeatureCards from './FeatureCards'
import ProductShowcase from './ProductShowcase'
import TrustTicker from './TrustTicker'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.2, delayChildren: 0.25 } } }
const rise = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
}

export default function HeroSection({ sx, sy }) {
  // Cahaya lembut yang mengikuti kursor di area kiri
  const gx = useMotionValue(-400)
  const gy = useMotionValue(-400)
  const glowX = useSpring(gx, { stiffness: 70, damping: 18 })
  const glowY = useSpring(gy, { stiffness: 70, damping: 18 })
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    gx.set(e.clientX - r.left - 160)
    gy.set(e.clientY - r.top - 160)
  }

  return (
    <section onPointerMove={onMove} className="relative min-w-0 pt-2 lg:pt-6">
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none absolute left-0 top-0 hidden h-80 w-80 rounded-full bg-bright/20 blur-3xl lg:block"
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="relative">
        <motion.span
          variants={rise}
          className="inline-flex items-center gap-2 rounded-full bg-soft/80 px-4 py-2 text-sm font-semibold text-brand dark:bg-brand/20 dark:text-blue-200"
        >
          <Zap className="h-4 w-4 fill-current" /> Solusi Kelola Warung &amp; Kantin
        </motion.span>

        <motion.h1
          variants={rise}
          className="mt-6 text-[34px] font-extrabold leading-[1.1] tracking-tight text-navy transition-colors duration-500 sm:text-[44px] lg:text-[36px] xl:text-[46px] 2xl:text-[56px] dark:text-white"
        >
          Kelola Warung / Kantin
          <span className="relative mt-1 block w-fit bg-gradient-to-r from-brand to-bright bg-clip-text text-transparent">
            Jadi Lebih Mudah
            <svg className="absolute -bottom-3 left-0 h-3 w-[70%]" viewBox="0 0 330 12" fill="none" preserveAspectRatio="none" aria-hidden="true">
              <motion.path
                d="M3 9C80 2 200 2 327 7"
                stroke="#2563EB"
                strokeWidth="4"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.2, duration: 1, ease: 'easeOut' }}
              />
            </svg>
          </span>
        </motion.h1>

        <motion.p variants={rise} className="mt-8 max-w-[480px] text-[17px] leading-relaxed text-slate-600 dark:text-slate-300">
          WarTech hadir untuk membantu kamu mengelola transaksi, stok, dan laporan penjualan dengan cara yang lebih cepat, praktis, dan modern.
        </motion.p>

        <FeatureCards />
      </motion.div>

      <ProductShowcase sx={sx} sy={sy} />
      <TrustTicker />
    </section>
  )
}

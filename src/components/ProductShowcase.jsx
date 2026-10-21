import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Boxes, FileText, LayoutDashboard, Package, QrCode, Receipt, Settings } from 'lucide-react'
import FloatingNotifications from './FloatingNotifications'

const menu = [
  [LayoutDashboard, 'Dashboard'],
  [Receipt, 'Transaksi'],
  [Package, 'Produk'],
  [Boxes, 'Stok'],
  [FileText, 'Laporan'],
  [Settings, 'Pengaturan'],
]
const bars = [28, 42, 58, 36, 74, 50, 92]
const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
const spark = 'M2 34L18 26L32 30L48 16L62 22L78 8L98 4'

function useCount(to, delay = 1) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const c = animate(0, to, { duration: 1.8, delay, ease: 'easeOut', onUpdate: (n) => setV(Math.round(n)) })
    return () => c.stop()
  }, [to, delay])
  return v
}

function Stat({ label, value, note }) {
  return (
    <div className="rounded-lg bg-white p-2.5 shadow-sm">
      <p className="text-[8px] text-slate-500">{label}</p>
      <p className="text-[13px] font-bold">{value}</p>
      <p className="text-[8px] text-emerald-500">↑ {note} dari kemarin</p>
    </div>
  )
}

// Mockup dashboard (ukuran desain tetap 584×340, di-scale oleh <Laptop />).
function Dashboard() {
  const total = useCount(750000)
  const trx = useCount(23)
  return (
    <div className="flex h-[340px] w-[584px] overflow-hidden rounded-xl bg-white text-navy">
      <aside className="w-[130px] shrink-0 bg-navy p-3 text-white">
        <p className="mb-4 text-[11px] font-bold">WarTech</p>
        {menu.map(([Icon, t], i) => (
          <div
            key={t}
            className={`mb-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] ${i === 0 ? 'bg-brand font-semibold' : 'text-blue-100/80'}`}
          >
            <Icon className="h-3 w-3" /> {t}
          </div>
        ))}
      </aside>
      <div className="min-w-0 flex-1 bg-mist p-4">
        <p className="text-[15px] font-bold">Selamat Datang!</p>
        <p className="text-[9px] text-slate-500">Semangat mengelola usaha hari ini!</p>
        <div className="mt-3 grid grid-cols-[1.2fr_1fr_1.3fr] gap-2">
          <Stat label="Total Penjualan" value={`Rp ${total.toLocaleString('id-ID')}`} note="12%" />
          <Stat label="Transaksi" value={trx} note="8%" />
          <div className="rounded-lg bg-white p-2 shadow-sm">
            <svg viewBox="0 0 100 40" className="h-12 w-full" fill="none">
              <motion.path
                d={`${spark}V40H2Z`}
                fill="#DBEAFE"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 2.2, duration: 1 }}
              />
              <motion.path
                d={spark}
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.2, duration: 1.6, ease: 'easeOut' }}
              />
            </svg>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-white p-3 shadow-sm">
          <p className="text-[10px] font-bold">Penjualan Hari Ini</p>
          <div className="mt-2 grid h-[108px] grid-cols-7 items-end border-b border-slate-100">
            {bars.map((h, i) => (
              <div key={i} className="flex h-full items-end justify-center">
                <motion.i
                  className="w-4 rounded-t bg-gradient-to-t from-brand to-bright"
                  style={{ height: `${h}%`, originY: 1 }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 text-center text-[7px] text-slate-400">
            {hours.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Laptop() {
  const ref = useRef(null)
  const [s, setS] = useState(1)
  useEffect(() => {
    if (!ref.current) return undefined
    const ro = new ResizeObserver(([e]) => setS(Math.min(1, e.contentRect.width / 600)))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={ref} className="w-full">
      <div style={{ height: 368 * s }}>
        <div style={{ width: 600, transform: `scale(${s})`, transformOrigin: 'top left' }}>
          <div className="rounded-[20px] bg-[#0B1537] p-2 shadow-[0_30px_60px_-20px_rgba(16,38,99,0.55)]">
            <Dashboard />
          </div>
          <div className="h-3 rounded-b-2xl bg-gradient-to-b from-slate-200 to-slate-400 dark:from-slate-500 dark:to-slate-700" />
        </div>
      </div>
    </div>
  )
}

const Plant = () => (
  <svg viewBox="0 0 90 130" className="absolute bottom-3 left-[-2%] z-10 hidden w-[13%] max-w-[80px] sm:block" aria-hidden="true">
    <path d="M44 96C22 88 6 62 10 28c24 8 40 36 34 68z" fill="#34D399" />
    <path d="M46 96C46 62 56 34 82 18c6 30-8 58-36 78z" fill="#10B981" />
    <path d="M45 98C40 70 40 46 50 8c14 26 8 62-5 90z" fill="#6EE7B7" />
    <rect x="22" y="96" width="46" height="32" rx="7" fill="#fff" stroke="#DBEAFE" />
  </svg>
)

export default function ProductShowcase({ sx, sy }) {
  const tx = useMotionValue(0)
  const ty = useMotionValue(0)
  const rotY = useSpring(useTransform(tx, [-0.5, 0.5], [-7, 7]), { stiffness: 120, damping: 18 })
  const rotX = useSpring(useTransform(ty, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 18 })

  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    tx.set((e.clientX - r.left) / r.width - 0.5)
    ty.set((e.clientY - r.top) / r.height - 0.5)
  }
  const leave = () => {
    tx.set(0)
    ty.set(0)
  }

  return (
    <div className="relative mx-auto mt-4 w-full max-w-[680px] pb-4 pt-32 sm:pt-28">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute left-0 top-12 hidden -rotate-[8deg] font-script text-2xl leading-[1.05] text-brand sm:block lg:hidden xl:block"
      >
        Kelola bisnis
        <br />
        lebih efisien
        <br />
        bersama WarTech!
      </motion.p>

      <motion.div
        className="absolute inset-x-[8%] bottom-8 top-1/3 -z-10 rounded-full bg-bright/30 blur-3xl"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.9, ease: 'easeOut' }}
        className="mx-auto w-[88%]"
      >
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          <motion.div
            onPointerMove={move}
            onPointerLeave={leave}
            style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1100 }}
            whileHover={{ scale: 1.02 }}
          >
            <Laptop />
          </motion.div>
        </motion.div>
      </motion.div>

      <Plant />

      <motion.div
        animate={{ rotate: [-8, -5, -8] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 left-[4%] z-10 w-[18%] min-w-[64px] max-w-[110px] rounded-2xl bg-gradient-to-b from-bright to-brand p-2 text-center shadow-glow"
      >
        <div className="grid aspect-square place-items-center rounded-lg bg-white">
          <QrCode className="h-3/4 w-3/4 text-navy" />
        </div>
        <p className="mt-1 text-[8px] leading-tight text-white sm:text-[9px]">Scan untuk pembayaran</p>
      </motion.div>

      <div className="absolute bottom-4 right-[1%] z-10 w-[15%] min-w-[56px] max-w-[96px]">
        <div className="mx-auto w-3/4 space-y-1 rounded-t bg-white p-1.5 shadow">
          <i className="block h-[2px] bg-slate-300" />
          <i className="block h-[2px] w-2/3 bg-slate-300" />
          <i className="block h-[2px] bg-slate-300" />
        </div>
        <div className="h-14 rounded-xl bg-gradient-to-b from-[#1E2F6B] to-navy shadow-lg" />
      </div>

      <FloatingNotifications sx={sx} sy={sy} />
    </div>
  )
}

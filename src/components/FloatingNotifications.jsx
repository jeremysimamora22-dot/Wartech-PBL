import { motion, useTransform } from 'framer-motion'
import { BarChart3, Check, ShieldCheck } from 'lucide-react'

const glass =
  'bg-white/90 shadow-[0_18px_44px_-14px_rgba(37,99,235,0.45)] ring-1 ring-soft backdrop-blur dark:bg-[#14235A]/90 dark:ring-white/10'

// Lapisan luar = parallax mouse, lapisan dalam = floating tak berujung.
function Float({ sx, sy, depth = 24, dur = 5, dx = 0, dy = 14, rot = 2, className = '', children }) {
  const x = useTransform(sx, [-0.5, 0.5], [-depth, depth])
  const y = useTransform(sy, [-0.5, 0.5], [-depth, depth])
  return (
    <motion.div style={{ x, y }} className={`absolute ${className}`}>
      <motion.div
        animate={{ y: [0, -dy, 0], x: [0, dx, 0], rotate: [-rot, rot, -rot] }}
        transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export default function FloatingNotifications({ sx, sy }) {
  return (
    <div className="pointer-events-none absolute right-0 top-0 z-20 h-[190px] w-full max-w-[330px]">
      <Float sx={sx} sy={sy} depth={26} dur={5.5} className="right-0 top-0">
        <div className={`flex w-[205px] items-center gap-3 rounded-2xl p-4 ${glass}`}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <Check className="h-6 w-6" strokeWidth={3} />
          </span>
          <div className="text-[11px] leading-tight text-navy dark:text-white">
            <p className="font-semibold">Transaksi Berhasil</p>
            <p className="text-[15px] font-extrabold">Rp 750.000</p>
            <i className="mt-1.5 block h-1 w-16 rounded-full bg-soft dark:bg-white/20" />
          </div>
        </div>
      </Float>

      {/* Pesawat kertas mengikuti jalur titik-titik */}
      <svg viewBox="0 0 330 120" fill="none" className="absolute left-0 top-[56px] hidden h-[120px] w-full sm:block">
        <path id="wt-flight" d="M60 96C130 100 200 80 262 24" stroke="#3B82F6" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
        <g>
          <path d="M16 0L-12 -10L-6 0L-12 10Z" fill="#2563EB" />
          <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
            <mpath href="#wt-flight" />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.88;1" dur="6s" repeatCount="indefinite" />
        </g>
      </svg>

      <Float sx={sx} sy={sy} depth={38} dur={6.5} dx={10} dy={10} rot={3} className="left-2 top-[108px]">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-bright to-brand text-white shadow-glow">
          <BarChart3 className="h-7 w-7" />
        </div>
      </Float>

      <Float sx={sx} sy={sy} depth={18} dur={7} dy={8} className="left-0 top-1 hidden sm:block">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${glass}`}>
          <ShieldCheck className="h-5 w-5 text-brand" />
        </div>
      </Float>
    </div>
  )
}

import { motion } from 'framer-motion'
import { BarChart3, Box, ShieldCheck, Zap } from 'lucide-react'

const items = [
  { icon: Zap, a: 'Transaksi', b: 'Super Cepat' },
  { icon: Box, a: 'Manajemen', b: 'Stok' },
  { icon: BarChart3, a: 'Laporan', b: 'Lengkap' },
  { icon: ShieldCheck, a: 'Aman &', b: 'Terpercaya' },
]

const listV = { hidden: {}, show: { transition: { staggerChildren: 0.15, delayChildren: 0.9 } } }
const itemV = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  hover: {},
}
const boxV = { hover: { y: -5, boxShadow: '0 18px 30px -10px rgba(37,99,235,0.4)' } }
const iconV = { hover: { scale: 1.18 } }

export default function FeatureCards() {
  return (
    <motion.ul
      variants={listV}
      initial="hidden"
      animate="show"
      className="mt-9 grid grid-cols-2 gap-x-5 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-7"
    >
      {items.map(({ icon: Icon, a, b }) => (
        <motion.li key={a} variants={itemV} whileHover="hover" className="group flex cursor-default items-center gap-3">
          <motion.span
            variants={boxV}
            style={{ boxShadow: '0 8px 24px -10px rgba(37,99,235,0.35)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="grid h-[50px] w-[50px] place-items-center rounded-2xl bg-white transition-colors duration-300 group-hover:bg-soft dark:bg-white/10 dark:group-hover:bg-white/20"
          >
            <motion.span variants={iconV} className="grid place-items-center">
              <Icon className="h-6 w-6 text-brand" />
            </motion.span>
          </motion.span>
          <span className="text-sm leading-tight text-slate-600 dark:text-slate-300">
            {a}
            <br />
            {b}
          </span>
        </motion.li>
      ))}
    </motion.ul>
  )
}

import { motion } from 'framer-motion'
import { ArrowRight, Megaphone } from 'lucide-react'

const Msg = () => (
  <span className="flex shrink-0 items-center gap-2 pr-10 text-[13px] text-navy dark:text-blue-100">
    <span className="whitespace-nowrap">
      Lebih dari <b className="font-bold text-brand dark:text-bright">10.000</b> warung &amp; kantin sudah mempercayai WarTech
    </span>
    <ArrowRight className="h-4 w-4 text-brand" />
  </span>
)

export default function TrustTicker() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8, duration: 0.7 }}
      className="group relative mx-auto mt-4 flex w-full max-w-[500px] items-center gap-3 rounded-full bg-white/80 py-3 pl-5 pr-4 shadow-soft ring-1 ring-soft backdrop-blur transition-colors duration-500 dark:bg-white/10 dark:ring-white/10"
    >
      <Megaphone className="h-5 w-5 shrink-0 text-brand" />
      <div className="flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          <Msg />
          <Msg />
        </div>
      </div>
    </motion.div>
  )
}

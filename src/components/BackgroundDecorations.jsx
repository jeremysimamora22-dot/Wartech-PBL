import { motion, useTransform } from 'framer-motion'

const dots = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 100,
  size: 4 + (i % 3) * 2,
  delay: (i % 7) * 1.1,
}))

const paths = ['M420 40H300L270 70V150', 'M420 110H350L330 130V210H280', 'M420 200H380L360 220V280']

function Circuit({ className }) {
  return (
    <svg
      viewBox="0 0 420 300"
      fill="none"
      stroke="#3B82F6"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`absolute hidden h-[300px] w-[420px] opacity-50 md:block dark:opacity-40 ${className}`}
    >
      {paths.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 0.6 + i * 0.4, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse', repeatDelay: 2 }}
        />
      ))}
      <g fill="#3B82F6" stroke="none">
        <circle cx="270" cy="150" r="3.5" />
        <circle cx="280" cy="210" r="3.5" />
        <circle cx="360" cy="280" r="3.5" />
      </g>
    </svg>
  )
}

export default function BackgroundDecorations({ sx, sy }) {
  const bx = useTransform(sx, [-0.5, 0.5], [-14, 14])
  const by = useTransform(sy, [-0.5, 0.5], [-10, 10])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-mist to-soft/60 transition-opacity duration-500 dark:opacity-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#060B20] via-[#0A1230] to-[#0F1F55] opacity-0 transition-opacity duration-500 dark:opacity-100" />

      <motion.div style={{ x: bx, y: by }} className="absolute inset-0">
        <div className="absolute -right-48 -top-64 h-[640px] w-[920px] animate-drift rounded-[50%] bg-gradient-to-br from-soft via-bright/30 to-transparent blur-2xl dark:from-brand/30 dark:via-brand/10" />
        <div className="absolute -bottom-80 -left-64 h-[660px] w-[920px] rounded-[50%] bg-gradient-to-tr from-brand/80 via-bright/40 to-transparent blur-xl dark:from-brand/60" />
        <div className="absolute -bottom-72 -right-52 h-[560px] w-[780px] animate-drift rounded-[50%] bg-gradient-to-tl from-bright/50 via-soft to-transparent blur-xl [animation-delay:-9s] dark:from-brand/40 dark:via-brand/10" />
        <div className="absolute left-[8%] top-[28%] h-72 w-72 rounded-full bg-soft/80 blur-3xl dark:bg-brand/20" />
      </motion.div>

      <Circuit className="right-0 top-0" />
      <Circuit className="bottom-0 left-0 rotate-180" />

      {dots.map((d, i) => (
        <span
          key={i}
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, animationDelay: `${d.delay}s` }}
          className={`absolute animate-spark rounded-full bg-bright/60 ${i % 2 ? 'hidden md:block' : ''}`}
        />
      ))}
    </div>
  )
}

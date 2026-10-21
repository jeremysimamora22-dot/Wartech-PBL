export const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }
export const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

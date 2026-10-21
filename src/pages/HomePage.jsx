import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { ClipboardCheck, Coffee, UtensilsCrossed } from 'lucide-react'
import ProductGrid from '../components/customer/ProductGrid'
import { BackendNotice, GridSkeleton, Notice } from '../components/Notice'
import { useCatalog } from '../context/CatalogContext'
import { supabase } from '../lib/supabase'
import { rise, stagger } from '../lib/motion'
import { btn, btnGhost, card, heading, muted } from '../lib/ui'

const steps = [
  ['Pilih menu', 'Cari makanan atau minuman favoritmu di halaman Menu.'],
  ['Masukkan keranjang', 'Atur jumlah dan tambahkan catatan khusus bila perlu.'],
  ['Checkout', 'Isi nama dan pilih metode pembayaran.'],
  ['Pantau & ambil', 'Lihat status pesanan, lalu ambil saat statusnya Siap Diambil.'],
]
const floats = [[UtensilsCrossed, 'Makanan', 'left-2 top-4'], [Coffee, 'Minuman', 'right-0 top-24'], [ClipboardCheck, 'Lacak pesanan', 'left-10 bottom-2']]

export default function HomePage() {
  const { categories, products, loading, error, reload } = useCatalog()
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 120)
  }, [hash])
  const popular = products.filter((p) => p.is_popular).slice(0, 4)

  return (
    <div>
      <section className="grid items-center gap-10 py-8 lg:grid-cols-2 lg:py-14">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.span variants={rise} className="inline-flex rounded-full bg-soft/80 px-4 py-2 text-sm font-semibold text-brand dark:bg-brand/20 dark:text-blue-200">
            Pesan kantin tanpa antre
          </motion.span>
          <motion.h1 variants={rise} className={`mt-5 text-4xl leading-[1.1] sm:text-5xl xl:text-[56px] ${heading}`}>
            Pesan Favoritmu, Lebih Mudah{' '}
            <span className="bg-gradient-to-r from-brand to-bright bg-clip-text text-transparent">Bersama WarTech</span>
          </motion.h1>
          <motion.p variants={rise} className={`mt-5 max-w-lg text-lg leading-relaxed ${muted}`}>
            Temukan makanan dan minuman favoritmu, pesan dengan praktis, dan nikmati kemudahan pemesanan kantin dalam satu aplikasi.
          </motion.p>
          <motion.div variants={rise} className="mt-7 flex flex-wrap gap-3">
            <Link to="/menu" className={`${btn} px-6 py-3 text-base`}>Lihat Menu</Link>
            <Link to="/history" className={`${btnGhost} px-6 py-3 text-base`}>Lacak Pesanan</Link>
          </motion.div>
        </motion.div>
        <div className="relative mx-auto h-72 w-full max-w-sm" aria-hidden="true">
          {floats.map(([Icon, t, pos], i) => (
            <motion.div key={t} animate={{ y: [0, -10, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }} className={`absolute ${pos} flex items-center gap-3 rounded-2xl bg-white/90 p-4 shadow-soft ring-1 ring-soft backdrop-blur dark:bg-[#14235A]/90 dark:ring-white/10`}>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-bright to-brand text-white"><Icon className="h-5 w-5" /></span>
              <span className="text-sm font-semibold text-navy dark:text-white">{t}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {!supabase && <BackendNotice />}
      {error && <Notice title="Menu belum bisa dimuat" action={<button type="button" onClick={reload} className={btn}>Coba lagi</button>}>{error}</Notice>}

      {categories.length > 0 && (
        <motion.section variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="py-6">
          <h2 className={`mb-4 text-2xl ${heading}`}>Kategori</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <motion.div key={c.id} variants={rise}>
                <Link to={`/menu?cat=${c.id}`} className={`inline-block px-5 py-3 text-sm font-semibold text-navy transition hover:-translate-y-0.5 hover:text-brand dark:text-white ${card}`}>{c.name}</Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {(loading || popular.length > 0) && (
        <section className="py-8">
          <div className="mb-4 flex items-end justify-between">
            <h2 className={`text-2xl ${heading}`}>Pilihan Kantin</h2>
            <Link to="/menu" className="text-sm font-semibold text-brand">Semua menu</Link>
          </div>
          {loading ? <GridSkeleton n={4} /> : <ProductGrid products={popular} />}
        </section>
      )}

      <section id="cara" className="scroll-mt-24 py-10">
        <h2 className={`mb-6 text-2xl ${heading}`}>Cara Pemesanan</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([t, d], i) => (
            <motion.div key={t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className={`p-5 ${card}`}>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-bright to-brand font-bold text-white">{i + 1}</span>
              <h3 className="mt-3 font-bold text-navy dark:text-white">{t}</h3>
              <p className={`mt-1 text-sm ${muted}`}>{d}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

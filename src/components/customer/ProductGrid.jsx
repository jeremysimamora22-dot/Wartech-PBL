import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus, UtensilsCrossed } from 'lucide-react'
import Modal from '../Modal'
import { useCart } from '../../context/CartContext'
import { useCatalog } from '../../context/CatalogContext'
import { useToast } from '../../context/ToastContext'
import { rupiah } from '../../lib/format'
import { btn, card, heading, input, muted } from '../../lib/ui'

export function Thumb({ p, className = '' }) {
  return p?.image_url ? (
    <img src={p.image_url} alt={p.name} loading="lazy" className={`object-cover ${className}`} />
  ) : (
    <div className={`grid place-items-center bg-gradient-to-br from-soft to-white text-brand/40 dark:from-brand/20 dark:to-transparent ${className}`}>
      <UtensilsCrossed className="h-8 w-8" />
    </div>
  )
}

function Card({ p, i, onOpen, onAdd }) {
  const out = p.stock <= 0
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: (i % 4) * 0.07 }}
      whileHover={{ y: -6 }}
      className={`group flex flex-col overflow-hidden ${card}`}
    >
      <button type="button" onClick={onOpen} className="text-left">
        <div className="relative overflow-hidden">
          <Thumb p={p} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105" />
          {p.is_popular && !out && (
            <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white">Pilihan kantin</span>
          )}
          {out && <span className="absolute inset-0 grid place-items-center bg-navy/55 text-sm font-bold text-white">Habis</span>}
        </div>
        <div className="p-4 pb-2">
          <h3 className="font-bold text-navy dark:text-white">{p.name}</h3>
          {p.description && <p className={`mt-1 line-clamp-2 text-sm ${muted}`}>{p.description}</p>}
        </div>
      </button>
      <div className="mt-auto flex items-center justify-between gap-2 p-4 pt-2">
        <span className="font-extrabold text-brand dark:text-bright">{rupiah(p.price)}</span>
        <button type="button" disabled={out} onClick={onAdd} aria-label={`Tambah ${p.name} ke keranjang`} className={`${btn} !px-3 !py-2`}>
          <Plus className="h-4 w-4" /> Tambah
        </button>
      </div>
    </motion.article>
  )
}

function ProductModal({ product, onClose }) {
  const last = useRef(null)
  if (product) last.current = product
  const d = last.current
  const { add, items } = useCart()
  const { categories } = useCatalog()
  const toast = useToast()
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  useEffect(() => {
    setQty(1)
    setNote('')
  }, [product?.id])

  const have = d ? items.find((i) => i.id === d.id)?.qty || 0 : 0
  const room = d ? Math.max(d.stock - have, 0) : 0
  const catName = d ? categories.find((c) => c.id === d.category_id)?.name : ''
  const submit = () => {
    add(d.id, qty, note.trim())
    toast(`${d.name} (${qty}) masuk keranjang`)
    onClose()
  }
  const step = 'grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-navy transition hover:bg-soft disabled:opacity-40 dark:border-white/10 dark:text-white'

  return (
    <Modal open={Boolean(product)} onClose={onClose} title={d?.name}>
      {d && (
        <>
          <div className="-mx-6 -mt-6 mb-4 overflow-hidden rounded-t-[24px]">
            <Thumb p={d} className="aspect-[16/9] w-full" />
          </div>
          <h2 className={`text-2xl ${heading}`}>{d.name}</h2>
          <div className={`mt-1 flex flex-wrap gap-x-4 text-sm ${muted}`}>
            {catName && <span>{catName}</span>}
            <span>{d.stock <= 0 ? 'Stok habis' : d.stock <= 5 ? `Tersisa ${d.stock}` : 'Tersedia'}</span>
          </div>
          {d.description && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{d.description}</p>}
          <p className="mt-3 text-2xl font-extrabold text-brand dark:text-bright">
            {rupiah(d.price)} <span className="text-sm font-medium text-slate-400">/ porsi</span>
          </p>
          <label className="mt-4 block text-sm font-semibold text-navy dark:text-white">
            Catatan khusus (opsional)
            <input value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: tidak pedas, tanpa bawang" className={`${input} mt-1.5 font-normal`} />
          </label>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Kurangi" className={step} disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></button>
              <span className="w-6 text-center font-bold text-navy dark:text-white">{qty}</span>
              <button type="button" aria-label="Tambah" className={step} disabled={qty >= room} onClick={() => setQty((q) => Math.min(room, q + 1))}><Plus className="h-4 w-4" /></button>
            </div>
            <span className="text-lg font-extrabold text-navy dark:text-white">{rupiah(d.price * qty)}</span>
          </div>
          <button type="button" disabled={room < 1} onClick={submit} className={`${btn} mt-5 w-full py-3`}>Tambah ke Keranjang</button>
          {room < 1 && <p className="mt-2 text-center text-xs text-red-500">{d.stock <= 0 ? 'Stok habis.' : 'Jumlah di keranjang sudah mencapai stok.'}</p>}
        </>
      )}
    </Modal>
  )
}

export default function ProductGrid({ products }) {
  const [sel, setSel] = useState(null)
  const { add, items } = useCart()
  const toast = useToast()
  const quick = (p) => {
    const have = items.find((i) => i.id === p.id)?.qty || 0
    if (have + 1 > p.stock) return toast('Stok tidak mencukupi untuk menambah lagi.', 'warn')
    add(p.id, 1)
    return toast(`${p.name} masuk keranjang`)
  }
  return (
    <>
      <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p, i) => (
          <Card key={p.id} p={p} i={i} onOpen={() => setSel(p)} onAdd={() => quick(p)} />
        ))}
      </div>
      <ProductModal product={sel} onClose={() => setSel(null)} />
    </>
  )
}

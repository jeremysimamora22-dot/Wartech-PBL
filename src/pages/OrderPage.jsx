import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BadgeCheck, ChefHat, Clock, Link2, PackageCheck, SearchX, ThumbsUp } from 'lucide-react'
import Chip from '../components/Chip'
import { BackendNotice, Notice } from '../components/Notice'
import { useCart } from '../context/CartContext'
import { useCatalog } from '../context/CatalogContext'
import { useToast } from '../context/ToastContext'
import { STATUS, dateTime, rupiah } from '../lib/format'
import { supabase } from '../lib/supabase'
import { btn, btnGhost, card, heading, muted } from '../lib/ui'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const FINAL = ['completed', 'rejected', 'cancelled']
const STEPS = [['pending', Clock], ['accepted', ThumbsUp], ['preparing', ChefHat], ['ready', PackageCheck], ['completed', BadgeCheck]]

export default function OrderPage() {
  const { token } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const { add } = useCart()
  const { products } = useCatalog()
  const [o, setO] = useState(undefined) // undefined = memuat, null = tidak ditemukan
  const [offline, setOffline] = useState(false)

  // Polling tiap 5 detik sampai pesanan final (token acak = satu-satunya kunci akses).
  useEffect(() => {
    if (!supabase || !UUID.test(token)) {
      setO(null)
      return undefined
    }
    let alive = true
    let timer
    const load = async () => {
      const { data, error } = await supabase.rpc('get_order_by_token', { p_token: token })
      if (!alive) return
      setOffline(Boolean(error))
      if (!error) setO(data)
      if (!error && (!data || FINAL.includes(data.status))) return
      timer = setTimeout(load, 5000)
    }
    load()
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [token])

  if (!supabase) return <BackendNotice />
  if (o === undefined) return <div className="mx-auto h-72 max-w-2xl animate-pulse rounded-3xl bg-soft/70 dark:bg-white/10" />
  if (o === null) return <Notice icon={SearchX} title="Pesanan tidak ditemukan" action={<Link to="/menu" className={btn}>Lihat Menu</Link>}>Tautan pelacakan tidak valid atau pesanan tidak ada.</Notice>

  const idx = STEPS.findIndex(([s]) => s === o.status)
  const closed = o.status === 'rejected' || o.status === 'cancelled'
  const reorder = () => {
    let skipped = 0
    o.items.forEach((it) => {
      const p = products.find((x) => x.id === it.product_id)
      if (p && p.stock > 0) add(p.id, Math.min(it.qty, p.stock), it.note || '')
      else skipped += 1
    })
    toast(skipped ? `${skipped} menu dilewati karena sudah tidak tersedia.` : 'Menu dimasukkan ke keranjang', skipped ? 'warn' : 'ok')
    nav('/cart')
  }
  const copy = () => navigator.clipboard?.writeText(window.location.href).then(() => toast('Tautan pelacakan disalin'))

  return (
    <div className="mx-auto max-w-2xl py-4">
      <div className={`p-6 sm:p-8 ${card}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={`text-sm ${muted}`}>Nomor pesanan</p>
            <h1 className={`text-2xl ${heading}`}>{o.order_no}</h1>
            <p className={`text-xs ${muted}`}>{dateTime(o.created_at)} · a.n. {o.customer_name}</p>
          </div>
          <Chip value={o.status} />
        </div>

        {closed ? (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            <p className="font-bold">Pesanan {STATUS[o.status].toLowerCase()}</p>
            {o.reject_reason && <p className="mt-1">Alasan: {o.reject_reason}</p>}
          </div>
        ) : (
          <ol className="mt-6 grid grid-cols-5 gap-1 text-center">
            {STEPS.map(([s, Icon], i) => {
              const done = i <= idx
              return (
                <li key={s} className="flex flex-col items-center gap-2">
                  <motion.span animate={{ scale: i === idx ? 1.12 : 1 }} className={`grid h-11 w-11 place-items-center rounded-full ${done ? 'bg-gradient-to-br from-bright to-brand text-white shadow-glow' : 'bg-soft text-slate-400 dark:bg-white/10'}`}>
                    <Icon className="h-5 w-5" />
                  </motion.span>
                  <span className={`text-[11px] font-semibold leading-tight ${done ? 'text-navy dark:text-white' : 'text-slate-400'}`}>{STATUS[s]}</span>
                </li>
              )
            })}
          </ol>
        )}
        {o.status === 'ready' && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Pesananmu siap diambil{o.pickup ? ` (${o.pickup})` : ''}.</p>}

        <ul className="mt-6 divide-y divide-soft text-sm dark:divide-white/10">
          {o.items.map((it, i) => (
            <li key={i} className="flex justify-between gap-3 py-2.5">
              <span className="text-navy dark:text-white">{it.qty}× {it.name}{it.note && <span className={`block text-xs ${muted}`}>Catatan: {it.note}</span>}</span>
              <span className="font-semibold text-navy dark:text-white">{rupiah(it.unit_price * it.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-soft pt-4 dark:border-white/10">
          <div className="space-y-1.5 text-sm"><p className={muted}>Pembayaran: {o.payment_method === 'cash' ? 'Tunai di kasir' : 'QRIS'}</p><Chip kind="pay" value={o.payment_status} /></div>
          <p className="text-2xl font-extrabold text-navy dark:text-white">{rupiah(o.total)}</p>
        </div>
        {o.notes && <p className={`mt-3 text-sm ${muted}`}>Catatan: {o.notes}</p>}
        {offline && <p role="status" className="mt-3 text-xs text-amber-600">Koneksi bermasalah. Mencoba menyambung kembali…</p>}
        {!FINAL.includes(o.status) && <p className={`mt-3 text-xs ${muted}`}>Status diperbarui otomatis setiap beberapa detik.</p>}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={copy} className={btnGhost}><Link2 className="h-4 w-4" /> Salin tautan pelacakan</button>
        <button type="button" onClick={reorder} className={btn}>Pesan lagi</button>
        <Link to="/menu" className={btnGhost}>Kembali ke menu</Link>
      </div>
    </div>
  )
}

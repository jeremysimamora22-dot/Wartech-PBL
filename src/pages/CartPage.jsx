import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import { Thumb } from '../components/customer/ProductGrid'
import { BackendNotice, GridSkeleton, Notice } from '../components/Notice'
import { useCart } from '../context/CartContext'
import useCartLines from '../lib/useCartLines'
import { rupiah } from '../lib/format'
import { supabase } from '../lib/supabase'
import { btn, btnGhost, card, heading, muted } from '../lib/ui'

const step = 'grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-navy transition hover:bg-soft disabled:opacity-40 dark:border-white/10 dark:text-white'

export default function CartPage() {
  const { setQty, remove, clear } = useCart()
  const { lines, total, valid, loading } = useCartLines()
  const [ask, setAsk] = useState(false)

  if (!supabase) return <BackendNotice />
  if (loading && lines.length) return <GridSkeleton n={3} />
  if (!lines.length) {
    return <Notice icon={ShoppingCart} title="Keranjangmu masih kosong" action={<Link to="/menu" className={btn}>Lihat Menu</Link>}>Yuk pilih menu favoritmu dulu.</Notice>
  }
  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl ${heading}`}>Keranjang</h1>
        <button type="button" onClick={() => setAsk(true)} className="text-sm font-semibold text-red-500 hover:underline">Kosongkan</button>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-3">
          {lines.map((l) => (
            <li key={l.id} className={`flex gap-4 p-4 ${card}`}>
              <Thumb p={l.product} className="h-20 w-20 shrink-0 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-navy dark:text-white">{l.product?.name || 'Menu tidak tersedia'}</p>
                {l.product && <p className={`text-sm ${muted}`}>{rupiah(l.product.price)}</p>}
                {l.note && <p className={`truncate text-xs ${muted}`}>Catatan: {l.note}</p>}
                {!l.product && <p className="text-xs text-red-500">Menu ini sudah tidak tersedia. Hapus dari keranjang.</p>}
                {l.product && !l.ok && <p className="text-xs text-red-500">{l.product.stock <= 0 ? 'Stok habis.' : `Stok tersisa ${l.product.stock}. Kurangi jumlahnya.`}</p>}
                <div className="mt-2 flex items-center gap-3">
                  <button type="button" aria-label="Kurangi" className={step} disabled={l.qty <= 1} onClick={() => setQty(l.id, l.qty - 1)}><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-5 text-center font-bold text-navy dark:text-white">{l.qty}</span>
                  <button type="button" aria-label="Tambah" className={step} disabled={!l.product || l.qty >= l.product.stock} onClick={() => setQty(l.id, l.qty + 1)}><Plus className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button type="button" aria-label="Hapus" onClick={() => remove(l.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-5 w-5" /></button>
                <span className="font-extrabold text-navy dark:text-white">{rupiah(l.subtotal)}</span>
              </div>
            </li>
          ))}
        </ul>
        <aside className={`h-fit p-6 lg:sticky lg:top-24 ${card}`}>
          <p className={muted}>Total sementara</p>
          <p className="mt-1 text-3xl font-extrabold text-navy dark:text-white">{rupiah(total)}</p>
          <p className={`mt-1 text-xs ${muted}`}>Total akhir dihitung ulang oleh sistem saat pesanan dibuat.</p>
          {valid ? (
            <Link to="/checkout" className={`${btn} mt-5 w-full py-3`}>Lanjut ke Checkout</Link>
          ) : (
            <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10">Perbaiki item bermasalah di keranjang sebelum checkout.</p>
          )}
          <Link to="/menu" className={`${btnGhost} mt-3 w-full`}>Lanjut Belanja</Link>
        </aside>
      </div>
      <Modal open={ask} onClose={() => setAsk(false)} title="Kosongkan keranjang">
        <h2 className={`text-xl ${heading}`}>Kosongkan keranjang?</h2>
        <p className={`mt-2 text-sm ${muted}`}>Semua menu di keranjang akan dihapus.</p>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={() => setAsk(false)} className={btnGhost}>Batal</button>
          <button type="button" onClick={() => { clear(); setAsk(false) }} className={btn}>Ya, kosongkan</button>
        </div>
      </Modal>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Banknote, Loader2, QrCode, ShoppingCart } from 'lucide-react'
import Modal from '../components/Modal'
import { BackendNotice, GridSkeleton, Notice } from '../components/Notice'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useCatalog } from '../context/CatalogContext'
import useCartLines from '../lib/useCartLines'
import { rupiah } from '../lib/format'
import { supabase } from '../lib/supabase'
import { btn, btnGhost, card, heading, input, muted } from '../lib/ui'

const lbl = 'block text-sm font-semibold text-navy dark:text-white'

export default function CheckoutPage() {
  const nav = useNavigate()
  const { clear } = useCart()
  const { reload } = useCatalog()
  const { profile, session } = useAuth()
  const { lines, total, valid, loading } = useCartLines()
  const [f, setF] = useState({ name: '', phone: '', pickup: '', notes: '' })
  const [tried, setTried] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (profile?.full_name) setF((x) => (x.name ? x : { ...x, name: profile.full_name }))
  }, [profile])
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const bad = {
    name: f.name.trim().length < 2 ? 'Nama minimal 2 karakter.' : '',
    phone: f.phone && !/^[0-9+\-\s]{8,16}$/.test(f.phone) ? 'Nomor telepon tidak valid.' : '',
  }

  if (!supabase) return <BackendNotice />
  if (loading && lines.length) return <GridSkeleton n={2} />
  if (!lines.length) return <Notice icon={ShoppingCart} title="Keranjangmu kosong" action={<Link to="/menu" className={btn}>Lihat Menu</Link>}>Tambahkan menu sebelum checkout.</Notice>
  if (!valid) return <Notice title="Ada item yang perlu diperbaiki" action={<Link to="/cart" className={btn}>Buka Keranjang</Link>}>Stok atau ketersediaan beberapa menu berubah.</Notice>

  const next = (e) => {
    e.preventDefault()
    setTried(true)
    if (!bad.name && !bad.phone) setConfirm(true)
  }
  const place = async () => {
    if (busy) return // cegah klik ganda
    setBusy(true)
    setErr('')
    const { data, error } = await supabase.rpc('create_order', {
      p_name: f.name.trim(), p_phone: f.phone.trim() || null, p_pickup: f.pickup.trim() || null, p_notes: f.notes.trim() || null,
      p_payment: 'cash', p_items: lines.map((l) => ({ product_id: l.id, qty: l.qty, note: l.note || null })),
    })
    if (error) {
      const m = error.message || ''
      setBusy(false)
      setConfirm(false)
      setErr(
        m.includes('STOK_TIDAK_CUKUP') || m.includes('PRODUK_TIDAK_TERSEDIA')
          ? 'Stok atau ketersediaan salah satu menu berubah. Periksa kembali keranjangmu.'
          : 'Pesanan belum bisa dibuat. Keranjangmu aman, silakan coba lagi.'
      )
      reload()
      return
    }
    try {
      const old = JSON.parse(localStorage.getItem('wartech-orders')) || []
      localStorage.setItem('wartech-orders', JSON.stringify([{ token: data.track_token, no: data.order_no, total: data.total, at: new Date().toISOString() }, ...old].slice(0, 30)))
    } catch {
      /* abaikan */
    }
    clear()
    nav(`/orders/${data.track_token}`, { replace: true })
  }

  return (
    <div className="py-4">
      <h1 className={`text-3xl ${heading}`}>Checkout</h1>
      <form onSubmit={next} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className={`space-y-4 p-6 ${card}`}>
          <label className={lbl}>Nama pemesan
            <input value={f.name} onChange={set('name')} maxLength={80} placeholder="Nama kamu" autoComplete="name" className={`${input} mt-1.5 font-normal`} />
            {tried && bad.name && <span className="mt-1 block text-xs font-normal text-red-500">{bad.name}</span>}
          </label>
          <label className={lbl}>Nomor telepon (opsional)
            <input value={f.phone} onChange={set('phone')} inputMode="tel" placeholder="08xxxxxxxxxx" autoComplete="tel" className={`${input} mt-1.5 font-normal`} />
            {tried && bad.phone && <span className="mt-1 block text-xs font-normal text-red-500">{bad.phone}</span>}
          </label>
          <label className={lbl}>Nomor meja / lokasi pengambilan (opsional)
            <input value={f.pickup} onChange={set('pickup')} maxLength={80} placeholder="Contoh: Meja 5 / ambil di kasir" className={`${input} mt-1.5 font-normal`} />
          </label>
          <label className={lbl}>Catatan pesanan (opsional)
            <textarea value={f.notes} onChange={set('notes')} maxLength={200} rows={3} className={`${input} mt-1.5 h-auto py-2 font-normal`} />
          </label>
          <fieldset>
            <legend className={`${lbl} mb-2`}>Metode pembayaran</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border-2 border-brand bg-soft/50 p-4 dark:bg-brand/10">
                <Banknote className="mt-0.5 h-5 w-5 text-brand" />
                <div><p className="font-bold text-navy dark:text-white">Tunai di kasir</p><p className={`text-xs ${muted}`}>Bayar ke kasir saat mengambil pesanan.</p></div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 opacity-60 dark:border-white/10">
                <QrCode className="mt-0.5 h-5 w-5" />
                <div><p className="font-bold text-navy dark:text-white">QRIS</p><p className={`text-xs ${muted}`}>Belum tersedia. Menunggu QR resmi kantin.</p></div>
              </div>
            </div>
          </fieldset>
          {!session && <p className={`text-xs ${muted}`}>Kamu memesan sebagai tamu. Simpan tautan pelacakan yang muncul setelah pesanan dibuat, atau <Link to="/login" className="font-semibold text-brand">login</Link> agar riwayat tersimpan.</p>}
          {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10">{err}</p>}
        </div>
        <aside className={`h-fit p-6 lg:sticky lg:top-24 ${card}`}>
          <h2 className="font-bold text-navy dark:text-white">Ringkasan</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {lines.map((l) => <li key={l.id} className="flex justify-between gap-3"><span className="text-slate-600 dark:text-slate-300">{l.qty}× {l.product.name}</span><span className="font-semibold text-navy dark:text-white">{rupiah(l.subtotal)}</span></li>)}
          </ul>
          <div className="mt-4 flex justify-between border-t border-soft pt-4 dark:border-white/10"><span className={muted}>Total</span><span className="text-2xl font-extrabold text-navy dark:text-white">{rupiah(total)}</span></div>
          <button type="submit" className={`${btn} mt-5 w-full py-3`}>Buat Pesanan</button>
        </aside>
      </form>
      <Modal open={confirm} onClose={() => !busy && setConfirm(false)} title="Konfirmasi pesanan">
        <h2 className={`text-xl ${heading}`}>Konfirmasi pesanan</h2>
        <p className={`mt-1 text-sm ${muted}`}>Atas nama {f.name.trim()} · Tunai di kasir</p>
        <ul className="mt-4 space-y-1.5 text-sm">
          {lines.map((l) => <li key={l.id} className="flex justify-between gap-3"><span>{l.qty}× {l.product.name}</span><span>{rupiah(l.subtotal)}</span></li>)}
        </ul>
        <p className="mt-4 flex justify-between border-t border-soft pt-3 text-lg font-extrabold text-navy dark:border-white/10 dark:text-white"><span>Total</span><span>{rupiah(total)}</span></p>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" disabled={busy} onClick={() => setConfirm(false)} className={btnGhost}>Kembali</button>
          <button type="button" disabled={busy} onClick={place} className={btn}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? 'Memproses…' : 'Ya, buat pesanan'}</button>
        </div>
      </Modal>
    </div>
  )
}

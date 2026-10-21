import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { card, heading, muted } from '../../lib/ui'
import { rupiah } from '../../lib/format'
import { supabase } from '../../lib/supabase'

const LOW = 5 // ambang stok menipis (nanti dipindah ke Pengaturan)

export default function AdminDashboard() {
  const { tick } = useOutletContext()
  const [d, setD] = useState(null)
  useEffect(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    Promise.all([
      supabase.from('orders').select('total,status,payment_status').gte('created_at', start.toISOString()),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true).lte('stock', LOW),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ]).then(([o, low, act]) => {
      const rows = o.data || []
      const live = rows.filter((r) => !['rejected', 'cancelled'].includes(r.status))
      const n = (...s) => rows.filter((r) => s.includes(r.status)).length
      setD({
        err: Boolean(o.error || low.error || act.error),
        revenue: live.filter((r) => r.payment_status === 'paid').reduce((s, r) => s + r.total, 0),
        orders: live.length, pending: n('pending'), active: n('accepted', 'preparing'), ready: n('ready'), done: n('completed'),
        low: low.count || 0, products: act.count || 0,
      })
    })
  }, [tick])

  const cards = d && [
    ['Omzet hari ini', rupiah(d.revenue), 'Pesanan yang sudah lunas'], ['Pesanan hari ini', d.orders, 'Tidak termasuk ditolak/dibatalkan'],
    ['Menunggu konfirmasi', d.pending, 'Perlu diterima atau ditolak'], ['Sedang diproses', d.active, 'Diterima + diproses'],
    ['Siap diambil', d.ready, 'Menunggu pelanggan'], ['Selesai hari ini', d.done, ''],
    ['Stok menipis', d.low, `Stok ≤ ${LOW} dari ${d.products} produk aktif`],
  ]
  return (
    <div>
      <h1 className={`text-2xl ${heading}`}>Dashboard</h1>
      <p className={`text-sm ${muted}`}>Ringkasan hari ini, dihitung dari database.</p>
      {d?.err && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10">Sebagian data gagal dimuat.</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {!d && Array.from({ length: 7 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-3xl bg-soft/70 dark:bg-white/10" />)}
        {cards?.map(([t, v, s]) => (
          <div key={t} className={`p-5 ${card}`}>
            <p className={`text-sm ${muted}`}>{t}</p>
            <p className="mt-1 text-2xl font-extrabold text-navy dark:text-white">{v}</p>
            {s && <p className={`mt-1 text-xs ${muted}`}>{s}</p>}
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3 text-sm font-semibold text-brand">
        <Link to="/admin/orders" className="hover:underline">Kelola pesanan</Link>
        <Link to="/admin/products" className="hover:underline">Kelola produk</Link>
      </div>
    </div>
  )
}

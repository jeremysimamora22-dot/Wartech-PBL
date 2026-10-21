import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Chip from '../../components/Chip'
import { useToast } from '../../context/ToastContext'
import { dateTime, rupiah } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import { btn, btnGhost, card, heading, input, muted } from '../../lib/ui'

const TABS = [['all', 'Semua'], ['pending', 'Baru'], ['accepted', 'Diterima'], ['preparing', 'Diproses'], ['ready', 'Siap Diambil'], ['completed', 'Selesai'], ['closed', 'Ditolak/Dibatalkan']]
const NEXT = { pending: ['accepted', 'Terima'], accepted: ['preparing', 'Proses'], preparing: ['ready', 'Siap Diambil'], ready: ['completed', 'Selesaikan'] }
const CANCEL = { pending: 'rejected', accepted: 'cancelled', preparing: 'cancelled', ready: 'cancelled' }
const CLOSED = ['rejected', 'cancelled']

const explain = (m = '') =>
  m.includes('PEMBAYARAN_BELUM_LUNAS') ? 'Tandai pembayaran lunas dulu sebelum menyelesaikan pesanan.'
  : m.includes('ALASAN_WAJIB') ? 'Isi alasan terlebih dahulu.'
  : m.includes('TRANSISI_TIDAK_VALID') ? 'Status pesanan sudah berubah. Data dimuat ulang.'
  : m.includes('AKSES_DITOLAK') ? 'Akunmu tidak punya izin untuk aksi ini.'
  : 'Aksi gagal. Coba lagi.'

export default function AdminOrders() {
  const { tick } = useOutletContext()
  const toast = useToast()
  const [rows, setRows] = useState(null)
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState('')
  const [rej, setRej] = useState(null)
  const [reason, setReason] = useState('')

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(150)
    if (error) toast('Gagal memuat pesanan', 'warn')
    else setRows(data)
  }, [toast])
  useEffect(() => {
    load()
  }, [load, tick])

  const run = async (id, call, okText) => {
    setBusy(id)
    const { error } = await call()
    setBusy('')
    if (error) toast(explain(error.message), 'warn')
    else {
      toast(okText)
      setRej(null)
    }
    load()
  }
  const setStatus = (o, s, label, why) => run(o.id, () => supabase.rpc('set_order_status', { p_order: o.id, p_status: s, p_reason: why || null }), `${o.order_no}: ${label}`)

  const list = (rows || []).filter(
    (o) => (tab === 'all' || (tab === 'closed' ? CLOSED.includes(o.status) : o.status === tab)) && `${o.order_no} ${o.customer_name}`.toLowerCase().includes(q.trim().toLowerCase())
  )

  return (
    <div>
      <h1 className={`text-2xl ${heading}`}>Pesanan</h1>
      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex gap-2 overflow-x-auto">
          {TABS.map(([k, l]) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${tab === k ? 'bg-brand text-white shadow-glow' : 'bg-white/80 text-navy ring-1 ring-soft dark:bg-white/10 dark:text-white dark:ring-white/10'}`}>{l}</button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari no. pesanan / nama" aria-label="Cari pesanan" className={`${input} lg:ml-auto lg:w-64`} />
      </div>

      <div className="mt-5 space-y-4">
        {rows === null && <div className="h-40 animate-pulse rounded-3xl bg-soft/70 dark:bg-white/10" />}
        {rows && list.length === 0 && <p className={`py-10 text-center ${muted}`}>Belum ada pesanan pada filter ini.</p>}
        {list.map((o) => {
          const next = NEXT[o.status]
          return (
            <article key={o.id} className={`p-5 ${card}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-navy dark:text-white">{o.order_no}</p>
                  <p className={`text-xs ${muted}`}>{dateTime(o.created_at)} · {o.customer_name}{o.phone ? ` · ${o.phone}` : ''}{o.pickup ? ` · ${o.pickup}` : ''}</p>
                </div>
                <div className="flex gap-2"><Chip value={o.status} /><Chip kind="pay" value={o.payment_status} /></div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-navy dark:text-white">
                {o.order_items.map((i) => <li key={i.id}>{i.qty}× {i.product_name}{i.note && <span className={`text-xs ${muted}`}> ({i.note})</span>}</li>)}
              </ul>
              {o.notes && <p className={`mt-2 text-xs ${muted}`}>Catatan: {o.notes}</p>}
              {o.reject_reason && <p className="mt-2 text-xs text-red-500">Alasan: {o.reject_reason}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-auto text-lg font-extrabold text-navy dark:text-white">{rupiah(o.total)}</span>
                {next && <button type="button" disabled={busy === o.id} onClick={() => setStatus(o, next[0], next[1])} className={btn}>{next[1]}</button>}
                {o.payment_status !== 'paid' && !CLOSED.includes(o.status) && (
                  <button type="button" disabled={busy === o.id} onClick={() => run(o.id, () => supabase.rpc('set_payment_status', { p_order: o.id, p_status: 'paid' }), `${o.order_no}: pembayaran lunas`)} className={btnGhost}>Tandai Lunas</button>
                )}
                {CANCEL[o.status] && <button type="button" onClick={() => { setRej({ id: o.id, status: CANCEL[o.status] }); setReason('') }} className={`${btnGhost} !text-red-600`}>{o.status === 'pending' ? 'Tolak' : 'Batalkan'}</button>}
              </div>
              {rej?.id === o.id && (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={120} placeholder="Alasan (wajib diisi)" aria-label="Alasan" className={input} />
                  <button type="button" disabled={busy === o.id} onClick={() => setStatus(o, rej.status, rej.status === 'rejected' ? 'ditolak' : 'dibatalkan', reason)} className={btn}>Konfirmasi</button>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

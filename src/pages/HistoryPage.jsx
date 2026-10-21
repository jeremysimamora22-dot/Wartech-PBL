import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ReceiptText } from 'lucide-react'
import Chip from '../components/Chip'
import { Notice } from '../components/Notice'
import { useAuth } from '../context/AuthContext'
import { dateTime, rupiah } from '../lib/format'
import { supabase } from '../lib/supabase'
import { btn, card, heading, muted } from '../lib/ui'

export default function HistoryPage() {
  const { session } = useAuth()
  const [rows, setRows] = useState([])
  // Pesanan tamu dikenali lewat token yang tersimpan di perangkat ini.
  const local = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('wartech-orders')) || []
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    if (!supabase || !session) return
    supabase.from('orders').select('order_no,total,status,payment_status,created_at,track_token')
      .eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => setRows(data || []))
  }, [session])

  const known = new Set(rows.map((r) => r.track_token))
  const list = [
    ...rows.map((r) => ({ token: r.track_token, no: r.order_no, total: r.total, at: r.created_at, status: r.status, pay: r.payment_status })),
    ...local.filter((l) => !known.has(l.token)),
  ]

  return (
    <div className="mx-auto max-w-2xl py-4">
      <h1 className={`text-3xl ${heading}`}>Lacak Pesanan</h1>
      <p className={`mt-1 ${muted}`}>{session ? 'Riwayat pesanan akunmu dan pesanan dari perangkat ini.' : 'Pesanan yang dibuat di perangkat ini. Login agar riwayat tersimpan di akunmu.'}</p>
      {list.length === 0 ? (
        <Notice icon={ReceiptText} title="Belum ada pesanan" action={<Link to="/menu" className={btn}>Lihat Menu</Link>}>Pesananmu akan muncul di sini.</Notice>
      ) : (
        <ul className="mt-6 space-y-3">
          {list.map((r) => (
            <li key={r.token}>
              <Link to={`/orders/${r.token}`} className={`flex items-center justify-between gap-3 p-4 transition hover:-translate-y-0.5 ${card}`}>
                <div><p className="font-bold text-navy dark:text-white">{r.no}</p><p className={`text-xs ${muted}`}>{dateTime(r.at)}</p></div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-extrabold text-navy dark:text-white">{rupiah(r.total)}</span>
                  {r.status ? <div className="flex gap-1.5"><Chip value={r.status} /><Chip kind="pay" value={r.pay} /></div> : <span className="text-xs font-semibold text-brand">Lihat status</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

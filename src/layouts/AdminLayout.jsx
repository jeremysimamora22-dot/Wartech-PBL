import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ClipboardList, ExternalLink, LayoutDashboard, LogOut, Package } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'

const nav = [['/admin', 'Dashboard', LayoutDashboard, true], ['/admin/orders', 'Pesanan', ClipboardList, false], ['/admin/products', 'Produk', Package, false]]
const cls = ({ isActive }) =>
  `relative flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-brand text-white shadow-glow' : 'text-slate-600 hover:bg-soft dark:text-slate-300 dark:hover:bg-white/10'}`

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const { dark, toggle } = useTheme()
  const toast = useToast()
  const [tick, setTick] = useState(0)
  const [conn, setConn] = useState('')
  const [pending, setPending] = useState(0)

  // Realtime: pesanan baru/berubah -> naikkan `tick`, halaman anak memuat ulang datanya.
  useEffect(() => {
    const ch = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (pl) => {
        if (pl.eventType === 'INSERT') toast(`Pesanan baru ${pl.new.order_no}`)
        setTick((t) => t + 1)
      })
      .subscribe((s) => setConn(s))
    return () => {
      supabase.removeChannel(ch)
    }
  }, [toast])

  useEffect(() => {
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending').then(({ count }) => setPending(count || 0))
  }, [tick])

  const items = nav.map(([to, label, Icon, end]) => (
    <NavLink key={to} to={to} end={end} className={cls}>
      <Icon className="h-4 w-4" /> {label}
      {to === '/admin/orders' && pending > 0 && <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">{pending}</span>}
    </NavLink>
  ))
  const live = conn === 'SUBSCRIBED'

  return (
    <div className="min-h-screen bg-mist transition-colors duration-500 dark:bg-[#0A1230] md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden flex-col gap-1 border-r border-soft bg-white/80 p-4 dark:border-white/10 dark:bg-[#0F1A45]/60 md:sticky md:top-0 md:flex md:h-screen">
        <Link to="/admin" className="mb-4 flex items-center gap-3">
          <Logo size={36} />
          <div className="leading-tight"><p className="font-extrabold text-navy dark:text-white">WarTech</p><p className="text-xs text-slate-500">Admin</p></div>
        </Link>
        {items}
        <div className="mt-auto space-y-1">
          <Link to="/" className={cls({ isActive: false })}><ExternalLink className="h-4 w-4" /> Lihat website</Link>
          <button type="button" onClick={signOut} className={`${cls({ isActive: false })} w-full`}><LogOut className="h-4 w-4" /> Keluar</button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-soft bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#0A1230]/80">
          <div className="flex items-center gap-2 md:hidden"><Logo size={30} /><span className="font-extrabold text-navy dark:text-white">Admin</span></div>
          <span className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">Halo, {profile?.full_name || 'Admin'}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <i className={`h-2 w-2 rounded-full ${live ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {live ? 'Live' : 'Menyambung…'}
            </span>
            <ThemeToggle dark={dark} onToggle={toggle} />
          </div>
        </header>
        <nav className="flex gap-2 overflow-x-auto px-4 pt-3 md:hidden">
          {items}
          <button type="button" onClick={signOut} className={cls({ isActive: false })}><LogOut className="h-4 w-4" /> Keluar</button>
        </nav>
        <main className="p-4 sm:p-6"><Outlet context={{ tick }} /></main>
      </div>
    </div>
  )
}

import { Info } from 'lucide-react'
import { card } from '../lib/ui'

export function Notice({ icon: Icon = Info, title, children, action }) {
  return (
    <div className={`mx-auto my-8 max-w-xl p-8 text-center ${card}`}>
      <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-soft text-brand dark:bg-brand/20">
        <Icon className="h-7 w-7" />
      </span>
      <h2 className="text-xl font-extrabold text-navy dark:text-white">{title}</h2>
      <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{children}</div>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}

export const BackendNotice = () => (
  <Notice title="Backend belum dikonfigurasi">
    Salin <code>.env.example</code> menjadi <code>.env</code>, isi <code>VITE_SUPABASE_URL</code> dan{' '}
    <code>VITE_SUPABASE_ANON_KEY</code>, lalu jalankan ulang <code>npm run dev</code>.
  </Notice>
)

export const GridSkeleton = ({ n = 6 }) => (
  <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: n }, (_, i) => (
      <div key={i} className="h-72 animate-pulse rounded-3xl bg-soft/70 dark:bg-white/10" />
    ))}
  </div>
)

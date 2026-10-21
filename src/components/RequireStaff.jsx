import { Link, Navigate, useLocation } from 'react-router-dom'
import { Loader2, ShieldAlert } from 'lucide-react'
import { BackendNotice, Notice } from './Notice'
import { useAuth } from '../context/AuthContext'
import { btn, btnGhost } from '../lib/ui'

const Shell = ({ children }) => <div className="min-h-screen bg-mist p-6 dark:bg-[#0A1230]">{children}</div>

// Pagar di frontend hanya untuk UX. Penegakan sebenarnya ada di RLS + fungsi database.
export default function RequireStaff({ children }) {
  const { configured, loading, session, isStaff, signOut } = useAuth()
  const loc = useLocation()
  if (!configured) return <Shell><BackendNotice /></Shell>
  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div>
  if (!session) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (!isStaff) {
    return (
      <Shell>
        <Notice
          icon={ShieldAlert}
          title="Akses admin diperlukan"
          action={
            <>
              <Link to="/" className={btnGhost}>Ke beranda</Link>
              <button type="button" onClick={signOut} className={btn}>Ganti akun</button>
            </>
          }
        >
          Akun ini belum memiliki izin admin atau petugas.
        </Notice>
      </Shell>
    )
  }
  return children
}

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Eye, EyeOff, Loader2, Lock, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { isStaffRole, useAuth } from '../context/AuthContext'

const link =
  'relative font-semibold text-brand after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100'

const GoogleG = () => (
  <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
)

function Field({ id, label, icon: Icon, right, ...rest }) {
  return (
    <div className="group">
      <label
        htmlFor={id}
        className="mb-2 block text-[15px] font-semibold text-navy transition-all duration-300 group-focus-within:translate-x-1 group-focus-within:text-brand dark:text-white dark:group-focus-within:text-bright"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          {...rest}
          className="peer h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-[15px] text-navy outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-brand focus:shadow-[0_0_0_4px_rgba(37,99,235,0.14),0_10px_24px_-10px_rgba(37,99,235,0.4)] dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-all duration-300 peer-focus:scale-110 peer-focus:text-brand" />
        {right}
      </div>
    </div>
  )
}

const NO_BACKEND = 'Backend belum dikonfigurasi. Isi file .env (lihat .env.example).'
const friendly = (m = '') =>
  /invalid login/i.test(m) ? 'Email atau password salah.'
  : /email not confirmed/i.test(m) ? 'Email belum dikonfirmasi. Cek kotak masuk emailmu.'
  : /already registered/i.test(m) ? 'Email ini sudah terdaftar. Silakan login.'
  : /provider is not enabled|unsupported provider/i.test(m) ? 'Login Google belum diaktifkan di Supabase.'
  : /password/i.test(m) ? 'Password minimal 6 karakter.'
  : 'Terjadi kendala. Periksa koneksi lalu coba lagi.'

export default function LoginCard({ mode = 'login' }) {
  const reg = mode === 'register'
  const { configured, signIn, signUp, signInGoogle } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | success
  const [msg, setMsg] = useState('')
  const busy = status !== 'idle'

  // Autentikasi sungguhan lewat Supabase. Peran (admin/petugas/pelanggan) dibaca dari tabel profiles.
  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setMsg('')
    if (!configured) return setMsg(NO_BACKEND)
    const f = new FormData(e.currentTarget)
    const email = String(f.get('user')).trim()
    const pass = String(f.get('pass'))
    if (!email.includes('@')) return setMsg('Masukkan alamat email yang terdaftar (login dengan username belum tersedia).')
    setStatus('loading')
    try {
      if (reg) {
        const d = await signUp(String(f.get('name')).trim(), email, pass)
        setStatus('success')
        if (d.session) setTimeout(() => navigate('/', { replace: true }), 700)
        else {
          setMsg('Akun dibuat. Cek emailmu untuk konfirmasi, lalu login.')
          setTimeout(() => setStatus('idle'), 2500)
        }
      } else {
        const p = await signIn(email, pass)
        setStatus('success')
        setTimeout(() => navigate(loc.state?.from || (isStaffRole(p) ? '/admin' : '/'), { replace: true }), 700)
      }
    } catch (err) {
      setStatus('idle')
      setMsg(friendly(err.message))
    }
  }

  const google = async () => {
    setMsg('')
    if (!configured) return setMsg(NO_BACKEND)
    try {
      await signInGoogle()
    } catch (err) {
      setMsg(friendly(err.message))
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[560px] self-start rounded-[28px] border border-soft bg-white/90 p-6 shadow-soft backdrop-blur-xl transition-colors duration-500 sm:p-10 lg:mt-2 lg:max-w-none dark:border-white/10 dark:bg-[#0F1A45]/80"
    >
      <div className="absolute right-8 top-8 hidden grid-cols-5 gap-2 sm:grid" aria-hidden="true">
        {Array.from({ length: 25 }, (_, i) => (
          <i key={i} className="h-1 w-1 rounded-full bg-soft dark:bg-white/15" />
        ))}
      </div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="mx-auto w-fit drop-shadow-[0_14px_20px_rgba(37,99,235,0.35)]"
      >
        <Logo size={84} />
      </motion.div>
      <h2 className="mt-3 text-center text-[40px] font-extrabold tracking-tight text-navy dark:text-white">WarTech</h2>
      <p className="mt-5 text-center text-[22px] font-bold text-navy dark:text-white">{reg ? 'Buat Akun WarTech' : 'Selamat Datang Kembali!'}</p>
      <p className="mt-1 text-center text-[15px] text-slate-500 dark:text-slate-400">{reg ? 'Daftar untuk menyimpan riwayat pesananmu.' : 'Login untuk melanjutkan ke akun kamu.'}</p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        {reg && (
          <Field id="wt-name" name="name" label="Nama Lengkap" icon={User} type="text" placeholder="Masukkan nama lengkap" autoComplete="name" minLength={2} required />
        )}
        <Field
          id="wt-user"
          name="user"
          label={reg ? 'Email' : 'Email / Username'}
          icon={User}
          type="text"
          placeholder={reg ? 'Masukkan email' : 'Masukkan email atau username'}
          autoComplete="username"
          required
        />
        <div>
          <Field
            id="wt-pass"
            name="pass"
            minLength={reg ? 6 : undefined}
            label="Password"
            icon={Lock}
            type={show ? 'text' : 'password'}
            placeholder="Masukkan password"
            autoComplete="current-password"
            required
            right={
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-brand"
              >
                {show ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            }
          />
          {!reg && (
            <div className="mt-2 text-right text-sm">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setMsg('Reset password akan tersedia di tahap berikutnya. Untuk sementara, hubungi admin kantin.')
                }}
                className={link}
              >
                Lupa password?
              </a>
            </div>
          )}
        </div>

        {msg && (
          <p role="alert" className="rounded-xl bg-soft/70 px-4 py-3 text-sm font-medium text-navy dark:bg-white/10 dark:text-blue-100">
            {msg}
          </p>
        )}
        <motion.button
          type="submit"
          disabled={busy}
          whileHover={busy ? undefined : { scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`group flex h-14 w-full items-center justify-center rounded-2xl bg-[length:200%_100%] text-lg font-semibold text-white shadow-glow transition-[background-position,box-shadow] duration-500 hover:bg-right hover:shadow-[0_18px_40px_-8px_rgba(37,99,235,0.65)] ${
            status === 'success' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-brand via-bright to-brand'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={status}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              {status === 'idle' && (
                <>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  {reg ? 'Daftar' : 'Login'}
                </>
              )}
              {status === 'loading' && (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memproses…
                </>
              )}
              {status === 'success' && (
                <>
                  <Check className="h-5 w-5" strokeWidth={3} />
                  {reg ? 'Akun dibuat' : 'Login berhasil'}
                </>
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </form>

      <div className="my-6 flex items-center gap-4 text-sm text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        atau
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      <motion.button
        type="button"
        onClick={google}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-[15px] font-semibold text-navy shadow-sm transition-[background-color,box-shadow] duration-300 hover:bg-slate-50 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
      >
        <GoogleG />
        Login dengan Google
      </motion.button>

      <p className="mt-7 text-center text-[15px] text-slate-500 dark:text-slate-400">
        {reg ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
        <Link to={reg ? '/login' : '/register'} className={link}>
          {reg ? 'Login di sini' : 'Daftar di sini'}
        </Link>
      </p>
    </motion.section>
  )
}

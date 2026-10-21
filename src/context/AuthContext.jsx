import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)
export const isStaffRole = (p) => p?.role === 'admin' || p?.role === 'staff'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  const loadProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null)
      return null
    }
    const { data } = await supabase.from('profiles').select('id, full_name, role').eq('id', user.id).maybeSingle()
    setProfile(data)
    return data
  }, [])

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      await loadProfile(data.session?.user)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      setTimeout(() => loadProfile(s?.user), 0) // hindari memanggil Supabase langsung di dalam callback
    })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const value = useMemo(
    () => ({
      configured: Boolean(supabase),
      session,
      profile,
      loading,
      isStaff: isStaffRole(profile),
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return loadProfile(data.user)
      },
      signUp: async (name, email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
        if (error) throw error
        return data
      },
      signInGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
        if (error) throw error
      },
      signOut: () => supabase.auth.signOut(),
    }),
    [session, profile, loading, loadProfile]
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

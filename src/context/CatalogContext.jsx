import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const Ctx = createContext(null)
export const useCatalog = () => useContext(Ctx)

export function CatalogProvider({ children }) {
  const [state, setState] = useState({ loading: Boolean(supabase), error: null, categories: [], products: [] })

  const load = useCallback(async () => {
    if (!supabase) return
    setState((s) => ({ ...s, loading: true, error: null }))
    const [c, p] = await Promise.all([
      supabase.from('categories').select('id,name,sort_order').order('sort_order'),
      supabase
        .from('products')
        .select('id,category_id,name,description,price,image_url,stock,is_popular')
        .eq('is_active', true)
        .order('name'),
    ])
    const failed = c.error || p.error
    setState({
      loading: false,
      error: failed ? 'Menu belum bisa dimuat. Periksa koneksi lalu coba lagi.' : null,
      categories: c.data || [],
      products: p.data || [],
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return <Ctx.Provider value={{ ...state, reload: load }}>{children}</Ctx.Provider>
}

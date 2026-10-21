import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// null jika .env belum diisi: halaman menampilkan petunjuk, bukan data palsu.
export const supabase = url && key ? createClient(url, key) : null

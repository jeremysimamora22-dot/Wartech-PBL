import { createContext, useContext, useEffect, useState } from 'react'

const Ctx = createContext({ dark: false, toggle: () => {} })
export const useTheme = () => useContext(Ctx)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('wartech-theme') === 'dark'
    } catch {
      return false
    }
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem('wartech-theme', dark ? 'dark' : 'light')
    } catch {
      /* abaikan */
    }
  }, [dark])
  return <Ctx.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>{children}</Ctx.Provider>
}

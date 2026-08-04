import { createContext, useContext, useEffect, useState } from 'react'
import { lightTokens, darkTokens } from './tokens'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('unifix_theme') || 'light')

  const tokens = mode === 'dark' ? darkTokens : lightTokens

  useEffect(() => {
    localStorage.setItem('unifix_theme', mode)
    const root = document.documentElement
    Object.entries(tokens).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--${key}`, value)
      }
    })
    root.setAttribute('data-theme', mode)
    document.body.style.background = tokens.bg
    document.body.style.color = tokens.text
  }, [mode, tokens])

  const toggle = () => setMode(m => m === 'light' ? 'dark' : 'light')
  const setLight = () => setMode('light')
  const setDark = () => setMode('dark')

  return (
    <ThemeContext.Provider value={{ mode, tokens, toggle, setLight, setDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
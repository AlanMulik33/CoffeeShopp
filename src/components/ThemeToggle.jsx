import { useEffect } from 'react'
import { usePosStore } from '../store/posStore'

function ThemeToggle() {
  const theme = usePosStore((state) => state.theme)
  const toggleTheme = usePosStore((state) => state.toggleTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <button
      onClick={toggleTheme}
      className="rounded-2xl border border-[#ead8c0] bg-white px-5 py-3 text-sm font-bold text-[#6f3f24] shadow-sm transition hover:bg-[#fff4e7]"
    >
      {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  )
}

export default ThemeToggle
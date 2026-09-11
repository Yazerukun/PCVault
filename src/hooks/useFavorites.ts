import { useCallback, useEffect, useState } from 'react'

const KEY = 'pcvault:favs'

export function useFavorites() {
  const [favs, setFavs] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(favs))
    } catch {
      /* ignore */
    }
  }, [favs])

  const toggle = useCallback((id: string) => {
    setFavs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  return { favs, toggle }
}
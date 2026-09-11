import { useEffect, useState } from 'react'
import { loadGames } from './games'
import type { Game } from './gameTypes'

export function useGames(): Game[] | null {
  const [games, setGames] = useState<Game[] | null>(null)
  useEffect(() => {
    let on = true
    loadGames().then((g) => {
      if (on) setGames(g)
    })
    return () => {
      on = false
    }
  }, [])
  return games
}
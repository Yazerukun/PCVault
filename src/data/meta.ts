export interface MetaState {
  checkedAt: string
  games: number
  keptLinks: number
  removedLinks: number
}

export interface LatestEntry {
  title: string
  link: string
  date: string
}

export interface GameHealth {
  live: number
  dead: number
  total: number
}

export type HealthMap = Record<string, GameHealth>
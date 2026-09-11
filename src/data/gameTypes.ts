export interface MirrorLink {
  label: string
  url: string
}

export interface RepackHistory {
  version: string
  date: string
}

export interface Game {
  id: string
  title: string
  appid?: number
  trailer?: string
  repack?: string
  history?: RepackHistory[]
  year: number
  genres: string[]
  languages: string
  size?: string
  password?: string
  desc: string
  cover?: string
  wallpaper?: string
  colors?: [string, string]
  screenshots?: string[]
  link: string
  date: string
  added?: string
  download: string
  mirrors: MirrorLink[]
}
export interface Stat {
  value: string
  label: string
}

export interface AboutData {
  bio1: string
  bio2: string
  skills: string[]
  stats: Stat[]
  badge: string
  available: boolean
  cvUrl: string
  photoUrl: string
}

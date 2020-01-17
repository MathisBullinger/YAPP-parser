interface Podcast {
  title: string
  creator: string
  episodes: Episode[]
}

interface Episode {
  title: string
}

interface Rule {
  [key: string]: Rule | Function
  open?(): void
  close?(): void
  text?(v: string): void
}

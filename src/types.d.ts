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
  open?(attrs?: Attributes): void
  close?(): void
  text?(v: string): void
}

type Attributes =
  | {
      [key: string]: string
    }
  | {
      [key: string]: QualifiedAttribute
    }

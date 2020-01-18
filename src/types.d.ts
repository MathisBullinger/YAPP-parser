interface Podcast {
  title: string
  creator: string
  website: string
  language: string
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

type Priority = number | 'append'

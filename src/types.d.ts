interface Podcast {
  name: string
  creator: string
  website: string
  feed: string
  language: string
  description: {
    short: string
    long: string
  }
  publisher: {
    name: string
    email: string
  }
  categories: string[]
  lastBuild: string
  image: string
  websub: {
    hub: string
    url: string
  }
  episodes: Episode[]
}

interface Episode {
  id: string
  title: string
  file: string
  date: string
  description: {
    short: string
    long: string
  }
  image: string
  season: string
  episode: string
  type: string
  duration: string | number
}

interface Rule {
  [key: string]: Rule | Function
  open?(attrs?: Attributes): void
  close?(): void
  text?(v: string, cdata?: boolean): void
}

type Attributes =
  | {
      [key: string]: string
    }
  | {
      [key: string]: QualifiedAttribute
    }

type Priority = number | 'append'

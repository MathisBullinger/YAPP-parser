import axios from 'axios'
import { createStream } from 'sax'
import fs from 'fs'

interface Options {
  url: string
  mode?: 'clean'
  debug?: boolean
}

export default async function({ url, mode = 'clean', debug = false }: Options) {
  if (mode !== 'clean') return console.log(`invalid mode ${mode}`)

  try {
    const { data } = await axios({ method: 'get', responseType: 'stream', url })
    const podcast = await parseStream(data, debug)
    console.log(podcast)
  } catch (e) {
    console.error(e)
  }
}

class Node {
  public readonly children: Node[] = []
  constructor(public readonly name: string, public readonly parent?: Node) {}

  push(name: string) {
    const child = new Node(name, this)
    this.children.push(child)
    return child
  }

  get root() {
    if (!this.parent) return this
    return this.parent.root
  }

  printBranch() {
    let node: Node = this
    const branch = []
    while (node) {
      branch.push(node)
      node = node.parent
    }
    return branch
      .map(({ name }) => name)
      .reverse()
      .join(' -> ')
  }
}

const parseStream = (stream: NodeJS.ReadableStream, debug = false) =>
  new Promise(resolve => {
    const sax = createStream(false, {
      trim: true,
      normalize: true,
      lowercase: false,
      xmlns: false,
      position: true,
    })

    let parseTree = new Node('root')
    let logs = []

    const podcast: Partial<Podcast> = {
      episodes: [],
    }

    interface Handler {
      [key: string]: Handler | Function
      open?(): void
      close?(): void
      text?(v: string): void
    }

    const textRule = (text: (v: string) => void) => ({ text })

    let episode: Partial<Episode>
    const handlers: Handler = {
      channel: {
        title: textRule(v => (podcast.title = v)),
        author: textRule(v => (podcast.creator = v)),
        item: {
          open: () => {
            episode = {}
          },
          close: () => {
            podcast.episodes.push(episode as Episode)
            episode = null
          },
          title: textRule(v => (episode.title = v)),
        },
      },
    }
    let activeHandler: Handler
    let handlerChain: string[] = []

    function openHandler(name: string): Handler {
      name = name.toLowerCase()
      if (['open', 'close', 'text'].includes(name)) {
        console.error(`invalid tag name ${name}`)
        return activeHandler
      }
      if (
        activeHandler &&
        parseTree.name.toLowerCase() !== handlerChain[handlerChain.length - 1]
      )
        return activeHandler
      const handlerPool = activeHandler || handlers
      let newHandler = activeHandler
      if (name in handlerPool) {
        newHandler = handlerPool[name] as Handler
        handlerChain.push(name)
        if ('open' in newHandler) newHandler.open()
        if (debug) logs.push(`open ${handlerChain.join('.')}`)
      }
      return newHandler
    }

    const _select = (path: string[], cur: Object = handlers) => {
      if (path.length === 0) return cur
      return _select(path.slice(1), cur[path[0]])
    }

    function closeHandler(): Handler {
      if (
        parseTree.name.toLowerCase() === handlerChain[handlerChain.length - 1]
      ) {
        if ('close' in activeHandler) activeHandler.close()
        if (debug) logs.push(`close ${handlerChain.join('.')}`)
        handlerChain = handlerChain.slice(0, -1)
        if (handlerChain.length > 0) return _select(handlerChain, handlers)
        else {
          console.log('handler to null')
          return null
        }
      }

      return activeHandler
    }

    sax.on('opentag', ({ name }) => {
      activeHandler = openHandler(name)
      parseTree = parseTree.push(name)
      if (debug) logs.push(parseTree.printBranch())
    })

    sax.on('text', (text: string) => {
      if (
        activeHandler &&
        parseTree.name.toLowerCase() ===
          handlerChain[handlerChain.length - 1] &&
        'text' in activeHandler
      )
        activeHandler.text(text)
    })

    sax.on('closetag', () => {
      activeHandler = closeHandler()
      parseTree = parseTree ? parseTree.parent : null
    })

    sax.on('end', () => {
      if (debug) fs.writeFileSync('./parse.log', logs.join('\n'))
      resolve(podcast)
    })

    stream.pipe(sax)
  })

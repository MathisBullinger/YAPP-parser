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
    await parseStream(data, debug)
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

    let chain = new Node('root')
    let logs = []
    sax.on('opentag', ({ name }) => {
      chain = chain.push(name)
      if (debug) logs.push(chain.printBranch())
    })

    sax.on('closetag', () => {
      chain = chain.parent
    })

    sax.on('end', () => {
      if (debug) fs.writeFileSync('./parse.log', logs.join('\n'))
      resolve()
    })

    stream.pipe(sax)
  })

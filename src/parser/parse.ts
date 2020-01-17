import fs from 'fs'
import { createStream } from 'sax'
import { select } from '../utils/object'
import buildRules from './rules'
import Node from './node'

export default (stream: NodeJS.ReadableStream, debug = false) =>
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

    const handlers = buildRules(podcast)

    let activeHandler: Rule
    let handlerChain: string[] = []

    function openHandler(name: string): Rule {
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
        newHandler = handlerPool[name] as Rule
        handlerChain.push(name)
        if ('open' in newHandler) newHandler.open()
        if (debug) logs.push(`open ${handlerChain.join('.')}`)
      }
      return newHandler
    }

    function closeHandler(): Rule {
      if (
        parseTree.name.toLowerCase() === handlerChain[handlerChain.length - 1]
      ) {
        if ('close' in activeHandler) activeHandler.close()
        if (debug) logs.push(`close ${handlerChain.join('.')}`)
        handlerChain = handlerChain.slice(0, -1)
        if (handlerChain.length > 0) return select(handlers, ...handlerChain)
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

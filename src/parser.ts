import axios from 'axios'
import { createStream } from 'sax'

interface Options {
  url: string
  mode?: 'clean'
}

export default async function({ url, mode = 'clean' }: Options) {
  if (mode !== 'clean') return console.log(`invalid mode ${mode}`)

  try {
    console.log('query')
    const { data } = await axios({ method: 'get', responseType: 'stream', url })
    console.log('pipe start')
    await parseStream(data)
    console.log('pipe stop')
  } catch (e) {
    console.error(e)
  }

  console.log('done')
}

const parseStream = (stream: NodeJS.ReadableStream) =>
  new Promise(resolve => {
    const sax = createStream(false, {
      trim: true,
      normalize: true,
      lowercase: false,
      xmlns: false,
      position: true,
    })

    sax.on('end', () => {
      console.log('end')
      resolve()
    })

    stream.pipe(sax)
  })

import axios from 'axios'
import parseStream from './parse'

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

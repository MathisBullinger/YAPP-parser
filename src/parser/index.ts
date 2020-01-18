import axios from 'axios'
import parseStream from './parse'

interface Options {
  url: string
  mode?: 'clean'
  debug?: boolean
}

export default async function({
  url,
  mode = 'clean',
  debug = false,
}: Options): Promise<Podcast> {
  if (mode !== 'clean') return void console.log(`invalid mode ${mode}`)

  try {
    const { data } = await axios({ method: 'get', responseType: 'stream', url })
    return await parseStream(data, debug)
  } catch (e) {
    console.error(e)
  }
}

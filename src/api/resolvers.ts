import parse from '../parser'
import { addPodcast } from '../db'

export default {
  Query: {
    hello: () => 'parser says hello!',
  },

  Mutation: {
    parse: async (root, { url, id, dry = false, debug = false }) => {
      const podcast = { ...(await parse({ url, debug: debug })), feed: url }
      if (!dry && podcast) await addPodcast(podcast, id)
      return podcast
    },
  },
}

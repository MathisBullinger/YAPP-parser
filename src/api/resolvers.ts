import parse from '../parser'

export default {
  Query: {
    hello: () => 'parser says hello!',
  },

  Mutation: {
    parse: async (root, { url, debug = false }) =>
      await parse({ url, debug: debug }),
  },
}

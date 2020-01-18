import parse from '../parser'

export default {
  Query: {
    hello: () => 'parser says hello!',
  },

  Mutation: {
    parse: async (root, { url }) => await parse({ url }),
  },
}

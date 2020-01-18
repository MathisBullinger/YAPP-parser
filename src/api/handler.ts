import { ApolloServer } from 'apollo-server-lambda'
import typeDefs from './schema.gql'
import resolvers from './resolvers'

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers,
  introspection: true,
  playground: {
    endpoint:
      process.env.NODE_ENV === 'devlopment' ? '/' : `/${process.env.stage}`,
  },
})

export const parser = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
})

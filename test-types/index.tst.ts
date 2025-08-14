import Hapi, { type Server, type ServerApplicationState } from '@hapi/hapi'
import { expect } from 'tstyche'
import hapiScalar from '../lib/index.js'

const server = Hapi.server()

server.register(hapiScalar)
server.register({
  plugin: hapiScalar,
  options: {},
})
server.register([hapiScalar])
server.register([
  {
    plugin: hapiScalar,
    options: {},
  },
])

const hapiScalarOption: hapiScalar.RegisterOptions = {
  routePrefix: '/scalar',
  scalarConfig: {
    url: '/openapi.json',
    hiddenClients: true,
    theme: 'default',
  },
}

expect(
  server.register({
    plugin: hapiScalar,
    options: hapiScalarOption,
  }),
).type.toBe<Promise<Server<ServerApplicationState> & void>>()

const emptyHapiScalarOption: hapiScalar.RegisterOptions = {}

expect(
  server.register({
    plugin: hapiScalar,
    options: emptyHapiScalarOption,
  }),
).type.toBe<Promise<Server<ServerApplicationState> & void>>()

server.register({
  plugin: hapiScalar,
  options: {
    routePrefix: '/scalar',
    scalarConfig: (request) => ({ url: request.query.customUrl || '/default.json' }),
  },
})

server.register({
  plugin: hapiScalar,
  options: {
    routePrefix: '/scalar',
    scalarConfig: async (request) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ url: request.query.customUrl || '/async.json' }), 100)
      })
    },
  },
})

import test from 'node:test'
import Hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import HapiSwagger from 'hapi-swagger'
import hapiScalar from '../lib/index.js'

function exampleDocument() {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Example API',
      version: '1.0.0',
    },
    paths: {},
    components: {
      schemas: {},
    },
  }
}

test('plugin are registered', async (t) => {
  t.plan(1)
  const server = Hapi.server()
  await server.register(hapiScalar)

  t.assert.ok(server.registrations['hapi-scalar'])
})

test('plugin are registered (plugin object)', async (t) => {
  t.plan(1)
  const server = Hapi.server()
  await server.register({ plugin: hapiScalar, options: {} })

  t.assert.ok(server.registrations['hapi-scalar'])
})

test('registers route with default options', async (t) => {
  t.plan(3)
  const server = Hapi.server()
  await server.register({ plugin: hapiScalar, options: {} })

  const res = await server.inject({ method: 'GET', url: '/scalar' })

  t.assert.equal(res.statusCode, 200)
  t.assert.equal(res.headers['content-type'], 'text/html; charset=utf-8')
  t.assert.match(res.payload, /<title>Scalar API Reference<\/title>/)
})

test('registers route with custom routePrefix', async (t) => {
  t.plan(3)
  const server = Hapi.server()
  await server.register({ plugin: hapiScalar, options: { routePrefix: '/docs' } })

  const res = await server.inject({ method: 'GET', url: '/docs' })

  t.assert.equal(res.statusCode, 200)
  t.assert.equal(res.headers['content-type'], 'text/html; charset=utf-8')
  t.assert.match(res.payload, /<title>Scalar API Reference<\/title>/)
})

test('uses custom scalarConfig object (url)', async (t) => {
  t.plan(3)
  const server = Hapi.server()
  await server.register({
    plugin: hapiScalar,
    /** @type {hapiScalar.RegisterOptions} */
    options: { scalarConfig: { url: '/openapi.json' } },
  })

  const res = await server.inject({ method: 'GET', url: '/scalar' })

  t.assert.equal(res.statusCode, 200)
  t.assert.equal(res.headers['content-type'], 'text/html; charset=utf-8')
  t.assert.match(res.payload, /"url": "\/openapi\.json"/)
})

test('uses custom scalarConfig object (content)', async (t) => {
  t.plan(3)
  const server = Hapi.server()
  await server.register({
    plugin: hapiScalar,
    /** @type {hapiScalar.RegisterOptions} */
    options: { scalarConfig: { content: exampleDocument } },
  })

  const res = await server.inject({ method: 'GET', url: '/scalar' })

  t.assert.equal(res.statusCode, 200)
  t.assert.equal(res.headers['content-type'], 'text/html; charset=utf-8')
  t.assert.match(res.payload, /"content":\s*{\s*"openapi":\s*"3\.1\.0"/)
})

test('uses custom scalarConfig function', async (t) => {
  t.plan(6)
  const server = Hapi.server()
  await server.register({
    plugin: hapiScalar,
    /** @type {hapiScalar.RegisterOptions} */
    options: {
      scalarConfig: (req) => ({ url: req.query.customUrl || '/default.json' }),
    },
  })

  const res1 = await server.inject({ method: 'GET', url: '/scalar?customUrl=/custom.json' })
  const res2 = await server.inject({ method: 'GET', url: '/scalar' })

  t.assert.equal(res1.statusCode, 200)
  t.assert.equal(res1.headers['content-type'], 'text/html; charset=utf-8')
  t.assert.match(res1.payload, /"url": "\/custom\.json"/)

  t.assert.equal(res2.statusCode, 200)
  t.assert.equal(res2.headers['content-type'], 'text/html; charset=utf-8')
  t.assert.match(res2.payload, /"url": "\/default\.json"/)
})

test('uses custom scalarConfig async function', async (t) => {
  t.plan(6)
  const server = Hapi.server()
  await server.register({
    plugin: hapiScalar,
    /** @type {hapiScalar.RegisterOptions} */
    options: {
      scalarConfig: async (req) => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ url: req.query.customUrl || '/async.json' }), 100)
        })
      },
    },
  })

  const res1 = await server.inject({ method: 'GET', url: '/scalar?customUrl=/custom.json' })
  const res2 = await server.inject({ method: 'GET', url: '/scalar' })

  t.assert.equal(res1.statusCode, 200)
  t.assert.equal(res1.headers['content-type'], 'text/html; charset=utf-8')
  t.assert.match(res1.payload, /"url": "\/custom\.json"/)

  t.assert.equal(res2.statusCode, 200)
  t.assert.equal(res2.headers['content-type'], 'text/html; charset=utf-8')
  t.assert.match(res2.payload, /"url": "\/async\.json"/)
})

test('uses with hapi-swagger (swagger v2)', async (t) => {
  t.plan(4)
  const server = Hapi.server()
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: {
        info: {
          title: 'Scalar API Documentation',
          version: '1.0.0',
          description: 'API documentation for Scalar',
        },
      },
    },
    { plugin: hapiScalar, options: {} },
  ])

  const res = await server.inject({ method: 'GET', url: '/scalar' })

  t.assert.equal(res.statusCode, 200)
  t.assert.equal(res.headers['content-type'], 'text/html; charset=utf-8')
  t.assert.match(res.payload, /<title>Scalar API Reference<\/title>/)
  t.assert.match(res.payload, /"url": "\/swagger\.json"/)
})

test('uses with hapi-swagger (openapi)', async (t) => {
  t.plan(4)
  const server = Hapi.server()
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: {
        info: {
          title: 'Scalar API Documentation',
          version: '1.0.0',
          description: 'API documentation for Scalar',
        },
        OAS: 'v3.0',
      },
    },
    { plugin: hapiScalar, options: {} },
  ])

  const res = await server.inject({ method: 'GET', url: '/scalar' })

  t.assert.equal(res.statusCode, 200)
  t.assert.equal(res.headers['content-type'], 'text/html; charset=utf-8')
  t.assert.match(res.payload, /<title>Scalar API Reference<\/title>/)
  t.assert.match(res.payload, /"url": "\/openapi\.json"/)
})

test('uses with hapi-swagger has correct swagger endpoint', async (t) => {
  t.plan(3)
  const server = Hapi.server()
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: {
        info: {
          title: 'Scalar API Documentation',
          version: '1.0.0',
          description: 'API documentation for Scalar',
        },
        servers: [{ url: 'http://localhost:3000' }],
        OAS: 'v3.0',
      },
    },
    { plugin: hapiScalar, options: {} },
  ])

  const res = await server.inject({ method: 'GET', url: '/openapi.json' })

  t.assert.equal(res.statusCode, 200)
  t.assert.equal(res.headers['content-type'], 'application/json; charset=utf-8')
  t.assert.deepStrictEqual(JSON.parse(res.payload), {
    info: {
      title: 'Scalar API Documentation',
      version: '1.0.0',
      description: 'API documentation for Scalar',
    },
    servers: [{ url: 'http://localhost:3000' }],
    openapi: '3.0.0',
    components: { schemas: {} },
    tags: [],
    paths: {},
  })
})

test('normalizes routePrefix trailing slash and serves UI at trimmed path', async (t) => {
  t.plan(3)
  const server = Hapi.server()
  await server.register({
    plugin: hapiScalar,
    options: { routePrefix: '/docs/' },
  })

  const res = await server.inject({ method: 'GET', url: '/docs' })

  t.assert.equal(res.statusCode, 200)
  t.assert.equal(res.headers['content-type'], 'text/html; charset=utf-8')
  t.assert.match(res.payload, /<title>Scalar API Reference<\/title>/)
})

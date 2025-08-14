'use strict'

const test = require('node:test')
const Hapi = require('@hapi/hapi')
const hapiScalar = require('../lib/index.js')

test('plugin are registered (commonjs)', async (t) => {
  t.plan(1)
  const server = Hapi.server()

  await server.register(hapiScalar)

  t.assert.ok(server.registrations['hapi-scalar'])
})

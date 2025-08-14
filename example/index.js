import Hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import HapiSwagger from 'hapi-swagger'
import Joi from 'joi'
import hapiScalar from '../lib/index.js'

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  })

  /** @type {HapiSwagger.RegisterOptions} */
  const swaggerOptions = {
    info: {
      title: 'Scalar API Documentation',
      version: '1.0.0',
      description: 'API documentation for Scalar',
    },
    OAS: 'v3.0',
  }

  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ])

  await server.register({
    plugin: hapiScalar,
    options: {},
  })

  server.route({
    method: 'GET',
    path: '/users',
    options: {
      tags: ['api', 'users'],
      description: 'Get all users',
      notes: 'Returns a list of all users in the system',
      response: {
        schema: Joi.array()
          .items(
            Joi.object({
              id: Joi.number().integer().positive().description('User ID'),
              name: Joi.string().min(2).max(100).required().description('User full name'),
              email: Joi.string().email().required().description('User email address'),
              age: Joi.number().integer().min(1).max(120).required().description('User age'),
            }),
          )
          .description('Array of users'),
      },
    },
    handler: () => {
      return [
        { id: 1, name: 'John Doe', email: 'mHd8t@example.com', age: 30 },
        { id: 2, name: 'Jane Doe', email: 'mHd8t@example.com', age: 25 },
      ]
    },
  })

  server.route({
    method: 'POST',
    path: '/users',
    options: {
      tags: ['api', 'users'],
      description: 'Create a new user',
      notes: 'Creates a new user with the provided information',
      validate: {
        payload: Joi.object({
          name: Joi.string().min(2).max(100).required().description('User full name'),
          email: Joi.string().email().required().description('User email address'),
          age: Joi.number().integer().min(1).max(120).required().description('User age'),
        }),
      },
      response: {
        schema: Joi.object({
          success: Joi.boolean(),
          data: Joi.object({
            id: Joi.number().integer().positive().description('User ID'),
            name: Joi.string().min(2).max(100).required().description('User full name'),
            email: Joi.string().email().required().description('User email address'),
            age: Joi.number().integer().min(1).max(120).required().description('User age'),
          }),
          message: Joi.string().optional(),
        }),
      },
    },
    handler: (request) => {
      return {
        success: true,
        data: {
          id: 1,
          name: request.payload.name,
          email: request.payload.email,
          age: request.payload.age,
        },
      }
    },
  })

  await server.start()
  console.log('Server running on %s', server.info.uri)
  console.log('Visit http://localhost:3000/scalar for Scalar UI')
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()

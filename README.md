# hapi-scalar

A Hapi plugin to serve [Scalar](https://github.com/scalar/scalar) API documentation UI for your Hapi server. It can be used standalone or alongside [hapi-swagger](https://github.com/glennjones/hapi-swagger) to provide a modern, customizable OpenAPI/Swagger documentation experience.

## Features

- Serves Scalar UI at a configurable route (default: `/reference`)
- Supports static or dynamic configuration for Scalar UI
- Integrates with hapi-swagger to auto-detect and use your OpenAPI/Swagger JSON endpoint
- TypeScript support

## Installation

```bash
npm install hapi-scalar
```

> **Note:** You must also have `@hapi/hapi` installed. To use with hapi-swagger, install `hapi-swagger`, `@hapi/inert`, and `@hapi/vision` as well.

## Usage

### Basic Usage

```js
import Hapi from '@hapi/hapi'
import hapiScalar from 'hapi-scalar'

const server = Hapi.server({
  port: 3000,
  host: 'localhost',
})

await server.register({
  plugin: hapiScalar,
  options: {
    // Optional: see configuration below
  },
})

await server.start()
console.log('Server running on %s', server.info.uri)
```

Visit [http://localhost:3000/reference](http://localhost:3000/reference) to view the Scalar UI.

### With hapi-swagger

```js
import Hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import HapiSwagger from 'hapi-swagger'
import hapiScalar from 'hapi-scalar'

const swaggerOptions = {
  info: {
    title: 'API Documentation',
    version: '1.0.0',
  },
  OAS: 'v3.0', // or omit for Swagger v2
}

await server.register([
  Inert,
  Vision,
  { plugin: HapiSwagger, options: swaggerOptions },
])

await server.register({
  plugin: hapiScalar,
  options: {
    // Scalar will automatically use the correct OpenAPI/Swagger endpoint
  },
})
```

## Options

You can pass options when registering the plugin:

```js
await server.register({
  plugin: hapiScalar,
  options: {
    routePrefix: '/docs', // Change the route (default: '/reference')
    scalarConfig: {       // Pass Scalar UI config (see below)
      url: '/openapi.json',
      hideClientButton: true,
    },
  },
})
```

### `routePrefix`
- Type: `string` (default: `/reference`)
- The path where Scalar UI will be served.

### `scalarConfig`
- Type: `object | function(request) => object | Promise<object>`
- Configuration for Scalar UI. Can be a static object or a function that receives the Hapi request and returns (or resolves to) a config object.
- See [Scalar configuration docs](https://github.com/scalar/scalar/blob/main/documentation/configuration.md) for available options.

#### Example: Dynamic config

```js
options: {
  scalarConfig: (request) => {
    if (request.query.hide) {
      return { hideClientButton: true }
    }
    return {}
  }
}
```

## TypeScript

Type definitions are included. Example:

```ts
import Hapi from '@hapi/hapi'
import hapiScalar from 'hapi-scalar'

const options: hapiScalar.RegisterOptions = {
  routePrefix: '/reference',
  scalarConfig: {
    url: '/openapi.json',
    hideClientButton: true,
  },
}

await server.register({
  plugin: hapiScalar,
  options,
})
```

## License

MIT

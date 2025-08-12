# hapi-scalar

[![CI](https://github.com/inyourtime/hapi-scalar/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/inyourtime/hapi-scalar/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/hapi-scalar.svg?style=flat)](https://www.npmjs.com/package/hapi-scalar)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](./LICENSE)

A Hapi plugin that serves [Scalar](https://github.com/scalar/scalar) API documentation UI for your Hapi server. It provides a modern, interactive OpenAPI/Swagger documentation interface that can be used standalone or alongside [hapi-swagger](https://github.com/glennjones/hapi-swagger).

## Features

- Serves beautiful Scalar UI at a configurable route (default: `/reference`)
- Auto-detects and integrates with hapi-swagger configurations
- Supports both static and dynamic configuration
- TypeScript support

## Installation

```bash
npm install hapi-scalar
```

## Quick Start

### Standalone Usage

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
    scalarConfig: {
      url: '/path/to/your/openapi.json', // Your OpenAPI spec URL
    },
  },
})

await server.start()
console.log('Documentation available at: http://localhost:3000/reference')
```

Visit [http://localhost:3000/reference](http://localhost:3000/reference) to view the Scalar UI.

### With hapi-swagger (Recommended)

When used with hapi-swagger, the plugin automatically detects your OpenAPI/Swagger configuration:

```js
import Hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import HapiSwagger from 'hapi-swagger'
import hapiScalar from 'hapi-scalar'

const server = Hapi.server({
  port: 3000,
  host: 'localhost',
})

// Configure hapi-swagger
const swaggerOptions = {
  info: {
    title: 'My API Documentation',
    version: '1.0.0',
    description: 'This is my awesome API',
  },
  OAS: 'v3.0', // Use OpenAPI 3.0 (recommended)
}

// Register dependencies and hapi-swagger
await server.register([
  Inert,
  Vision,
  { plugin: HapiSwagger, options: swaggerOptions },
])

// Register hapi-scalar - it will automatically use the OpenAPI spec from hapi-swagger
await server.register({
  plugin: hapiScalar,
  options: {
    // Optional: customize the documentation route
    routePrefix: '/docs',
    // Optional: customize Scalar UI
    scalarConfig: {
      hideClientButton: false,
      theme: 'purple',
    },
  },
})

await server.start()
console.log('API Documentation available at: http://localhost:3000/docs')
```

> Note: When hapi-swagger is registered, hapi-scalar automatically uses `/openapi.json` if `OAS` is `'v3.0'`, otherwise `/swagger.json`. You don’t need to set `scalarConfig.url` manually.

## Configuration Options

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `routePrefix` | `string` | `'/reference'` | The path where the Scalar documentation UI will be served. |
| `scalarConfig` | `object \| function(request) => object \| Promise<object>` | `{}` | Configuration passed to the Scalar UI. Can be a static object or a dynamic function that receives the Hapi request. |

**Example:**

```js
await server.register({
  plugin: hapiScalar,
  options: {
    routePrefix: '/docs',           // → http://localhost:3000/docs
    scalarConfig: { /* ... */ },    // Scalar UI configuration
  },
})
```

The `scalarConfig` object supports all [Scalar configuration options](https://github.com/scalar/scalar/blob/main/documentation/configuration.md).

### Dynamic Configuration

Use a function to provide dynamic configuration based on the request:

```js
options: {
  scalarConfig: (request) => {
    // Example: Different themes for different users
    const userAgent = request.headers['user-agent']
    if (userAgent?.includes('Mobile')) {
      return { 
        theme: 'purple',
        hideClientButton: true  // Hide on mobile
      }
    }
    
    // Example: Environment-based configuration
    if (process.env.NODE_ENV === 'development') {
      return {
        theme: 'alternate',
        hideDownloadButton: false
      }
    }
    
    return { theme: 'default' }
  }
}

// You can also return a Promise or use an async function:
options: {
  scalarConfig: async (request) => {
    // e.g., fetch from a database or remote config service
    const url = request.query.specUrl || '/openapi.json'
    return { url }
  },
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

## Contributing

Contributions are welcome. Please open an issue or pull request.

## License

MIT

---

## Related Projects

- [Scalar](https://github.com/scalar/scalar) - The beautiful API documentation UI
- [hapi-swagger](https://github.com/glennjones/hapi-swagger) - Swagger/OpenAPI plugin for Hapi
- [@hapi/hapi](https://github.com/hapijs/hapi) - The Hapi web framework

import { getHtmlDocument } from '@scalar/core/libs/html-rendering'

/**
 * @typedef {import('@scalar/core/libs/html-rendering').HtmlRenderingConfiguration} HtmlRenderingConfiguration
 */

/**
 * Get the route prefix for the Scalar API documentation.
 * If no prefix is provided, it defaults to '/scalar'.
 * The prefix is sanitized to ensure it does not end with a slash.
 *
 * @param {string | undefined} prefix
 * @returns {string}
 */
const getRoutePrefix = (prefix) => (prefix ?? '/scalar').replace(/\/$/, '')

/**
 * @param {import('@hapi/hapi').Server} server
 * @param {import('.').default.RegisterOptions} options
 */
const hapiScalar = async (server, options) => {
  const hasHapiSwagger = !!server.registrations['hapi-swagger']

  // This path are registered by hapi-swagger
  // if options.OAS is set to 'v3.0', the path will be '/openapi.json'
  // otherwise, it will be '/swagger.json'
  const jsonPath =
    server.registrations['hapi-swagger']?.options?.OAS === 'v3.0'
      ? '/openapi.json'
      : '/swagger.json'

  /** @type {Partial<HtmlRenderingConfiguration>} */
  const defaultScalarConfig = {
    url: hasHapiSwagger ? jsonPath : undefined,
  }

  server.route({
    method: 'GET',
    path: getRoutePrefix(options.routePrefix),
    handler: async (request, h) => {
      const resolveConfig = async () => {
        const { scalarConfig = {} } = options
        if (typeof scalarConfig === 'function') {
          const ret = scalarConfig(request)
          return typeof ret?.then === 'function' ? await ret : ret
        }

        return scalarConfig
      }

      const scalarConfig = await resolveConfig()

      const html = getHtmlDocument({
        ...defaultScalarConfig,
        ...scalarConfig,
      })

      return h.response(html).type('text/html; charset=utf-8')
    },
  })
}

const plugin = {
  name: 'hapi-scalar',
  register: hapiScalar,
}

export { plugin }
export default plugin

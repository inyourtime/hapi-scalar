import type { Plugin, Request } from '@hapi/hapi'
import type { HtmlRenderingConfiguration } from '@scalar/core/libs/html-rendering'

declare namespace hapiScalar {
  export interface RegisterOptions {
    /**
     * The path that Scalar will be served from.
     *
     * @default '/reference'
     */
    routePrefix?: `/${string}`
    /**
     * The configuration for the HTML rendering of Scalar.
     * This can be a static configuration object or a function that returns a configuration object.
     * The function will receive the Hapi request object and can return a configuration object or a
     * Promise that resolves to a configuration object.
     *
     * @see {@link https://github.com/scalar/scalar/blob/main/documentation/configuration.md}
     */
    scalarConfig?:
      | Partial<HtmlRenderingConfiguration>
      | ((
          request: Request,
        ) => Partial<HtmlRenderingConfiguration> | Promise<Partial<HtmlRenderingConfiguration>>)
  }
}

declare const hapiScalar: {
  plugin: Plugin<hapiScalar.RegisterOptions>
}

export { hapiScalar }
export default hapiScalar

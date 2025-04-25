const nextConfig = {
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })
    if (!isServer) {
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      }
    }

    return config
  },
  transpilePackages: [
    '@geoarrow/deck.gl-layers',
    '@geoarrow/geoparquet-wasm',
    '@geoarrow/geoarrow-js',
  ],
}

module.exports = nextConfig

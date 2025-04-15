const nextConfig = {
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    return config
  },
  transpilePackages: [
    '@geoarrow/deck.gl-layers',
    '@geoarrow/geoparquet-wasm',
    '@geoarrow/geoarrow-js',
  ],
}

module.exports = nextConfig

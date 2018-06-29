const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  configureWebpack: _ => {
    if (process.env.NODE_ENV !== 'production') {
      return {
        plugins: [
          new BundleAnalyzerPlugin()
        ]
      }
    }
  }
}

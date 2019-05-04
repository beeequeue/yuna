/**
 * @type { ProjectOptions }
 */
module.exports = {
  css: {
    sourceMap: true,
  },
  configureWebpack: {
    target: 'electron-renderer',
  },
  lintOnSave: false,
  chainWebpack: config => {
    const svgRules = config.module.rule('svg')

    svgRules.uses.clear()

    svgRules.use('raw-loader').loader('raw-loader')

    // Define
    config.plugin('define').tap(([args]) => {
      const options = { ...args }

      options['process.env'].FLUENTFFMPEG_COV = false

      return [options]
    })
  },
}

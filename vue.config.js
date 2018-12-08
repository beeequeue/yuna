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
  },
}

module.exports = {
  css: {
    sourceMap: true,
  },
  configureWebpack: {
    target: process.env.IS_ELECTRON ? 'electron-renderer' : 'web',
  },
  lintOnSave: false,
  chainWebpack: config => {
    const svgRules = config.module.rule('svg')

    svgRules.uses.clear()

    svgRules
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .tap(() => {
        return {
          svgo: {
            plugins: [{ removeDoctype: true }, { removeComments: true }],
          },
        }
      })

    config.plugin('define').tap(() => [
      {
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          BASE_URL: '"/"',
          ACCESS_TOKEN: JSON.stringify(process.env.ACCESS_TOKEN),
          IS_ELECTRON: JSON.stringify(process.env.IS_ELECTRON || false),
        },
        'global.GENTLY': false,
      },
    ])
  },
}

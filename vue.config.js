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
          ACCESS_TOKEN: JSON.stringify(process.env.ACCESS_TOKEN),
          ANILIST_ID: JSON.stringify(process.env.ANILIST_ID),
          IS_ELECTRON: JSON.stringify(true),
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        },
        'global.GENTLY': false,
      },
    ])
  },
}

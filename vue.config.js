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
      .use('raw-loader')
      .loader('raw-loader')

    config.plugin('define').tap(() => [
      {
        'process.env': {
          ACCESS_TOKEN: JSON.stringify(process.env.ACCESS_TOKEN),
          ANILIST_ID: JSON.stringify(process.env.ANILIST_ID),
          GA_ID: JSON.stringify(process.env.GA_ID),
          IS_ELECTRON: JSON.stringify(true),
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        },
        'global.GENTLY': false,
      },
    ])
  },
}

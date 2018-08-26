const webpack = require('webpack')

module.exports = {
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
        const options = {
          svgo: {
            plugins: [{ removeDoctype: true }, { removeComments: true }],
          },
        }

        return options
      })

    config.plugin('define').tap(() => [
      {
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          BASE_URL: '"/"',
          ACCESS_TOKEN: JSON.stringify(process.env.ACCESS_TOKEN),
        },
        'global.GENTLY': false,
      },
    ])
  },
}

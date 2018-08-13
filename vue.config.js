const webpack = require('webpack')

module.exports = {
  lintOnSave: false,
  // configureWebpack: {
  //   plugins: [
  //     new webpack.DefinePlugin({
  //       'process.env': {
  //         ACCESS_TOKEN: process.env.ACCESS_TOKEN,
  //       },
  //     }),
  //   ],
  // },
  chainWebpack: config => {
    config.plugin('define').tap(args => [{
      'process.env': {
        NODE_ENV: '"development"',
        BASE_URL: '"/"',
        ACCESS_TOKEN: JSON.stringify(process.env.ACCESS_TOKEN)
      },
    }])
  },
}

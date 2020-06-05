/* eslint-disable no-console */
const { resolve } = require('path')
const { spawnSync } = require('child_process')
const SentryCliPlugin = require('@sentry/webpack-plugin')

const GIT_TAG = spawnSync('git', ['tag', '-l', '--points-at', 'HEAD'])
  .output.filter(b => b && b.length > 0)
  .map(buffer => buffer.toString().trim())[0]

console.log(`GIT_TAG=${GIT_TAG}`)
console.log(`NODE_ENV=${process.env.NODE_ENV}`)

/**
 * @type { ProjectOptions }
 */
module.exports = {
  css: {
    sourceMap: true,
  },
  configureWebpack: config => {
    config.target = 'electron-renderer'

    if (process.env.NODE_ENV === 'development') {
      config.devtool = 'eval-source-map'

      config.output.devtoolModuleFilenameTemplate = info =>
        info.resourcePath.match(/\.vue$/) &&
        !info.identifier.match(/type=script/) // this is change ✨
          ? `webpack-generated:///${info.resourcePath}?${info.hash}`
          : `webpack:///${info.resourcePath}`

      config.output.devtoolFallbackModuleFilenameTemplate =
        'webpack:///[resource-path]?[hash]'
    }
  },
  lintOnSave: false,
  /**
   * @param config { import("webpack-chain").Config }
   */
  chainWebpack: config => {
    // prettier-ignore
    config.output
      .filename('js/[name].js')
      .chunkFilename('js/[name].js')

    config.resolve.extensions.add('.node')

    const svgRules = config.module.rule('svg')
    svgRules.uses.clear()
    svgRules.use('raw-loader').loader('raw-loader')

    config.module
      .rule('native')
      .test(/\.node$/)
      .use('node-loader')
      .loader('node-loader')

    // Define
    config.plugin('define').tap(([args]) => {
      const options = { ...args }

      options['process.env'].FLUENTFFMPEG_COV = false

      if (process.env.NODE_ENV === 'development') {
        options['process.env'].DEV_BASE_PATH = JSON.stringify(__dirname)
      }

      return [options]
    })

    // Sentry Source Maps
    config.when(
      process.env.CI &&
        process.env.NODE_ENV === 'production' &&
        GIT_TAG != null,
      config => {
        config
          .plugin('sentry')
          .use(SentryCliPlugin, [
            {
              release: GIT_TAG,
              include: resolve(__dirname, 'dist_electron', 'bundled'),
              ignore: ['node_modules', 'css'],
              // silent: true,
              urlPrefix: 'app://./',
            },
          ])
          .after('fork-ts-checker')
      },
    )
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      chainWebpackMainProcess: config => {
        config.resolve.alias.set('@', resolve(__dirname, 'src'))
      },
    },
  },
}

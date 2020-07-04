const { process } = require('vue-jest')

module.exports = {
  process(src, ...rest) {
    // @testing-library/vue fails to add $store to root. :(
    if (src.includes('root.$store')) {
      src = src.replace(
        /root\.\$store/gm,
        'root._vnode.componentInstance.$store',
      )
    }

    return process(src, ...rest)
  },
}

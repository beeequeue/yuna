import Vue from 'vue'
import Tooltip from 'v-tooltip'

import App from './App.vue'
import { router } from './router'
import { store } from './state/store'
import { createProvider } from './vue-apollo'

import 'normalize.css'

Vue.config.productionTip = false

Vue.use(Tooltip)

new Vue({
  router,
  store,
  apolloProvider: createProvider(),
  render: h => h(App),
}).$mount('#app')

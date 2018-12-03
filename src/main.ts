import { shell } from 'electron'
import Tooltip from 'v-tooltip'
import Vue from 'vue'
import { init, Integrations } from '@sentry/browser'

import App from './App.vue'
import { router } from './router'
import { store } from './state/store'
import { createProvider } from './vue-apollo'
import { version } from '../package.json'

import 'normalize.css'

Vue.config.productionTip = false

Vue.use(Tooltip)

// Handle outside links
document.addEventListener('click', event => {
  // Did we click a link? Find one in hierarchy
  const linkElement = (event as any).path.find(
    (el: HTMLElement) => el.tagName === 'A',
  )

  // If there is one, check that the link isn't to our own app
  if (linkElement != null && linkElement.host !== window.location.host) {
    event.preventDefault()
    return shell.openExternal(linkElement.href)
  }
})

new Vue({
  router,
  store,
  apolloProvider: createProvider(),
  render: h => h(App),
}).$mount('#app')

init({
  enabled: process.env.NODE_ENV === 'production',
  dsn: 'https://cd3bdb81216e42018409783fedc64b7d@sentry.io/1336205',
  integrations: [new Integrations.Vue({ Vue })],
  environment: process.env.NODE_ENV,
  release: `yuna-v${version}`,
})

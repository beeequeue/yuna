import { shell } from 'electron'
import Tooltip from 'v-tooltip'
import Vue from 'vue'
import { init, Integrations, SentryEvent } from '@sentry/browser'
import { SentryException } from '@sentry/types'

import App from './App.vue'
import { router } from './router'
import { store } from './state/store'
import { createProvider } from './vue-apollo'
import { version } from '../package.json'

import 'normalize.css'

// Vue config
Vue.config.productionTip = false
Vue.use(Tooltip)

// Register services

// Sentry
const scrubExceptionValues = (
  exceptions?: SentryException[],
): SentryException[] | undefined =>
  exceptions &&
  exceptions.map(e => ({
    ...e,
    stacktrace: {
      frames:
        e.stacktrace &&
        e.stacktrace.frames &&
        e.stacktrace.frames.map(frame => ({
          ...frame,
          filename: '[scrubbed]',
        })),
    },
  }))

const scrubUrl = (event: SentryEvent): SentryEvent => ({
  ...event,
  exception: {
    ...event.exception,
    values: scrubExceptionValues(event.exception && event.exception.values),
  },
  request: {
    ...event.request,
    url: 'app.yuna.moe',
  },
})

init({
  // enabled: process.env.NODE_ENV === 'production',
  dsn: 'https://cd3bdb81216e42018409783fedc64b7d@sentry.io/1336205',
  integrations: [new Integrations.Vue({ Vue })],
  environment: process.env.NODE_ENV,
  release: `yuna-v${version}`,
  beforeSend: scrubUrl,
})

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

import { shell } from "electron"
import Vue from "vue"
import Vuex, { Store } from "vuex"
import { ObserveVisibility } from "vue-observe-visibility"
import Tooltip from "v-tooltip"
import Portal from "portal-vue"
import VueComposition, { provide } from "@vue/composition-api"
import { DefaultApolloClient } from "@vue/apollo-composable"
import ApolloOption from "@vue/apollo-option"
import { init, setExtra } from "@sentry/vue"
import { Integrations } from "@sentry/tracing"

import { initFathom } from "@/lib/fathom"
import { updateRelations } from "@/lib/relations"
import { LocalStorageKey } from "@/lib/local-storage"
import { getIsConnectedTo } from "@/state/auth"
import { getMainListPlugin } from "@/state/settings"
import { getQueue } from "@/state/user"

import App from "./App.vue"
import { router } from "./router"
import { storeOptions } from "./state/store"
import { createProvider } from "./vue-apollo"
import { normalizeEvent } from "./normalize"
import pkgJson from "../package.json"

// https://github.com/Akryum/vue-cli-plugin-apollo/issues/355
import "regenerator-runtime/runtime"

import "normalize.css"
import "vue-virtual-scroller/dist/vue-virtual-scroller.css"

// Left-over from when I blocked fathom in development but it didn't work in prod
// This is making sure that it's always unblocked
localStorage.removeItem(LocalStorageKey.BlockFathom)

if (process.env.NODE_ENV === "production") {
  initFathom(pkgJson.version)
}

// Vue config
Vue.config.productionTip = false
Vue.use(Vuex)
Vue.use(Tooltip)
Vue.use(Portal)
Vue.use(VueComposition)
Vue.use(ApolloOption)
Vue.directive("visibility", ObserveVisibility)

// Create store
const store = new Store(storeOptions)

// Register services

// Sentry
init({
  Vue,
  dsn: "https://cd3bdb81216e42018409783fedc64b7d@sentry.io/1336205",
  enabled: process.env.NODE_ENV === "production",
  environment: process.env.NODE_ENV,
  release: `v${pkgJson.version}`,
  sampleRate: 0.75,
  attachProps: true,
  tracingOptions: { trackComponents: true },
  ignoreErrors: [
    /Request has been terminated/,
    /Failed to fetch/,
    /ENOENT/,
    /EPERM/,
    /'TimeRanges': The index provided/,
    /Unauthenticated request/,
  ],
  integrations: [new Integrations.BrowserTracing()],
  beforeSend: (event) => {
    const connectedTo = getIsConnectedTo(store)
    Object.entries(connectedTo).forEach(([service, connected]) =>
      setExtra(`connected.${service}`, connected),
    )

    setExtra("list-manager", getMainListPlugin(store))
    setExtra(
      "queue",
      getQueue(store).map((item) => `${item.id}:${item.provider}`),
    )

    return normalizeEvent(event)
  },
})

// Handle outside links
document.addEventListener("click", (event) => {
  // Did we click a link? Find one in hierarchy
  const linkElement = (event as any).path.find((el: HTMLElement) => el.tagName === "A")

  // If there is one, check that the link isn't to our own app
  if (linkElement != null && linkElement.host !== window.location.host) {
    event.preventDefault()
    return shell.openExternal(linkElement.href)
  }
})

// Fetch relation data
updateRelations()

const apolloProvider = createProvider(store)

new Vue({
  router,
  store,
  apolloProvider,
  setup() {
    provide(DefaultApolloClient, apolloProvider.defaultClient)

    return {}
  },
  render: (h) => h(App),
}).$mount("#app")

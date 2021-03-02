import Vue from "vue"
import Vuex from "vuex"
import Router from "vue-router"
import Composition from "@vue/composition-api"
import Tooltip from "v-tooltip"
import "@testing-library/jest-dom"

import "./src/testing/mock-electron"
import "./src/testing/mock-store"

Vue.use(Vuex)
Vue.use(Router)
Vue.use(Composition)
Vue.use(Tooltip)

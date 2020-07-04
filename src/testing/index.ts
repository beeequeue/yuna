import Vue from 'vue'
import { StoreOptions } from 'vuex'
import Router from 'vue-router'
import deepmerge from 'deepmerge'

import { VueClass } from '@vue/test-utils'
import { render as originalRender } from '@testing-library/vue'

import { DeepPartial } from '@/types'
import { RootState, storeOptions } from '@/state/store'

export const render = <P extends Record<string, unknown>>(
  component: VueClass<Vue>,
  props: P = {} as P,
  customStore: DeepPartial<StoreOptions<RootState>> = {},
) =>
  originalRender(component, {
    props,
    store: deepmerge(storeOptions, customStore),
    router: new Router(),
  })

export const mockLocaleStorage = (mock: Record<string, any>) => {
  for (const key in mock) {
    if (mock.hasOwnProperty(key)) {
      localStorage.__STORE__[key] = mock[key]
    }
  }
}

/* eslint-disable @typescript-eslint/consistent-type-definitions */
import Vue, { VNode } from 'vue'
import { DataProxy } from 'apollo-cache'
import { ListPlugin } from '@/plugins/list/plugin'

declare global {
  namespace JSX {
    type Element = {} & VNode
    type ElementClass = {} & Vue
    type IntrinsicElements = {
      [elem: string]: any
    }
  }

  interface RealProxy extends DataProxy {
    data: {
      data: {
        [key: string]:
          | undefined
          | {
              __typename: string
              [key: string]: any | undefined
            }
      }
    }
  }

  interface Window {
    listPlugins: ListPlugin[]
  }
}

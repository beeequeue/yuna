import Vue, { VNode } from 'vue'
import { DataProxy } from 'apollo-cache'
import { ListPlugin } from '@/plugins/list/plugin'

declare global {
  namespace JSX {
    // eslint-disable no-empty-interface
    type Element = {} & VNode
    // eslint-disable no-empty-interface
    type ElementClass = {} & Vue
    type IntrinsicElements = {
      [elem: string]: any
    }
  }

  type RealProxy = {
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
  } & DataProxy

  type Window = {
    listPlugins: ListPlugin[]
  }
}

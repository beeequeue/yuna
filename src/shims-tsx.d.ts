import Vue, { VNode } from 'vue'
import { DataProxy } from 'apollo-cache'
import { ListPlugin } from '@/plugins/list/plugin'

declare global {
  namespace JSX {
    // eslint-disable no-empty-interface
    interface Element extends VNode {}
    // eslint-disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
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

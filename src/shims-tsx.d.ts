import Vue, { VNode } from 'vue'

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
}

import { ApolloError } from 'apollo-client'
import { Vue } from 'vue/types/vue'
import { ComponentOptions, Prop } from 'vue/types/options'
import { VueApolloQueryDefinition } from 'vue-apollo/types/options'
import { createDecorator, VueDecorator } from 'vue-class-component'

import { LIST_LIST_ENTRIES } from '@/graphql/documents/queries'
import {
  ListViewQuery,
  ListViewQueryVariables,
  MediaListStatus,
} from '@/graphql/types'
import List from '@/views/list/list.vue'

interface QueryOptions<C extends Vue, R = any>
  extends VueApolloQueryDefinition<C, R> {
  update?: (this: C, data: R) => void
  skip?: (this: C) => boolean
  result?: (this: C) => void
  error?: (this: C, error: Error | ApolloError | string) => void
}

interface QueryOptionsWithVariables<
  C extends Vue,
  R = any,
  V = undefined | null
> extends QueryOptions<C, R> {
  variables: ((this: C) => V) | V
}

/**
 * An Apollo Query
 * @param options VueApolloQueryOptions
 * @return PropertyDecorator | void
 */
export function Query<C extends Vue, R = any, V extends {} | null = null>(
  options: V extends null
    ? QueryOptions<C, R>
    : QueryOptionsWithVariables<C, R, V>,
): VueDecorator {
  return createDecorator((componentOptions, key) => {
    if (!componentOptions.apollo) {
      componentOptions.apollo = {}
    }

    ;(componentOptions.apollo as any)[key] = {
      update: (data: any) =>
        Object.keys(data).includes(key) ? data[key] : data,
      ...options,
    }
  })
}

export function ListQuery(
  status: MediaListStatus,
  rows = 1,
): PropertyDecorator {
  return createDecorator((componentOptions: ComponentOptions<List>) => {
    if (!componentOptions.apollo) {
      componentOptions.apollo = {}
    }

    ;(componentOptions.apollo as any)[status.toLowerCase()] = {
      query: LIST_LIST_ENTRIES,
      variables(): ListViewQueryVariables {
        return {
          page: 1,
          perPage: 10 * rows,
          status,
        }
      },
      update(data: ListViewQuery) {
        this.getMedia(data.ListEntries.map(e => e.mediaId))

        return data
      },
    }
  }) as any
}

export function Required(type: Prop<any>): VueDecorator {
  return createDecorator((componentOptions, key) => {
    if (!componentOptions.props) {
      componentOptions.props = {}
    }

    ;(componentOptions.props as any)[key] = {
      type,
      required: true,
    }
  })
}

type Constructor =
  | NumberConstructor
  | StringConstructor
  | ArrayConstructor
  | BooleanConstructor
export function Default<T extends Constructor | ObjectConstructor>(
  type: T,
  defaultValue: ReturnType<T> extends Array<any>
    ? () => ReturnType<T>
    : ReturnType<T>,
): VueDecorator {
  return createDecorator((componentOptions, key) => {
    if (!componentOptions.props) {
      componentOptions.props = {}
    }

    ;(componentOptions.props as any)[key] = {
      type,
      required: false,
      default: defaultValue,
    }

    // If the default value is an array or function it has to be a factory function
    if (Array.isArray(defaultValue) || typeof defaultValue === 'object') {
      ;(componentOptions.props as any)[key].default = () => defaultValue
    }
  })
}

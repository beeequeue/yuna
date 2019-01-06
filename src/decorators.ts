import { Vue } from 'vue/types/vue'
import {
  ApolloVueThisType,
  VueApolloQueryOptions,
} from 'vue-apollo/types/options'
import { createDecorator } from 'vue-class-component'
import { DocumentNode } from 'graphql'

interface QueryOptions<C extends Vue, R = any, V = any>
  extends VueApolloQueryOptions<C, R> {
  variables: ((this: ApolloVueThisType<V>) => V) | V
}

/**
 * An Apollo Query
 * @param options VueApolloQueryOptions
 * @return PropertyDecorator | void
 */
export function Query<C extends Vue, R = any, V = any>(
  options: QueryOptions<C, R, V> | DocumentNode,
): PropertyDecorator {
  return createDecorator((componentOptions, key) => {
    if (!componentOptions.apollo) {
      componentOptions.apollo = {}
    }

    ;(componentOptions.apollo as any)[key] = {
      update: (data: any) => data,
      ...options,
    }
  }) as any
}

import { DollarApollo } from 'vue-apollo/types/vue-apollo'

import SEARCH_QUERY from './SearchQuery.graphql'
import { SearchQuery } from './SearchQuery'

export const searchQuery = (apollo: DollarApollo<any>, search: string) =>
  apollo.query<SearchQuery>({
    query: SEARCH_QUERY,
    variables: { search },
  })

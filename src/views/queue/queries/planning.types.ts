/* THIS IS A GENERATED FILE */
/* prettier-ignore-start */
/* eslint-disable */
import * as Types from '../../../graphql/types'

export type PlanningQueryQueryVariables = {
  userId: Types.Scalars['Int']
}

export type PlanningQueryQuery = { __typename?: 'Query' } & {
  listCollection: Types.Maybe<
    { __typename?: 'MediaListCollection' } & {
      lists: Types.Maybe<
        Array<
          Types.Maybe<
            { __typename?: 'MediaListGroup' } & Pick<
              Types.MediaListGroup,
              'isCustomList'
            > & {
                entries: Types.Maybe<
                  Array<
                    Types.Maybe<
                      { __typename?: 'MediaList' } & {
                        info: Types.Maybe<
                          { __typename?: 'Media' } & Pick<Types.Media, 'id'> & {
                              externalLinks: Types.Maybe<
                                Array<
                                  Types.Maybe<
                                    { __typename?: 'MediaExternalLink' } & Pick<
                                      Types.MediaExternalLink,
                                      'id' | 'site' | 'url'
                                    >
                                  >
                                >
                              >
                              mediaListEntry: Types.Maybe<
                                { __typename?: 'MediaList' } & Pick<
                                  Types.MediaList,
                                  'id' | 'status'
                                >
                              >
                            }
                        >
                      }
                    >
                  >
                >
              }
          >
        >
      >
    }
  >
}

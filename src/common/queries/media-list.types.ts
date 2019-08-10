/* THIS IS A GENERATED FILE */
/* prettier-ignore-start */
/* eslint-disable */
import * as Types from '../../graphql/types'

export type MediaListQueryVariables = {
  id: Types.Scalars['Int']
}

export type MediaListQuery = { __typename?: 'Query' } & {
  mediaListEntry: Types.Maybe<
    { __typename?: 'MediaList' } & Pick<
      Types.MediaList,
      'id' | 'status' | 'progress' | 'score' | 'repeat'
    > & {
        anime: Types.Maybe<
          { __typename?: 'Media' } & Pick<
            Types.Media,
            'id' | 'isFavourite' | 'episodes'
          > & {
              title: Types.Maybe<
                { __typename?: 'MediaTitle' } & Pick<
                  Types.MediaTitle,
                  'userPreferred' | 'english' | 'romaji' | 'native'
                >
              >
              coverImage: Types.Maybe<
                { __typename?: 'MediaCoverImage' } & Pick<
                  Types.MediaCoverImage,
                  'medium' | 'color'
                >
              >
            }
        >
      }
  >
}

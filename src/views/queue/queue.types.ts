/* THIS IS A GENERATED FILE */
/* prettier-ignore-start */
/* eslint-disable */
import * as Types from '../../graphql/types'

export type QueueQueryVariables = {
  ids: Array<Types.Scalars['Int']>
}

export type QueueQuery = { __typename?: 'Query' } & {
  queue: Types.Maybe<
    { __typename?: 'Page' } & {
      anime: Types.Maybe<
        Array<
          Types.Maybe<
            { __typename?: 'Media' } & Pick<
              Types.Media,
              'id' | 'idMal' | 'episodes' | 'status' | 'siteUrl' | 'bannerImage'
            > & {
                title: Types.Maybe<
                  { __typename?: 'MediaTitle' } & Pick<
                    Types.MediaTitle,
                    'userPreferred'
                  >
                >
                nextAiringEpisode: Types.Maybe<
                  { __typename?: 'AiringSchedule' } & Pick<
                    Types.AiringSchedule,
                    'airingAt' | 'timeUntilAiring' | 'episode'
                  >
                >
                externalLinks: Types.Maybe<
                  Array<
                    Types.Maybe<
                      { __typename?: 'MediaExternalLink' } & Pick<
                        Types.MediaExternalLink,
                        'site' | 'url'
                      >
                    >
                  >
                >
                mediaListEntry: Types.Maybe<
                  { __typename?: 'MediaList' } & Pick<
                    Types.MediaList,
                    'id' | 'progress' | 'status' | 'repeat' | 'score'
                  >
                >
              }
          >
        >
      >
    }
  >
}

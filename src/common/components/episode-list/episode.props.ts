import { Episode as IEpisode } from '@/graphql/generated/types'
import { ListEntry } from '@/state/app'

export type EpisodeProps = {
  episode: Pick<
    IEpisode,
    | 'animeId'
    | 'index'
    | 'provider'
    | 'episodeNumber'
    | 'thumbnail'
    | 'title'
    | 'isWatched'
  >
  listEntry: ListEntry | null
  scrollerValue: string | null
  small: boolean
}

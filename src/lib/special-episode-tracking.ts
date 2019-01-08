import Store from 'electron-store'

import { EpisodeListEpisodes } from '@/graphql/types'
import { Instance } from '@/types'
import { getEpisodeCacheKey } from '@/utils'

interface ISpecialEpisodeStore {
  [key: string]: number[]
}

const specialEpisodeStore = new Store<ISpecialEpisodeStore>({
  name: 'specials',
})

const saveToCache = <B extends boolean>(
  $apollo: Instance['$apollo'],
  episode: EpisodeListEpisodes,
  isWatched: B,
) => {
  $apollo.client.cache.writeData<EpisodeListEpisodes>({
    id: getEpisodeCacheKey(episode),
    data: {
      ...episode,
      isWatched,
    },
  })

  return isWatched
}

export class SpecialEpisodeStore {
  public static isWatched(episode: EpisodeListEpisodes): boolean {
    return specialEpisodeStore
      .get(episode.animeId.toString(), [])
      .includes(episode.id)
  }

  public static setWatched(
    { $apollo }: Instance,
    episode: EpisodeListEpisodes,
  ): true {
    const episodeIds = specialEpisodeStore.get(episode.animeId.toString(), [])

    if (episodeIds.includes(episode.id)) {
      return saveToCache($apollo, episode, true)
    }

    specialEpisodeStore.set(episode.animeId.toString(), [
      ...episodeIds,
      episode.id,
    ])

    return saveToCache($apollo, episode, true)
  }

  public static unwatch(
    { $apollo }: Instance,
    episode: EpisodeListEpisodes,
  ): false {
    const episodeIds = specialEpisodeStore.get(episode.animeId.toString(), [])

    if (!episodeIds.includes(episode.id)) {
      return saveToCache($apollo, episode, false)
    }

    specialEpisodeStore.set(
      episode.animeId.toString(),
      episodeIds.slice(episodeIds.indexOf(episode.id)),
    )

    return saveToCache($apollo, episode, false)
  }
}

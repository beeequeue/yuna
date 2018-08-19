// tslint:disable:no-use-before-declare
import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'
import { RootState } from '@/state/store'
import { fetchQueue } from '@/lib/crunchyroll'

export enum AnimeState {
  PLANNING,
  WATCHING,
  REWATCHING,
  COMPLETED,
}

export interface Anime {
  name: string
  romajiName?: string
  description: string
  episodes: number
  portraitImage: string
  landscapeImage: string

  user?: {
    state: AnimeState
  }

  crunchyroll?: {
    id: string
    url: string
  }
}

export interface Episode {
  name: string
  description: string
  index: number
  progress: number
  image: string

  crunchyroll?: {
    id: string
    url: string
    premiumOnly: boolean
  }
}

export interface QueueItem {
  episode: Episode
  series: Anime
}

export interface UserState {
  queue: QueueItem[]
}

type UserContext = ActionContext<UserState, RootState>

const initialState: UserState = {
  queue: [],
}

export const user = {
  state: { ...initialState },

  getters: {
    getQueue(state: UserState) {
      return state.queue
    },
  },

  mutations: {
    setQueue(state: UserState, queue: QueueItem[]) {
      state.queue = queue
    },
  },

  actions: {
    async updateQueue(context: UserContext) {
      const crQueue = await fetchQueue(context.rootState.auth.sessionId)

      const newQueue: QueueItem[] = crQueue.map(
        ({
          most_likely_media: nextEpisode,
          most_likely_media_playhead: playhead,
          series,
        }) => ({
          episode: {
            name: nextEpisode.name,
            description: nextEpisode.description,
            index: Number(nextEpisode.episode_number),
            image: nextEpisode.screenshot_image.full_url,
            progress: playhead,
            crunchyroll: {
              id: nextEpisode.media_id,
              url: nextEpisode.url,
              premiumOnly:
                !nextEpisode.free_available && nextEpisode.premium_available,
            },
          },
          series: {
            name: series.name,
            romajiName: series.name, // TODO: FIX
            description: series.description,
            episodes: 12, // TODO: FIX
            portraitImage: series.portrait_image.full_url,
            landscapeImage: series.landscape_image.full_url,
            user: {
              state: AnimeState.WATCHING,
            },
            crunchyroll: {
              id: series.series_id,
              url: series.url,
            },
          },
        }),
      )

      setQueue(context, newQueue)
    },
  },
}

const { read, commit, dispatch } = getStoreAccessors<UserState, RootState>('')

export const getQueue = read(user.getters.getQueue)

const setQueue = commit(user.mutations.setQueue)

export const updateQueue = dispatch(user.actions.updateQueue)

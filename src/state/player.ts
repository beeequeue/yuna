import { inject, InjectionKey, provide, reactive } from '@vue/composition-api'
import {
  Episode,
  Provider as StreamingProvider,
} from '@/graphql/generated/types'
import { pick } from '@/utils'

export type PlayerState = {
  playlist: Array<{
    animeId: number
    index: number
    provider: StreamingProvider
  }>
  current: number | null
}

export const PlayerSymbol: InjectionKey<PlayerState> = Symbol('playerState')

export const ProvidePlayer = () => {
  provide(
    PlayerSymbol,
    reactive({
      playlist: [],
      current: null,
    }),
  )
}

export const usePlayer = () => {
  const state = inject(PlayerSymbol)

  if (state == null) {
    throw new Error('Missing Player provider!')
  }

  return {
    // State
    playlist: state.playlist as Readonly<PlayerState['playlist']>,
    current: state.current,

    // Mutations
    setPlaylist: (
      episodes: Pick<Episode, 'animeId' | 'index' | 'provider'>[],
    ) => {
      state.playlist = episodes.map(ep =>
        pick(ep, ['animeId', 'index', 'provider']),
      )
    },

    traversePlaylist: (steps: number) => {
      if (
        state.current == null ||
        state.playlist[state.current + steps] == null
      ) {
        return
      }

      state.current += steps
    },

    goToInPlaylist: (index: number) => {
      if (state.playlist[index] == null) return

      state.current = index
    },
  } as const
}

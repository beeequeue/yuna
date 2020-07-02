import {
  computed,
  inject,
  InjectionKey,
  provide,
  reactive,
} from '@vue/composition-api'
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
  currentIndex: number | null
}

export const PlayerSymbol: InjectionKey<PlayerState> = Symbol('playerState')

export const ProvidePlayer = () => {
  provide(
    PlayerSymbol,
    reactive({
      playlist: [],
      currentIndex: null,
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
    playlist: computed(() => state.playlist),
    currentIndex: computed(() => state.currentIndex),
    current: computed<PlayerState['playlist'][number] | null>(
      () => state.playlist[state.currentIndex ?? -1] ?? null,
    ),

    // Mutations
    // TODO: add clear()
    setPlaylist: (
      episodes: null | Pick<Episode, 'animeId' | 'index' | 'provider'>[],
    ) => {
      if (episodes == null) {
        state.playlist = []
        state.currentIndex = null

        return
      }

      state.playlist = episodes.map(ep =>
        pick(ep, ['animeId', 'index', 'provider']),
      )
    },

    traversePlaylist: (steps: number) => {
      if (
        state.currentIndex == null ||
        state.playlist[state.currentIndex + steps] == null
      ) {
        return
      }

      state.currentIndex += steps
    },

    goToInPlaylist: (index: number) => {
      if (state.playlist[index] == null) return

      state.currentIndex = index
    },
  } as const
}

import Store from 'electron-store'
import { AnilistData } from '@/state/auth'

const CURRENT_VERSION = 1

interface CachedCRData {
  sessionId: string | null
  userId: string | null
  token: string | null
}

interface UserStore {
  __version: number
  queue: number[]
  crunchyroll: CachedCRData
  anilist: AnilistData
}

export const userStore = new Store<UserStore>({
  name: 'user',
})

// Ultra primitive migration
if (userStore.get('__version') !== CURRENT_VERSION) {
  userStore.clear()
  userStore.set('__version', CURRENT_VERSION)
}

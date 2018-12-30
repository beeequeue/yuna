import Store from 'electron-store'
import { AnilistData } from '@/state/auth'

const CURRENT_VERSION = 2

interface CachedCRData {
  sessionId: string | null
  userId: string | null
  token: string | null
}

export interface QueueItem {
  id: number
  open: boolean
}

interface UserStore {
  __version: number
  queue: QueueItem[]
  crunchyroll: CachedCRData
  anilist: AnilistData
}

export const userStore = new Store<UserStore>({
  name: 'user',
})

// Ultra primitive migration
const oldVersion = userStore.get('__version')

if (oldVersion !== CURRENT_VERSION) {
  if (oldVersion === 1) {
    userStore.set('anilist', null)
    userStore.set('__version', 2)
  } else {
    userStore.clear()
    userStore.set('__version', CURRENT_VERSION)
  }
}

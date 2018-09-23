import Store from 'electron-store'
import { AnilistData } from '@/state/auth'

export interface QueueItem {
  anilist: number
  nextEpisode: string | null
  crunchyroll: string | null
}

interface CachedCRData {
  sessionId: string | null
  token: string | null
}

interface UserStore {
  queue: QueueItem[]
  crunchyroll: CachedCRData
  anilist: AnilistData
}

export const userStore = new Store<UserStore>({
  name: 'user',
})

import Store from 'electron-store'
import { AnilistData } from '@/state/auth'

export interface QueueItem {
  nextEpisode: string | null
  crunchyroll: string | null
}

interface CachedCRData {
  username: string | null
  password: string | null
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
  encryptionKey: 'just_so_we_dont_store_the_password_in_plaintext',
})

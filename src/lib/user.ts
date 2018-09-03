import Store from 'electron-store'
import { CrunchyrollData } from '@/state/auth'

export interface QueueItem {
  crunchyroll?: string
}

interface UserStore {
  queue: string[]
  crunchyroll: CrunchyrollData
}

export const userStore = new Store<UserStore>({ name: 'user' })

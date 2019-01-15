import Store from 'electron-store'
import { AnilistData, CrunchyrollData } from '@/state/auth'

const CURRENT_VERSION = 3

export interface QueueItem {
  id: number
  open: boolean
}

interface UserStore {
  __version: number
  queue: QueueItem[]
  crunchyroll: Omit<CrunchyrollData, 'country'>
  anilist: AnilistData
}

export const userStore = new Store<UserStore>({
  name: process.env.NODE_ENV === 'development' ? 'user-d' : 'user',
})

// Ultra primitive migration
let oldVersion = userStore.get('__version', 0)

if (oldVersion !== CURRENT_VERSION) {
  if (oldVersion === 0) {
    userStore.clear()
    userStore.set('__version', CURRENT_VERSION)
    // Don't set oldVersion as we only want this migration to run here
  }

  if (oldVersion === 1) {
    userStore.set('anilist', null)
    userStore.set('__version', 2)
    oldVersion = 2
  }

  if (oldVersion === 2) {
    userStore.set('crunchyroll', null)
    userStore.set(
      'anilist.user.url',
      userStore.get('anilist.user.siteUrl', null),
    )
    userStore.delete('anilist.user.siteUrl')

    userStore.set('__version', 3)
    oldVersion = 3
  }
}

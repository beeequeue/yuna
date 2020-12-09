import Store from "electron-store"

import { Provider } from "@/graphql/generated/types"
// import { AnilistData, CrunchyrollData, HidiveData } from '@/state/auth'

const { NODE_ENV } = process.env
const CURRENT_VERSION = 4

export type QueueItem = {
  id: number
  open: boolean
  provider: Provider
}

// interface UserStore {
//   __version: number
//   queue: QueueItem[]
//   crunchyroll: Omit<CrunchyrollData, 'country'>
//   anilist: AnilistData
//   hidive: HidiveData
// }

export const userStore = new Store<any>({
  name: NODE_ENV === "development" ? "user-d" : "user",
  encryptionKey:
    NODE_ENV === "production"
      ? "not really secure but better than nothing?"
      : undefined,
})

// Ultra primitive migration
let oldVersion = userStore.get("__version", 0)

if (oldVersion !== CURRENT_VERSION) {
  if (oldVersion === 0) {
    userStore.clear()
    userStore.set("__version", CURRENT_VERSION)
    // Don't set oldVersion as we only want this migration to run here
  }

  if (oldVersion === 1) {
    userStore.set("anilist", null)
    userStore.set("__version", 2)
    oldVersion = 2
  }

  if (oldVersion === 2) {
    userStore.set("crunchyroll", null)
    userStore.set(
      "anilist.user.url",
      userStore.get("anilist.user.siteUrl", null),
    )
    userStore.delete("anilist.user.siteUrl")

    userStore.set("__version", 3)
    oldVersion = 3
  }

  if (oldVersion === 3) {
    const queue = userStore.get("queue", [])

    const newQueue = queue.map((item: QueueItem) => ({
      ...item,
      provider: Provider.Crunchyroll,
    }))
    userStore.set("queue", newQueue)

    userStore.set("__version", 4)
    oldVersion = 4
  }
}

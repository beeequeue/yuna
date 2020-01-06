import DiscordRPC, { Presence } from 'discord-rpc'
import { ipcMain } from 'electron'

import { SettingsStore } from '@/state/settings'
import { getConfig } from '@/config'
import {
  DISCORD_DISABLE_RICH_PRESENCE,
  DISCORD_ENABLE_RICH_PRESENCE,
  DISCORD_PAUSE_WATCHING,
  DISCORD_SET_WATCHING,
} from '@/messages'

type WatchingOptions = {
  animeName: string
  episode: number
  totalEpisodes: number
  progress: number
  username?: string
}

export enum ImageKeys {
  LOGO = 'logo',
  LOGO_PADDED = 'logo-padded',
  ANILIST = 'anilist',
  SIMKL = 'simkl',
}

const id = getConfig('DISCORD_ID')!
let discord!: Discord

const generateId = () => Math.round(Math.random() * 100 + 20)

class Discord {
  public disabled = false

  private discord: DiscordRPC.Client

  private errored = false
  private activityId: number = -1

  constructor() {
    this.discord = new DiscordRPC.Client({ transport: 'ipc' })

    this.discord.login({ clientId: id }).catch(() => {
      this.disabled = true
    })
  }

  public async setActivity(activity: Presence) {
    if (this.errored || this.disabled) return

    this.activityId = generateId()

    return this.discord.setActivity(activity, this.activityId)
  }

  public async setWatching({
    animeName,
    episode,
    totalEpisodes,
    progress,
    username,
  }: WatchingOptions) {
    const now = Math.round(Date.now() / 1000)
    const mainListPlugin = SettingsStore.get('mainListPlugin')
    const service = mainListPlugin === 'anilist' ? 'AniList' : 'Simkl'

    return this.setActivity({
      details: animeName,
      state: '    ', // The API requires at least three characters, but if this is null it doesn't show player counts.
      partySize: episode,
      partyMax: totalEpisodes,
      startTimestamp: now - progress,
      largeImageKey: ImageKeys.LOGO,
      smallImageKey:
        mainListPlugin === 'anilist' ? ImageKeys.ANILIST : ImageKeys.SIMKL,
      smallImageText: username ? `${username} on ${service}` : undefined,
    })
  }

  public async pauseWatching() {
    if (this.errored || this.disabled) return

    return this.discord.clearActivity()
  }

  public destroy() {
    this.discord.destroy()
  }
}

export const registerDiscord = () => {
  DiscordRPC.register(id)

  discord = new Discord()

  ipcMain.on(DISCORD_SET_WATCHING, (_: Event, data: WatchingOptions) => {
    discord.setWatching(data)
  })

  ipcMain.on(DISCORD_PAUSE_WATCHING, () => {
    discord.pauseWatching()
  })

  ipcMain.on(DISCORD_ENABLE_RICH_PRESENCE, () => {
    discord.disabled = false
  })

  ipcMain.on(DISCORD_DISABLE_RICH_PRESENCE, () => {
    discord.pauseWatching()
    discord.disabled = true
  })
}

export const destroyDiscord = () => {
  try {
    discord.destroy()
  } catch (e) {
    /* no-op */
  }
}

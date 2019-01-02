import DiscordRPC, { Presence } from 'discord-rpc'
import { ipcMain } from 'electron'
import { debug } from 'electron-log'

import { getConfig } from '../config'
import {
  DISCORD_DISABLE_RICH_PRESENCE,
  DISCORD_ENABLE_RICH_PRESENCE,
  DISCORD_PAUSE_WATCHING,
  DISCORD_SET_WATCHING,
} from '../messages'

interface WatchingOptions {
  animeName: string
  episode: number
  totalEpisodes: number
  progress: number
}

export enum IMAGE_KEYS {
  LOGO = 'logo',
  LOGO_PADDED = 'logo-padded',
}

const id = getConfig('DISCORD_ID')
let discord!: Discord

const generateId = () => Math.round(Math.random() * 100 + 20)

class Discord {
  public disabled = false

  private discord!: DiscordRPC.Client

  private errored = false
  private activityId: number = -1

  constructor() {
    this.discord = new DiscordRPC.Client({ transport: 'ipc' })

    this.discord.on('ready', () => {
      debug(
        `[Discord] Finished initializing: ${
          this.errored ? 'Failed' : 'Successful'
        }`,
      )
    })

    this.discord.login({ clientId: id }).catch(() => {
      debug(`[Discord] Init failed.`)

      this.errored = true
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
  }: WatchingOptions) {
    const now = Math.round(Date.now() / 1000)

    return this.setActivity({
      details: `Watching ${animeName}`,
      state: '    ',
      partySize: episode,
      partyMax: totalEpisodes,
      startTimestamp: now - progress,
      largeImageKey: IMAGE_KEYS.LOGO,
    } as any)
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

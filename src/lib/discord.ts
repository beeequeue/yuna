import DiscordRPC, { Presence } from 'discord-rpc'
import { ipcMain } from 'electron'
import { error, log } from 'electron-log'

import { DISCORD_PAUSE_WATCHING, DISCORD_SET_WATCHING } from '../messages'

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

const { VUE_APP_DISCORD_ID } = process.env
let discord!: Discord

const generateId = () => Math.round(Math.random() * 100 + 20)

class Discord {
  private discord!: DiscordRPC.Client

  private errored = false

  private activityId: number = -1

  constructor() {
    if (!VUE_APP_DISCORD_ID) {
      this.errored = true

      return
    }

    this.discord = new DiscordRPC.Client({ transport: 'ipc' })

    this.discord.on('ready', () => {
      log(
        `[Discord] Finished initializing: ${
          this.errored ? 'Failed' : 'Successful'
        }`,
      )
    })

    this.discord.login({ clientId: VUE_APP_DISCORD_ID }).catch(() => {
      error('[Discord] Init failed.')

      this.errored = true
    })
  }

  public async setActivity(activity: Presence) {
    if (this.errored) return

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
    if (this.errored) return

    return this.discord.clearActivity()
  }

  public destroy() {
    this.discord.destroy()
  }
}

export const registerDiscord = () => {
  DiscordRPC.register(VUE_APP_DISCORD_ID as string)

  discord = new Discord()

  ipcMain.on(DISCORD_SET_WATCHING, (_: Event, data: WatchingOptions) => {
    discord.setWatching(data)
  })

  ipcMain.on(DISCORD_PAUSE_WATCHING, () => {
    discord.pauseWatching()
  })
}

export const destroyDiscord = () => discord.destroy()

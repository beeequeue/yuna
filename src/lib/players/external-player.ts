import { ChildProcess, spawn } from 'child_process'
import { EventEmitter } from 'events'
import { Store } from 'vuex'

import { sendToast, setCurrentEpisode } from '@/state/app'
import { isNil } from '@/utils'

export interface ExternalMetaData {
  animeId: number
  title: string
}

export enum ExternalPlayerEvent {
  EXITED = 'EXITED',
  PROGRESS = 'PROGRESS',
  FINISHED_EPISODE = 'FINISHED_EPISODE',
  CHANGED_EPISODE = 'CHANGED_EPISODE',
}

export abstract class ExternalPlayer extends EventEmitter {
  protected readonly store: Store<any>

  protected readonly process: ChildProcess

  protected metaData: ExternalMetaData

  protected currentFile: string | null = null

  protected constructor(
    store: Store<any>,
    playerPath: string | null,
    args: string[],
    meta: ExternalMetaData,
  ) {
    super()

    this.store = store

    this.metaData = meta

    if (isNil(playerPath)) {
      throw new Error('Could not start external player!')
    }

    this.process = spawn(playerPath, args)

    this.process.on('error', () => {
      sendToast(this.store, {
        title: "Couldn't start VLC!",
        message: 'Check that the path is correct in the settings!',
        type: 'error',
      })

      this.exit()
    })

    this.process.on('exit', () => {
      this.exit()
    })
  }

  private exit() {
    this.emit(ExternalPlayerEvent.EXITED)

    setCurrentEpisode(this.store, null)
  }

  public close() {
    this.process.kill()
  }
}

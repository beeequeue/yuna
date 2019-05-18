import { ChildProcess, spawn } from 'child_process'
import { EventEmitter } from 'events'
import { Store } from 'vuex'
import { setCurrentEpisode } from '@/state/app'

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
    playerPath: string,
    args: string[],
    meta: ExternalMetaData,
  ) {
    super()

    this.store = store

    this.metaData = meta

    this.process = spawn(playerPath, args)

    this.process.on('exit', () => {
      this.emit(ExternalPlayerEvent.EXITED)

      setCurrentEpisode(store, null)
    })
  }

  public close() {
    this.process.kill()
  }
}

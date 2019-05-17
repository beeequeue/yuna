import { ChildProcess, spawn } from 'child_process'
import { EventEmitter } from 'events'
import { Store } from 'vuex'
import { parse } from 'anitomyscript'
import { setCurrentEpisode } from '@/state/app'

export interface FileMetaData {
  animeId: number
  title: string
  episodeNumber: number
  fileName: string
}

export enum ExternalPlayerEvent {
  EXITED = 'EXITED',
  PROGRESS = 'PROGRESS',
  FINISHED_EPISODE = 'FINISHED_EPISODE',
}

export abstract class ExternalPlayer extends EventEmitter {
  protected readonly process: ChildProcess

  protected readonly fileMetaData: FileMetaData

  protected constructor(
    store: Store<any>,
    playerPath: string,
    args: string[],
    meta: Pick<FileMetaData, 'animeId' | 'title' | 'fileName'>,
  ) {
    super()

    const anitomyResult = parse(meta.fileName)

    this.fileMetaData = {
      ...meta,
      episodeNumber: Number(anitomyResult.episode_number),
    }

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

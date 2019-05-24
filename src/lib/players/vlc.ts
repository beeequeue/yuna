import { existsSync } from 'fs'
import { basename } from 'path'
import * as os from 'os'
import superagent from 'superagent/dist/superagent'
import { Store } from 'vuex'
import { oc } from 'ts-optchain'

import {
  ExternalPlayer,
  ExternalPlayerEvent,
} from '@/lib/players/external-player'
import { VLCStatusReport } from '@/lib/players/vlc.types'
import { sendToast } from '@/state/app'
import { SettingsStore } from '@/state/settings'
import { isNil, isNotNil, NO_OP, RequestSuccess } from '@/utils'

export interface ExternalMetaData {
  animeId: number
  title: string
}

const PLATFORM = os.platform()

const noNulls = <T>(arr: Array<T | null | undefined>): T[] =>
  arr.filter(isNotNil)

const findVLCPath = () => {
  const paths: string[] = [
    '/Applications/VLC.app/Contents/MacOS/VLC',
    '/usr/bin/vlc',
    '/etc/vlc',
    '/usr/bin/X11/vlc',
    'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe',
  ]

  return paths.find(path => existsSync(path)) || null
}

const vlcPath: string | null =
  SettingsStore.get('externalPlayers.vlc') || findVLCPath()

export class VLC extends ExternalPlayer {
  private finished = false

  private readonly checkInterval: number

  private readonly files: string[]

  constructor(store: Store<any>, filePaths: string[], meta: ExternalMetaData) {
    super(
      store,
      vlcPath,
      noNulls([
        '--extraintf=http',
        '--http-host=127.0.0.1',
        '--http-port=9090',
        '--http-password=yuna',
        '--play-and-exit',
        PLATFORM !== 'darwin' ? '--one-instance' : null,
        ...filePaths,
      ]),
      meta,
    )

    this.currentFile = basename(filePaths[0])
    this.files = filePaths.map(path => basename(path))

    this.checkInterval = window.setInterval(() => {
      this.checkStatus()
    }, 1000)

    this.on(ExternalPlayerEvent.EXITED, () => {
      window.clearInterval(this.checkInterval)
    })
  }

  private async checkStatus() {
    let response

    try {
      response = (await superagent
        .get('http://127.0.0.1:9090/requests/status.json')
        .auth('', 'yuna')
        .timeout(500)
        .on('error', NO_OP)) as RequestSuccess<VLCStatusReport>
    } catch (e) {
      return
    }

    const result = JSON.parse(response.text)

    const fileName = VLC.getFileName(result)

    if (fileName !== this.currentFile) {
      if (
        !isNil(fileName) &&
        fileName.length > 0 &&
        !this.files.includes(fileName)
      ) {
        this.close()

        sendToast(this.store, {
          type: 'error',
          title: 'VLC started playing an unknown file',
          message: `Cancelling playback of '${this.metaData.title}'.`,
          timeout: 8000,
        })

        return
      }

      this.currentFile = fileName
      this.finished = false

      this.emit(ExternalPlayerEvent.CHANGED_EPISODE, { fileName })
    }

    if (result.position >= 0.8 && !this.finished) {
      this.finished = true

      this.emit(ExternalPlayerEvent.FINISHED_EPISODE, { fileName })
    }

    if (result.state === 'playing') {
      this.emit(ExternalPlayerEvent.PROGRESS, { progress: result.position })
    }
  }

  private static getFileName(report: VLCStatusReport) {
    return oc(report as any).information.category.meta.filename() || null
  }

  public static getVLCPath = findVLCPath
}

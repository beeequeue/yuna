import { existsSync } from 'fs'
import { basename } from 'path'
import superagent from 'superagent/dist/superagent'
import { Store } from 'vuex'
import { oc } from 'ts-optchain'

import {
  ExternalPlayer,
  ExternalPlayerEvent,
} from '@/lib/players/external-player'
import { VLCStatusReport } from '@/lib/players/vlc.types'
import { NO_OP, RequestSuccess } from '@/utils'
import { sendToast } from '@/state/app'

export interface ExternalMetaData {
  animeId: number
  title: string
}

const findVLCPath = () => {
  const paths: string[] = [
    '/Applications/VLC.app/Contents/MacOS/VLC',
    '/usr/bin/vlc',
    '/etc/vlc',
    '/usr/bin/X11/vlc',
    'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe',
  ]

  return paths.find(path => existsSync(path))
}

const vlcPath = /* SettingsStore.get('vlcPath') || */ findVLCPath()!

export class VLC extends ExternalPlayer {
  private finished = false

  private readonly checkInterval: number

  private readonly files: string[]

  constructor(store: Store<any>, filePaths: string[], meta: ExternalMetaData) {
    super(
      store,
      vlcPath,
      [
        '--extraintf=http',
        '--http-host=127.0.0.1',
        '--http-port=9090',
        '--http-password=yuna',
        '--play-and-exit',
        '--one-instance',
        ...filePaths,
      ],
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
      if (!this.files.includes(fileName)) {
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
}

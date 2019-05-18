import { existsSync } from 'fs'
import { basename } from 'path'
import { parseString } from 'xml2js'
import { parseBooleans, parseNumbers, stripPrefix } from 'xml2js/lib/processors'
import superagent from 'superagent/dist/superagent'
import { Store } from 'vuex'
import { oc } from 'ts-optchain'

import {
  ExternalPlayer,
  ExternalPlayerEvent,
} from '@/lib/players/external-player'
import { isNil, noop } from '@/utils'

interface VLCInfoCategory {
  name: string
  info: any[]
}

interface VLCInfoCategoryMeta extends VLCInfoCategory {
  name: 'meta'
  info: Array<{ name: 'filename' | 'title'; _: string }>
}

interface VLCStatusReport {
  fullscreen: false
  aspectratio: string
  audiodelay: number
  apiversion: number
  currentplid: number
  time: number
  volume: number
  length: number
  random: false
  audiofilters: any
  rate: number
  videoeffects: {
    hue: number
    saturation: number
    contrast: number
    brightness: number
    gamma: number
  }
  state: 'playing' | 'paused'
  loop: true
  version: string
  position: number
  repeat: false
  subtitledelay: number
  equalizer: ''
  information: {
    category: Array<VLCInfoCategory | VLCInfoCategoryMeta>
  }
  stats: {
    lostabuffers: number
    readpackets: number
    lostpictures: number
    demuxreadbytes: number
    demuxbitrate: number
    playedabuffers: number
    demuxcorrupted: number
    sendbitrate: number
    sentbytes: number
    displayedpictures: number
    demuxreadpackets: number
    sentpackets: number
    inputbitrate: number
    demuxdiscontinuity: number
    averagedemuxbitrate: number
    decodedvideo: number
    averageinputbitrate: number
    readbytes: number
    decodedaudio: number
  }
}

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

    this.checkInterval = window.setInterval(() => {
      this.checkStatus()
    }, 1000)

    this.on(ExternalPlayerEvent.EXITED, () => {
      window.clearInterval(this.checkInterval)
    })

    this.on(ExternalPlayerEvent.CHANGED_EPISODE, () => {
      this.finished = false
    })
  }

  private async checkStatus() {
    let response

    try {
      response = await superagent
        .get('http://127.0.0.1:9090/requests/status.xml')
        .auth('', 'yuna')
        .timeout(500)
        .on('error', noop)
    } catch (e) {
      return
    }

    const result = await this.parseStatus(response.text)

    const fileName = VLC.getFileName(result)

    if (fileName !== this.currentFile) {
      this.currentFile = fileName

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
    const simpleResult =
      (oc(report as any).information.category.info._() as string) || null
    if (!isNil(simpleResult)) {
      return simpleResult
    }

    const metaCategory = report.information.category.find<VLCInfoCategoryMeta>(
      (c): c is VLCInfoCategoryMeta => c.name === 'meta',
    )

    const info = oc(metaCategory)
      .info([])
      .find(i => i.name === 'filename')

    return oc(info)._() || null
  }

  private parseStatus(xml: string) {
    return new Promise<VLCStatusReport>(resolve => {
      parseString(
        xml,
        {
          normalize: true,
          explicitRoot: false,
          explicitArray: false,
          mergeAttrs: true,
          attrNameProcessors: [stripPrefix],
          attrValueProcessors: [parseNumbers, parseBooleans],
          valueProcessors: [parseNumbers, parseBooleans],
        },
        (_err, xml) => resolve(xml),
      )
    })
  }
}

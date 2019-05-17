import { existsSync } from 'fs'
import { basename } from 'path'
import { parseString } from 'xml2js'
import { parseBooleans, parseNumbers, stripPrefix } from 'xml2js/lib/processors'
import superagent from 'superagent/dist/superagent'
import { Store } from 'vuex'
import {
  ExternalPlayer,
  ExternalPlayerEvent,
  FileMetaData,
} from '@/lib/players/external-player'

interface StatusReport {
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
    category: any[]
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

  constructor(
    store: Store<any>,
    filePath: string,
    meta: Pick<FileMetaData, 'animeId' | 'title'>,
  ) {
    super(
      store,
      vlcPath,
      [
        '--extraintf=http',
        '--http-host=127.0.0.1',
        '--http-port=9090',
        '--http-password=yuna',
        filePath,
      ],
      {
        ...meta,
        fileName: basename(filePath),
      },
    )

    this.checkInterval = window.setInterval(() => {
      this.checkStatus()
    }, 1000)

    this.on(ExternalPlayerEvent.EXITED, () => {
      window.clearInterval(this.checkInterval)
    })
  }

  private async checkStatus() {
    const response = await superagent
      .get('http://127.0.0.1:9090/requests/status.xml')
      .auth('', 'yuna')
      .timeout(500)

    const result = await this.parseStatus(response.text)

    if (result.position >= 0.8 && !this.finished) {
      const { episodeNumber, animeId } = this.fileMetaData

      this.finished = true

      this.emit(ExternalPlayerEvent.FINISHED_EPISODE, {
        animeId,
        episodeNumber,
      })
    }

    if (result.state === 'playing') {
      this.emit(ExternalPlayerEvent.PROGRESS, { progress: result.position })
    }
  }

  private parseStatus(xml: string) {
    return new Promise<StatusReport>(resolve => {
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

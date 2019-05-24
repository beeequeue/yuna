export interface VLCMeta {
  _STATISTICS_WRITING_APP: string
  CREATION_TIME: string
  BPS: string
  NUMBER_OF_BYTES: string
  filename: string
  _STATISTICS_TAGS: string
  DURATION: string
  NUMBER_OF_FRAMES: string
  ENCODER: string
  _STATISTICS_WRITING_DATE_UTC: string
}

interface VLCVideoStream {
  Type: 'Video'
  Decoded_format: string
  Color_transfer_function: string
  Video_resolution: string
  Orientation: string
  Color_space: string
  Color_primaries: string
  Buffer_dimensions: string
  Frame_rate: string
  Codec: string
}

interface VLCSubtitleStream {
  Type: 'Subtitle'
  Description: string
  Language: string
  Codec: string
}

interface VLCAudioStream {
  Type: 'Audio'
  Description: string
  Language: string
  Codec: string
  Sample_rate: string
}

export interface VLCStatusReport {
  fullscreen: false
  stats: {
    inputbitrate: number
    sentbytes: number
    lostabuffers: number
    averagedemuxbitrate: number
    readpackets: number
    demuxreadpackets: number
    lostpictures: number
    displayedpictures: number
    sentpackets: number
    demuxreadbytes: number
    demuxbitrate: number
    playedabuffers: number
    demuxdiscontinuity: number
    decodedaudio: number
    sendbitrate: number
    readbytes: number
    averageinputbitrate: number
    demuxcorrupted: number
    decodedvideo: number
  }
  aspectratio: string
  audiodelay: number
  apiversion: number
  currentplid: number
  time: number
  volume: number
  length: number
  random: false
  audiofilters: {
    filter_number: string
  }
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
  information: {
    chapter: number
    chapters: number[]
    title: number
    category: {
      [key: string]:
        | VLCMeta
        | VLCVideoStream
        | VLCSubtitleStream
        | VLCAudioStream
        | undefined
    }
    titles: number[]
  }
  repeat: false
  subtitledelay: number
  equalizer: []
}

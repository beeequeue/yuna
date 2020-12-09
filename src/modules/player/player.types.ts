import { Levels } from "@/types"

export type PlayerState = {
  streamUrl: string | null
  levels: Levels | null

  loading: boolean
  loaded: boolean
  loadProgress: {
    percent: number
    seconds: number
  }

  initiated: boolean
  ended: boolean
  softEnded: boolean // Gotten to the 'soft end' - e.g. 80% of the way
  paused: boolean
  playhead: number // Where to start playing
  duration: number
  progress: {
    percent: number
    seconds: number
  }

  lastScrobble: number
  lastHeartbeat: number

  muted: boolean
  volume: number
  speed: number
  quality: string
}

import { Response } from 'superagent'
import { Prop as IProp, PropOptions } from 'vue/types/options'
import { MediaListStatus } from '@/graphql-types'

export interface RequestSuccess<B extends object> extends Response {
  status: 200
  ok: true
  body: B
}

export interface RequestError<B extends object> extends Response {
  status: 200 | 400 | 401 | 404 | 500 | 502
  ok: false
  body: B
}

export const secondsToTimeString = (input: number) => {
  const minutes = Math.floor(input / 60)
  const seconds = input - minutes * 60

  return `${minutes < 10 ? '0' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`
}

export const prop = (type: IProp<any>, required?: boolean): PropOptions => ({
  type,
  required: !!required,
})

interface MediaListEntry {
  status: MediaListStatus | null
  progress: number | null
}
export const humanizeMediaListStatus = (
  entry: MediaListEntry,
  episodes: number,
) => {
  switch (entry.status) {
    case MediaListStatus.COMPLETED:
      return 'Completed'
    case MediaListStatus.CURRENT:
      return `Watching ${entry.progress || 0}/${episodes}`
    case MediaListStatus.DROPPED:
      return `Dropped ${entry.progress || 0}/${episodes}`
    case MediaListStatus.PAUSED:
      return `Paused ${entry.progress || 0}/${episodes}`
    case MediaListStatus.PLANNING:
      return 'Planning'
    case MediaListStatus.REPEATING:
      return `Repeating ${entry.progress || 0}/${episodes}`
    default:
      return 'Error'
  }
}

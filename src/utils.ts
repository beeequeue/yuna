import electron from 'electron'
import { api } from 'electron-util'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { filter, isNil, map, path, pathEq, pathOr } from 'rambdax'
import { Response } from 'superagent'
import uuid from 'uuid/v4'
import { resolve } from 'path'
import {
  mdiCheckboxMarked,
  mdiCheckboxMarkedCircleOutline,
  mdiClock,
  mdiClockOutline,
  mdiClose,
  mdiCloseCircleOutline,
  mdiPause,
  mdiPauseCircleOutline,
  mdiRepeat,
} from '@mdi/js'

import {
  AnimePageQueryQuery,
  EpisodeListEpisodes,
  MediaListStatus,
  MediaRelation,
  PlayerAnimeQuery,
} from '@/graphql/types'
import { StreamingSource } from '@/types'
import Filter = Electron.Filter

const noop = () => {
  /* no-op */
}

export interface RequestSuccess<B extends object> extends Response {
  status: 200
  ok: true
  body: B
}

export interface RequestError<B extends object> extends Response {
  status: 200 | 400 | 401 | 404 | 500 | 502 | 429
  ok: false
  body: B
}

export type RequestResponse<D extends object = any, E extends object = any> =
  | RequestSuccess<D>
  | RequestError<E>

export const responseIsError = (
  res: RequestResponse | null,
): res is RequestError<any> | null => {
  if (!res) return true

  return path('body.error', res) != null || path<boolean>('error', res)
}

export const secondsToTimeString = (input: number) => {
  const minutes = Math.floor(input / 60)
  const seconds = input - minutes * 60

  return `${minutes < 10 ? '0' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`
}

interface MediaListEntry {
  status: MediaListStatus | null
  progress: number | null
}
export const humanizeMediaListStatus = (
  entry: MediaListEntry,
  episodes: number | null,
) => {
  const lengthString = episodes || '?'

  switch (entry.status) {
    case MediaListStatus.Completed:
      return 'Completed'
    case MediaListStatus.Current:
      return `Watching ${entry.progress || 0}/${lengthString}`
    case MediaListStatus.Dropped:
      return `Dropped ${entry.progress || 0}/${lengthString}`
    case MediaListStatus.Paused:
      return `Paused ${entry.progress || 0}/${lengthString}`
    case MediaListStatus.Planning:
      return 'Planning'
    case MediaListStatus.Repeating:
      return `Repeating ${entry.progress || 0}/${lengthString}`
    default:
      throw new Error(`Tried to humanize an unknown status: ${entry.status}`)
  }
}

export const getIconForStatus = (
  status: MediaListStatus | null,
  circled = false,
) => {
  if (isNil(status)) return null

  switch (status) {
    case MediaListStatus.Completed:
      return circled ? mdiCheckboxMarkedCircleOutline : mdiCheckboxMarked
    case MediaListStatus.Current:
      return null
    case MediaListStatus.Dropped:
      return circled ? mdiCloseCircleOutline : mdiClose
    case MediaListStatus.Paused:
      return circled ? mdiPauseCircleOutline : mdiPause
    case MediaListStatus.Planning:
      return circled ? mdiClockOutline : mdiClock
    case MediaListStatus.Repeating:
      return mdiRepeat
  }
}

export const deviceUuidFilePath = resolve(
  api.app.getPath('userData'),
  '.device',
)

export const getDeviceUuid = (): string => {
  if (existsSync(deviceUuidFilePath)) {
    return readFileSync(deviceUuidFilePath).toString()
  }

  const newUuid = uuid()
  writeFileSync(deviceUuidFilePath, newUuid)

  return newUuid
}

export const generateId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890'
  let id = ''

  for (let i = 0; i < 8; i++) {
    id += chars[Math.round(Math.random() * chars.length - 1)]
  }

  return id
}

export const hasKey = (obj: any, value: any) => Object.keys(obj).includes(value)

export const clamp = (x: number, min: number, max: number) =>
  Math.max(min, Math.min(x, max))

export const enumToArray = <E>(Enum: E): E[] => Object.values(Enum)

export const enumKeysToArray = <E>(Enum: E): Array<keyof E> =>
  Object.keys(Enum) as any

export const capitalize = (str: string) => {
  let words = str.split(' ')

  words = words.map(word => {
    const first = word.slice(0, 1).toUpperCase()
    return first + word.slice(1).toLowerCase()
  })

  return words.join(' ')
}

export const isOfType = <T>(
  obj: any,
  ...properties: Array<keyof T>
): obj is T => properties.every(p => !isNil(obj[p]))

export const isOfTypename = <T extends { __typename?: string }>(
  obj: any,
  typename: T['__typename'],
): obj is T => obj.__typename === typename

// eslint-disable-next-line array-type
export const arrayIsOfType = <T>(
  arr: any[],
  ...properties: Array<keyof T>
): arr is T[] =>
  Array.isArray(arr) && arr.every(item => isOfType<any>(item, ...properties))

export const getEpisodeCacheKey = (ep: EpisodeListEpisodes) =>
  `Episode:${ep.provider}:${ep.id}`

// eslint-disable-next-line no-shadowed-variable
export const removeCookies = (filter: Filter) => {
  if (!electron.remote.session.defaultSession) {
    // eslint-disable-next-line no-console
    return console.warn(
      `Could not get default session when deleting cookie.\n${filter}`,
    )
  }

  const { cookies } = electron.remote.session.defaultSession

  cookies.get(filter, (err, cooks) => {
    if (err) throw new Error(err.message)

    cooks.forEach(cookie => {
      if (!cookie.domain) return

      const prefix = cookie.domain.includes('crunchyroll') ? 'api.' : ''
      const url = 'https://' + prefix + cookie.domain.replace(/^\./, '')

      cookies.remove(url, cookie.name, noop)
    })
  })
}

export const getRelations = (
  data: AnimePageQueryQuery | PlayerAnimeQuery,
  type: string | MediaRelation,
) => {
  const relations = pathOr<any[]>([], ['anime', 'relations', 'edges'], data)

  if (relations.length < 1) return []

  return map(
    pathOr(null, ['node']),
    filter(pathEq('relationType', type), relations),
  )
}

interface ExternalLink {
  site: string
  url: string
}

const streamingSites = enumKeysToArray(StreamingSource)
const isStreamingSource = (link: ExternalLink) =>
  streamingSites.includes(link.site as any)
export const getStreamingSources = (sources: ExternalLink[]) =>
  sources.filter(isStreamingSource)

export const sortNumber = (a: number, b: number) => a - b

export const humanizeNumberList = (list: number[]) => {
  list = list.sort(sortNumber)

  let str = `${list[0]}`
  let lastNum: number = list[0]

  list.forEach((n, i) => {
    if (i === 0 || n === lastNum) return

    if (n !== lastNum + 1) {
      str += ` - ${lastNum}, ${n}`
    } else if (n === list[list.length - 1]) {
      str += ` - ${n}`
    }

    lastNum = n
  })

  return str
}

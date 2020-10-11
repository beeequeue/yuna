import { session } from 'electron'
import { api } from 'electron-util'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { HTTPError, Response } from 'superagent'
import { v4 as uuid } from 'uuid'
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
  AnimeViewQuery,
  EpisodeListEpisodes,
  MediaListStatus,
  MediaRelation,
  PlayerAnimeQuery,
  Provider,
} from '@/graphql/generated/types'
import { StreamingSource } from '@/types'
import CookiesGetFilter = Electron.CookiesGetFilter

export const NO_OP = () => {
  /* no-op */
}

export type RequestSuccess<B extends {} | null> = {
  status: 200 | 204
  ok: true
  body: B
} & Response

export type RequestError<B extends object | null> = {
  status: 200 | 400 | 401 | 404 | 500 | 502 | 429
  ok: false
  body: B
  error: HTTPError
} & Response

export type RequestResponse<D extends object = any, E extends object = any> =
  | RequestSuccess<D>
  | RequestError<E>

export const responseIsError = (
  res: RequestResponse | null,
): res is RequestError<any> | null => {
  if (!res) return true

  return !!(res as any)?.body?.error || !!res?.error
}

const add0ToNumber = (num: number) => num.toString().replace(/^(\d)$/, '0$1')

export const secondsToTimeString = (input: number) => {
  const minutes = Math.floor(input / 60)
  const seconds = input % 60

  return `${add0ToNumber(minutes)}:${add0ToNumber(seconds)}`
}

type MediaListEntry = {
  status: MediaListStatus | null
  progress: number | null
}
export const humanizeMediaListStatus = (
  entry: MediaListEntry,
  episodes: number | null | false,
) => {
  const lengthString = episodes || '?'
  const progressString =
    episodes !== false ? ` ${entry.progress || 0}/${lengthString}` : ''

  switch (entry.status) {
    case MediaListStatus.Completed:
      return 'Completed'
    case MediaListStatus.Current:
      return `Watching${progressString}`
    case MediaListStatus.Dropped:
      return `Dropped${progressString}`
    case MediaListStatus.Paused:
      return `Paused${progressString}`
    case MediaListStatus.Planning:
      return 'Planning'
    case MediaListStatus.Repeating:
      return `Repeating${progressString}`
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

export const arrayIsOfType = <T>(
  arr: any[],
  ...properties: Array<keyof T>
): arr is T[] =>
  Array.isArray(arr) && arr.every(item => isOfType<any>(item, ...properties))

export const getEpisodeCacheKey = (ep: EpisodeListEpisodes) =>
  `Episode:${ep.provider}:${ep.id}`

export const removeCookies = async (filter: CookiesGetFilter) => {
  if (isNil(session)) return

  if (!session.defaultSession) {
    // eslint-disable-next-line no-console
    return console.warn(
      `Could not get default session when deleting cookie.\n${filter}`,
    )
  }

  const cookies = await session.defaultSession.cookies.get(filter)

  cookies.forEach(cookie => {
    if (!cookie.domain) return

    const prefix = cookie.domain.includes('crunchyroll') ? 'api.' : ''
    const url = 'https://' + prefix + cookie.domain.replace(/^\./, '')

    session.defaultSession.cookies.remove(url, cookie.name)
  })
}

export const getRelations = (
  data: AnimeViewQuery | PlayerAnimeQuery,
  type: string | MediaRelation,
) => {
  const relations = data.anime?.relations?.edges ?? []

  if (relations.length < 1) return []

  const filtered = relations
    .filter(isNotNil)
    .filter(propEq('relationType', type as MediaRelation))

  return filtered.map(relation => relation?.node)
}

type ExternalLink = {
  site: string
  url?: string
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

export const delay = async (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const stripFalsy = <T extends any>(arr: T[]) =>
  arr.filter(item => !!item)

export const isCrunchyroll = (provider: Provider) =>
  [Provider.CrunchyrollManual, Provider.Crunchyroll].includes(provider)

// Ramda replacements
export const T = () => true

export const prop = <O extends {}, P extends keyof O>(prop: P) => (obj: O) =>
  obj[prop]

export const propEq = <O extends {}, P extends keyof O>(
  prop: P,
  value: O[P],
) => (obj: O) => obj[prop] === value

export const lastItem = <T>(arr: T[]) => {
  if (arr.length < 1) return null

  return arr[arr.length - 1]
}

export const pluck = <K extends keyof T, T extends {}>(key: K, objArray: T[]) =>
  objArray.map(obj => obj[key])

export const isNil = <T>(
  variable: T | null | undefined,
): variable is null | undefined => variable === null || variable === undefined

export const isNotNil = <T>(variable: T | null | undefined): variable is T =>
  !isNil(variable)

export const itemsAreNotNil = <T>(
  arr: Array<T | null | undefined>,
): arr is T[] => !arr.some(isNil)

export const complement = (fn: (...a: any[]) => any) => (input: any) =>
  !fn(input)

export const mapAsync = async <T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
) => {
  const promises = items.map(fn)

  return await Promise.all(promises)
}

export const anyPass = <
  P,
  F extends Array<(item: P, index?: number, array?: P[]) => boolean>
>(
  item: P,
  predicates: F,
) => predicates.some(predicate => predicate(item))

export const pick = <T extends {}, K extends Array<keyof T>>(
  obj: T,
  keys: K,
): Pick<T, K[number]> =>
  Object.entries(obj)
    .filter(([key]) => keys.includes(key as keyof T))
    .reduce<Pick<T, K[number]>>(
      (obj, [key, val]) => Object.assign(obj, { [key]: val }),
      {} as any,
    )

export const omit = <T extends {}, K extends Array<keyof T>>(
  obj: T,
  keys: K,
): Omit<T, K[number]> =>
  Object.entries(obj)
    .filter(([key]) => !keys.includes(key as any))
    .reduce<Pick<T, K[number]>>(
      (obj, [key, val]) => Object.assign(obj, { [key]: val }),
      {} as any,
    )

export const debounce = <P extends Array<any>>(
  func: (...a: P) => any,
  ms: number,
  immediate = false,
) => {
  let timeout: number | NodeJS.Timeout | null = null

  return (...input: P) => {
    const later = function () {
      timeout = null
      if (!immediate) {
        func(...input)
      }
    }

    clearTimeout(timeout as any)
    timeout = setTimeout(later, ms)

    const callNow = immediate && !timeout
    if (callNow) {
      func(...input)
    }
  }
}

export const countdown = (
  seconds: number,
  fn: (secondsLeft: number) => void,
) => {
  let _seconds = seconds

  fn(_seconds)

  const interval = setInterval(() => {
    _seconds--

    if (_seconds < 0) {
      clearInterval(interval)
      return
    }

    fn(_seconds)
  }, 1000)
}

export const px = (num: number) => `${num}px`

import electron from 'electron'
import { api } from 'electron-util'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { Response } from 'superagent'
import { oc } from 'ts-optchain'
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
  AnimeViewQuery,
  EpisodeListEpisodes,
  MediaListStatus,
  MediaRelation,
  PlayerAnimeQuery,
  Provider,
} from '@/graphql/types'
import { StreamingSource } from '@/types'
import Filter = Electron.Filter
import { ActionContext, Store } from 'vuex'
import { getIsConnectedTo } from '@/state/auth'

export const NO_OP = () => {
  /* no-op */
}

export interface RequestSuccess<B extends object> extends Response {
  status: 200
  ok: true
  body: B
}

export interface RequestError<B extends object | null> extends Response {
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

  return !!(oc(res) as any).body.error() || !!oc(res).error()
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

      cookies.remove(url, cookie.name, NO_OP)
    })
  })
}

export const getRelations = (
  data: AnimeViewQuery | PlayerAnimeQuery,
  type: string | MediaRelation,
) => {
  const relations = oc(data).anime.relations.edges([])!

  if (relations.length < 1) return []

  const filtered = relations
    .filter(isNotNil)
    .filter(propEq('relationType', type as MediaRelation))

  return filtered.map(relation => oc(relation).node(null))
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

export const delay = async (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const stripFalsy = <T extends any>(arr: T[]) =>
  arr.filter(item => !!item)

const addIfExistsAndIsConnected = (
  store: Store<any> | ActionContext<any, any>,
  provider: Provider,
  source: StreamingSource,
  sources: string[],
): Provider => {
  // Since enums are lowercase
  const lowercaseSources = sources.map(str => str.toLowerCase())
  const isConnectedToProvider: boolean = (getIsConnectedTo as any)(store)[
    provider.toLowerCase()
  ]

  return isConnectedToProvider && lowercaseSources.includes(source)
    ? provider
    : (false as any)
}

interface _Anime {
  id: number
  externalLinks: null | Array<null | { site: string; url: string }>
}
export const getDefaultProvider = (
  store: Store<any> | ActionContext<any, any>,
  anime: _Anime,
) => {
  const links = oc(anime).externalLinks([])

  if (isNil(links)) return Provider.Crunchyroll

  const sources = getStreamingSources(links.filter(isNotNil)).map(
    source => source.site,
  )

  const supportedProviders = [
    addIfExistsAndIsConnected(
      store,
      Provider.Crunchyroll,
      StreamingSource.Crunchyroll,
      sources,
    ),
    addIfExistsAndIsConnected(
      store,
      Provider.Hidive,
      StreamingSource.Hidive,
      sources,
    ),
  ]

  return stripFalsy(supportedProviders)[0] || Provider.Crunchyroll
}

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

export const complement = (fn: (...a: any[]) => any) => (input: any) =>
  !fn(input)

export const mapAsync = async <T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
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
    .filter(([key]) => keys.includes(key as any))
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
  let timeout: number | null = null

  return (...input: P) => {
    const later = function() {
      timeout = null
      if (!immediate) {
        func.apply(null, input)
      }
    }

    window.clearTimeout(timeout!)
    timeout = window.setTimeout(later, ms)

    const callNow = immediate && !timeout
    if (callNow) {
      func.apply(null, input)
    }
  }
}

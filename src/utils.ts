import { error } from 'electron-log'
import { path } from 'rambdax'
import { Response } from 'superagent'
import { Prop as IProp, PropOptions } from 'vue/types/options'
import { ActionContext, Store } from 'vuex'
import uuid from 'uuid/v4'
import { resolve } from 'path'

import { MediaListStatus } from '@/graphql-types'
import {
  createSession,
  createUnblockedSession,
  SessionResponse,
} from '@/lib/crunchyroll'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { api } from 'electron-util'
import { getSettings } from '@/state/settings'

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
  res: RequestResponse,
): res is RequestError<any> => {
  return path('body.error', res) != null || path<boolean>('error', res)
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
  episodes: number | null,
) => {
  const lengthString = episodes || '?'

  switch (entry.status) {
    case MediaListStatus.COMPLETED:
      return 'Completed'
    case MediaListStatus.CURRENT:
      return `Watching ${entry.progress || 0}/${lengthString}`
    case MediaListStatus.DROPPED:
      return `Dropped ${entry.progress || 0}/${lengthString}`
    case MediaListStatus.PAUSED:
      return `Paused ${entry.progress || 0}/${lengthString}`
    case MediaListStatus.PLANNING:
      return 'Planning'
    case MediaListStatus.REPEATING:
      return `Repeating ${entry.progress || 0}/${lengthString}`
    default:
      throw new Error(`Tried to humanize an unknown status: ${entry.status}`)
  }
}

export const createBothSessions = async (
  store: Store<any> | ActionContext<any, any>,
) => {
  let data: SessionResponse | null = null

  if (getSettings(store).useCRUnblocker) {
    try {
      data = await createUnblockedSession()
    } catch (e) {
      error(e)
      store.dispatch('app/sendErrorToast', 'Could not create US session. 😞', {
        root: true,
      })
    }
  }

  if (data == null) {
    data = await createSession()
  }

  return data
}

export const finishedSetupFilePath = resolve(
  api.app.getPath('userData'),
  '.has-setup',
)

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

export const enumToArray = <T>(Enum: any): T[] =>
  Object.keys(Enum).map(key => Enum[key])

export const bigFirstChar = (str: string) => {
  const first = str.slice(0, 1).toUpperCase()
  return first + str.slice(1).toLowerCase()
}

import superagent from 'superagent'
import { T } from 'rambdax'

import { getDeviceUuid } from '@/utils'

import { version } from '../../package.json'

// Constants
const url = 'https://google-analytics.com/collect'
const deviceId = getDeviceUuid()

const constants = {
  v: 1,
  tid: process.env.GA_ID as string,
  aip: true,
  cid: deviceId,
  an: 'yuna',
  av: version,
  dt: 'Yuna',
  dh: 'app.yuna.moe',
}

export enum Page {
  PLAYER = 'player',
  DASHBOARD = 'dashboard',
  ANIME = 'anime',
  FIRST_TIME_SETUP = 'first-time-setup',
  LIST = 'list',
  LOGIN = 'login',
  QUEUE = 'queue',
  SETTINGS = 'settings',
}

type Data = typeof constants &
  (
    | { t: 'pageview'; dp?: string }
    | {
        t: 'event'
        ec: string
        ea: string
        el?: string
        ev?: number
        dp?: string
      })

const send = async (data: Data) => {
  if (process.env.NODE_ENV !== 'production' || !process.env.GA_ID) return

  return superagent
    .post(url)
    .type('form')
    .send(data)
    .ok(T)
}

export const trackPageView = (
  name: Page,
  animeId?: number,
  animeName?: string,
) => {
  if (animeName) {
    animeName = animeName
      .toLowerCase()
      .replace(/[^A-Za-z0-9 _]/g, '')
      .replace(/[ ]/g, '_')

    if (animeName.split('_').length > 10) {
      animeName = animeName.split('_', 10).join('_')
    }

    if (animeName.length > 50) {
      animeName = animeName.substr(0, 50) + '-'
    }
  }

  return send({
    ...constants,
    t: 'pageview',
    dp:
      name +
      (animeId ? `/${animeId}` : '') +
      (animeName ? `?name=${animeName}` : ''),
  })
}

export const trackStillWatching = () => {
  send({
    ...constants,
    t: 'event',
    ec: 'player',
    ea: 'heartbeat',
    dp: Page.PLAYER,
  })
}

import superagent from 'superagent'

import { getConfig } from '@/config'
import { getDeviceUuid, T } from '@/utils'

import { version } from '../../package.json'

// Constants
const url = 'https://google-analytics.com/collect'
const deviceId = getDeviceUuid()

const constants = {
  v: 1,
  tid: getConfig('GA_ID'),
  aip: true,
  cid: deviceId,
  an: 'yuna',
  aid: 'app.yuna.moe',
  av: version,
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
    | { t: 'screenview'; cd?: string }
    | {
        t: 'event'
        ec: string
        ea: string
        el?: string
        ev?: number
        cd?: string
      })

const send = async (data: Data) => {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

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
    t: 'screenview',
    cd:
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
    cd: Page.PLAYER,
  })
}
